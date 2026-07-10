import dotenv from 'dotenv';

import {
  fetchCasinoData as fetchCasinoDataApi,
  fetchMatchData,
  fetchProviderCMatchMarkets,
  isProviderCPremiumFancyMarket,
} from '../services/matchApi/index.js';
import { unwrapMatchMarkets } from '../services/matchApi/hybridMatchData.js';

dotenv.config();

const SPORT_NAME_TO_APITYPE = {
  cricket: 'cricket',
  'cricket game': 'cricket',
  tennis: 'tennis',
  'tennis game': 'tennis',
  soccer: 'soccer',
  'soccer game': 'soccer',
  'horse racing': 'horse-racing',
};

const API_MARKET_ALIASES = {
  'Match Odds': 'MATCH_ODDS',
  'Tied Match': 'TIED_MATCH',
  Bookmaker: 'BOOKMAKER',
  'Bookmaker IPL CUP': 'BOOKMAKER_IPL_CUP',
  MATCH_ODDS: 'Match Odds',
  TIED_MATCH: 'Tied Match',
  BOOKMAKER: 'Bookmaker',
  BOOKMAKER_IPL_CUP: 'Bookmaker IPL CUP',
};

function isBookmakerMarket(market) {
  const key = String(
    market?.mname || market?.name || market?.mtype || ''
  ).toLowerCase();
  return key.includes('bookmaker');
}

function isPlayableGstatus(gstatus) {
  const s = String(gstatus ?? '')
    .trim()
    .toUpperCase();
  return !s || s === 'ACTIVE' || s === 'OPEN';
}

/** Bookmaker feeds often set market.status=SUSPENDED while rows stay ACTIVE with live odds. */
function isMarketSuspendedForBet(market, teamSection = null) {
  if (isBookmakerMarket(market)) {
    if (teamSection) {
      return !isPlayableGstatus(teamSection.gstatus || teamSection.status);
    }
    const sections = market.section || [];
    if (
      sections.some(
        (sec) =>
          isPlayableGstatus(sec.gstatus || sec.status) &&
          sec.odds?.some((o) => parseFloat(o.odds) > 0)
      )
    ) {
      return false;
    }
  }

  return market.status === 'SUSPENDED' || market.gstatus === 'SUSPENDED';
}

function findMarketByName(markets, marketName) {
  return markets.find((m) => {
    const mname = m.mname || m.name || '';
    const mtype = m.mtype || '';
    return (
      mname === marketName ||
      mtype === marketName ||
      mname === API_MARKET_ALIASES[marketName] ||
      mtype === API_MARKET_ALIASES[marketName] ||
      API_MARKET_ALIASES[mname] === marketName ||
      API_MARKET_ALIASES[mtype] === marketName
    );
  });
}

const BET_VALIDATE_TIMEOUT_MS = Number(
  process.env.BET_VALIDATE_TIMEOUT_MS || 4000
);
const BET_VALIDATE_CACHE_OK_MS = Number(
  process.env.BET_VALIDATE_CACHE_OK_MS || 2500
);
const BET_VALIDATE_CACHE_FALLBACK_MS = Number(
  process.env.BET_VALIDATE_CACHE_FALLBACK_MS || 10000
);
/** @deprecated use BET_VALIDATE_CACHE_OK_MS */
const MAX_CACHE_AGE_MS = BET_VALIDATE_CACHE_OK_MS;

function withBetValidateTimeout(promise, ms = BET_VALIDATE_TIMEOUT_MS) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('bet-validate-timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Match Odds / Bookmaker validation: use poll cache when fresh; otherwise
 * fetchMatchData only (never premium fancy — that hung place-bet).
 */
async function fetchFreshSportsData(cachedData, gameId, apitype, sid) {
  const cacheKey = `${gameId}_${apitype}`;
  const cacheEntry = cachedData[cacheKey];
  const now = Date.now();

  if (
    cacheEntry?.lastUpdated &&
    now - cacheEntry.lastUpdated <= BET_VALIDATE_CACHE_OK_MS &&
    Array.isArray(cacheEntry.data) &&
    cacheEntry.data.length > 0
  ) {
    return { ok: true, markets: cacheEntry.data };
  }

  try {
    const newData = await withBetValidateTimeout(fetchMatchData(gameId, sid));
    const markets = unwrapMatchMarkets(newData);

    if (!newData?.success || !Array.isArray(markets) || markets.length === 0) {
      if (
        cacheEntry?.lastUpdated &&
        now - cacheEntry.lastUpdated <= BET_VALIDATE_CACHE_FALLBACK_MS &&
        Array.isArray(cacheEntry.data) &&
        cacheEntry.data.length > 0
      ) {
        return { ok: true, markets: cacheEntry.data };
      }
      return {
        ok: false,
        reason: 'Unable to verify live odds. Please try again.',
      };
    }

    cachedData[cacheKey] = {
      data: markets,
      premiumFancy: cacheEntry?.premiumFancy || [],
      providerCGameId: cacheEntry?.providerCGameId ?? null,
      raw: newData,
      lastUpdated: Date.now(),
    };

    return { ok: true, markets };
  } catch (err) {
    const age = cacheEntry?.lastUpdated
      ? Date.now() - cacheEntry.lastUpdated
      : Infinity;
    if (
      age <= BET_VALIDATE_CACHE_FALLBACK_MS &&
      Array.isArray(cacheEntry?.data) &&
      cacheEntry.data.length > 0
    ) {
      console.warn(
        `[BET VALIDATE] Using cache for gameId=${gameId} after: ${err.message}`
      );
      return { ok: true, markets: cacheEntry.data };
    }

    return {
      ok: false,
      reason:
        err.message === 'bet-validate-timeout'
          ? 'Odds check timed out. Please try again.'
          : 'Unable to verify live odds. Please try again.',
    };
  }
}

async function fetchFreshCasinoData(cachedData, gameId) {
  const cacheKey = `betting_${gameId}_casino`;

  try {
    const newData = await fetchCasinoDataApi(gameId);

    if (!newData?.success || !newData.data) {
      return {
        ok: false,
        reason: 'Unable to verify live casino odds. Please try again.',
      };
    }

    cachedData[cacheKey] = {
      data: newData.data,
      raw: newData,
      lastUpdated: Date.now(),
    };

    return { ok: true, data: newData.data };
  } catch (err) {
    const cacheEntry = cachedData[cacheKey];
    const now = Date.now();
    if (
      cacheEntry?.lastUpdated &&
      now - cacheEntry.lastUpdated <= 500 &&
      cacheEntry.data
    ) {
      return { ok: true, data: cacheEntry.data };
    }

    return {
      ok: false,
      reason: 'Unable to verify live casino odds. Please try again.',
    };
  }
}

/**
 * Validate sports bet against live market data.
 * ALWAYS fetches fresh from API — never relies on stale polling cache.
 *
 * @param {object} cachedData - shared cache object from bettingSocket
 * @param {object} params - { gameId, gameName, marketName, teamName, xValue, otype, sid, oname }
 * @returns {{ valid: boolean, reason?: string, currentOdds?: number }}
 */
export async function validateSportsMarket(
  cachedData,
  { gameId, gameName, marketName, teamName, xValue, otype, sid, oname }
) {
  const apitype = SPORT_NAME_TO_APITYPE[gameName?.toLowerCase()] || 'cricket';

  const freshResult = await fetchFreshSportsData(
    cachedData,
    gameId,
    apitype,
    sid
  );
  if (!freshResult.ok) {
    return { valid: false, reason: freshResult.reason };
  }

  const markets = freshResult.markets;

  const market = findMarketByName(markets, marketName);

  if (!market) {
    return {
      valid: false,
      reason: 'Market not found in live data. Please try again.',
    };
  }

  if (!market.section || !Array.isArray(market.section)) {
    return {
      valid: false,
      reason: 'Market data unavailable. Please try again.',
    };
  }

  const normalizedTeam = (teamName || '').trim().toLowerCase();
  const teamSection = market.section.find((sec) => {
    const nat = (sec.nat || '').trim().toLowerCase();
    return nat === normalizedTeam || nat.startsWith(normalizedTeam + ' (');
  });

  if (!teamSection) {
    return {
      valid: false,
      reason: 'Selection not found in live data. Please try again.',
    };
  }

  if (isMarketSuspendedForBet(market, teamSection)) {
    return { valid: false, reason: 'Market is suspended. Bet not accepted.' };
  }

  if (
    teamSection.gstatus === 'SUSPENDED' ||
    teamSection.status === 'SUSPENDED'
  ) {
    return {
      valid: false,
      reason: 'Selection is suspended. Bet not accepted.',
    };
  }

  if (!teamSection.odds || !Array.isArray(teamSection.odds)) {
    return {
      valid: false,
      reason: 'Odds data unavailable. Please try again.',
    };
  }

  const userOdds = parseFloat(xValue);
  let liveOddsObj = oname
    ? teamSection.odds.find((o) => o.oname === oname)
    : null;
  if (!liveOddsObj) {
    liveOddsObj = teamSection.odds.find(
      (o) => o.otype === otype && o.tno === 0
    );
  }
  if (!liveOddsObj) {
    const primaryName =
      String(otype || '').toLowerCase() === 'lay' ? 'lay1' : 'back1';
    liveOddsObj = teamSection.odds.find((o) => o.oname === primaryName);
  }
  if (!liveOddsObj && Array.isArray(teamSection.odds)) {
    const sameSide = teamSection.odds.filter(
      (o) =>
        String(o.otype || '').toLowerCase() ===
        String(otype || '').toLowerCase()
    );
    liveOddsObj =
      sameSide.find((o) => Math.abs(parseFloat(o.odds) - userOdds) <= 0.01) ||
      sameSide[0];
  }
  const liveOdds = liveOddsObj ? parseFloat(liveOddsObj.odds) : null;

  if (liveOdds === null || isNaN(liveOdds) || liveOdds <= 0) {
    return {
      valid: false,
      reason: 'Unable to verify current odds. Please try again.',
    };
  }

  if (Math.abs(userOdds - liveOdds) > 0.01) {
    return {
      valid: false,
      reason: `Odds changed. Current: ${liveOdds.toFixed(2)}. Please re-select.`,
      currentOdds: liveOdds,
    };
  }

  return {
    valid: true,
    marketMeta: {
      mid: market.mid || null,
      gmid: market.gmid || null,
      runners: (market.section || []).map((sec) => ({
        selectionId: sec.sid,
        selectionName: (sec.nat || '').trim(),
      })),
    },
  };
}

/**
 * Validate fancy bet against live market data.
 *
 * @param {object} cachedData - shared cache object from bettingSocket
 * @param {object} params - { gameId, gameName, marketName, teamName, xValue, otype, sid, fancyScore, oname }
 * @returns {{ valid: boolean, reason?: string, currentOdds?: number }}
 */
export async function validateFancyMarket(
  cachedData,
  {
    gameId,
    gameName,
    marketName,
    teamName,
    xValue,
    otype,
    sid,
    fancyScore,
    oname,
  }
) {
  const apitype = SPORT_NAME_TO_APITYPE[gameName?.toLowerCase()] || 'cricket';

  const freshResult = await fetchFreshSportsData(
    cachedData,
    gameId,
    apitype,
    sid
  );
  if (!freshResult.ok) {
    return { valid: false, reason: freshResult.reason };
  }

  const markets = freshResult.markets;

  // Search all markets for the matching section (teamName)
  for (const market of markets) {
    if (!market.section || !Array.isArray(market.section)) continue;

    const section = market.section.find(
      (sec) =>
        (sec.nat || '').trim().toLowerCase() ===
        (teamName || '').trim().toLowerCase()
    );

    if (section) {
      // ── Suspension checks ──
      if (
        section.gstatus === 'SUSPENDED' ||
        section.gstatus === 'Ball Running' ||
        section.status === 'SUSPENDED'
      ) {
        return {
          valid: false,
          reason: 'Market is suspended. Bet not accepted.',
        };
      }

      if (market.status === 'SUSPENDED' || market.gstatus === 'SUSPENDED') {
        return {
          valid: false,
          reason: 'Market is suspended. Bet not accepted.',
        };
      }

      // ── Odds array must exist ──
      if (!section.odds || !Array.isArray(section.odds)) {
        return {
          valid: false,
          reason: 'Odds data unavailable. Please try again.',
        };
      }

      // ── FancyScore strict validation ──
      if (fancyScore == null) {
        return {
          valid: false,
          reason: 'Fancy score is required. Please try again.',
        };
      }

      const userFancyScore = parseFloat(fancyScore);
      const liveOddsObj = oname
        ? section.odds.find((o) => o.oname === oname)
        : section.odds.find((o) => o.otype === otype && o.tno === 0);
      const liveFancyScore = liveOddsObj ? parseFloat(liveOddsObj.odds) : null;

      if (
        liveFancyScore === null ||
        isNaN(liveFancyScore) ||
        liveFancyScore <= 0
      ) {
        return {
          valid: false,
          reason: 'Unable to verify current fancy score. Please try again.',
        };
      }

      if (Math.abs(userFancyScore - liveFancyScore) > 0.01) {
        return {
          valid: false,
          reason: `Fancy score changed. Current: ${liveFancyScore}. Please re-select.`,
        };
      }

      // ── xValue (size/payout) strict validation ──
      if (!xValue) {
        return {
          valid: false,
          reason: 'Odds size is required. Please try again.',
        };
      }

      const userSize = parseFloat(xValue);
      const liveSizeObj = oname
        ? section.odds.find((o) => o.oname === oname)
        : section.odds.find((o) => o.otype === otype && o.tno === 0);
      const liveSize = liveSizeObj ? parseFloat(liveSizeObj.size) : null;

      if (liveSize === null || isNaN(liveSize) || liveSize <= 0) {
        return {
          valid: false,
          reason: 'Unable to verify current odds size. Please try again.',
        };
      }

      if (Math.abs(userSize - liveSize) > 0.01) {
        return {
          valid: false,
          reason: `Odds changed. Current: ${liveSize.toFixed(2)}. Please re-select.`,
          currentOdds: liveSize,
        };
      }

      const fancyMarketId =
        gameId != null && section.sid != null
          ? `${String(gameId)}_${String(section.sid)}`
          : section.marketId || section.market_id || null;

      return {
        valid: true,
        marketMeta: {
          mid: market.mid || null,
          gmid: market.gmid || null,
          fancyId: section.sid || null,
          marketId: fancyMarketId,
        },
      };
    }
  }

  // teamName not found in ANY market section — fail closed
  return {
    valid: false,
    reason: 'Selection not found in live data. Please try again.',
  };
}

function validateFancyAgainstMarkets(
  markets,
  { gameId, teamName, xValue, otype, fancyScore, oname }
) {
  for (const market of markets) {
    if (!market.section || !Array.isArray(market.section)) continue;

    const section = market.section.find(
      (sec) =>
        (sec.nat || '').trim().toLowerCase() ===
        (teamName || '').trim().toLowerCase()
    );

    if (!section) continue;

    if (
      section.gstatus === 'SUSPENDED' ||
      section.gstatus === 'Ball Running' ||
      section.status === 'SUSPENDED'
    ) {
      return {
        valid: false,
        reason: 'Market is suspended. Bet not accepted.',
      };
    }

    if (market.status === 'SUSPENDED' || market.gstatus === 'SUSPENDED') {
      return {
        valid: false,
        reason: 'Market is suspended. Bet not accepted.',
      };
    }

    if (!section.odds || !Array.isArray(section.odds)) {
      return {
        valid: false,
        reason: 'Odds data unavailable. Please try again.',
      };
    }

    if (fancyScore == null) {
      return {
        valid: false,
        reason: 'Fancy score is required. Please try again.',
      };
    }

    const userFancyScore = parseFloat(fancyScore);
    const liveOddsObj = oname
      ? section.odds.find((o) => o.oname === oname)
      : section.odds.find((o) => o.otype === otype && o.tno === 0);
    const liveFancyScore = liveOddsObj ? parseFloat(liveOddsObj.odds) : null;

    if (
      liveFancyScore === null ||
      isNaN(liveFancyScore) ||
      liveFancyScore <= 0
    ) {
      return {
        valid: false,
        reason: 'Unable to verify current fancy score. Please try again.',
      };
    }

    if (Math.abs(userFancyScore - liveFancyScore) > 0.01) {
      return {
        valid: false,
        reason: `Fancy score changed. Current: ${liveFancyScore}. Please re-select.`,
      };
    }

    if (!xValue) {
      return {
        valid: false,
        reason: 'Odds size is required. Please try again.',
      };
    }

    const userSize = parseFloat(xValue);
    const liveSizeObj = oname
      ? section.odds.find((o) => o.oname === oname)
      : section.odds.find((o) => o.otype === otype && o.tno === 0);
    const liveSize = liveSizeObj ? parseFloat(liveSizeObj.size) : null;

    if (liveSize === null || isNaN(liveSize) || liveSize <= 0) {
      return {
        valid: false,
        reason: 'Unable to verify current odds size. Please try again.',
      };
    }

    if (Math.abs(userSize - liveSize) > 0.01) {
      return {
        valid: false,
        reason: `Odds changed. Current: ${liveSize.toFixed(2)}. Please re-select.`,
        currentOdds: liveSize,
      };
    }

    const fancyMarketId =
      gameId != null && section.sid != null
        ? `${String(gameId)}_${String(section.sid)}`
        : section.marketId || section.market_id || null;

    return {
      valid: true,
      marketMeta: {
        mid: market.mid || null,
        gmid: market.gmid || gameId || null,
        fancyId: section.sid || null,
        marketId: fancyMarketId,
      },
    };
  }

  return {
    valid: false,
    reason: 'Selection not found in live data. Please try again.',
  };
}

/**
 * Validate premium fancy (Provider C — normal + ball/khado/fancy/line/meter) against live data.
 */
export async function validatePremiumFancyMarket(
  cachedData,
  {
    gameId,
    providerCGameId,
    gameName,
    teamName,
    xValue,
    otype,
    sid,
    fancyScore,
    oname,
  }
) {
  const apitype = SPORT_NAME_TO_APITYPE[gameName?.toLowerCase()] || 'cricket';
  const cGameId = providerCGameId || gameId;

  try {
    const markets = await fetchProviderCMatchMarkets(cGameId, sid);
    const premiumMarkets = markets.filter(isProviderCPremiumFancyMarket);

    if (premiumMarkets.length) {
      return validateFancyAgainstMarkets(premiumMarkets, {
        gameId: cGameId,
        teamName,
        xValue,
        otype,
        fancyScore,
        oname,
      });
    }

    const { createProviderD } = await import('../services/matchApi/providerD.js');
    const { extractProviderDPremiumFancyFallback } = await import(
      '../services/matchApi/providerCHybrid.js'
    );
    const providerD = createProviderD();
    const fromD = await providerD.fetchFancyMarketsForEvent(String(gameId), sid);
    const fallbackMarkets = extractProviderDPremiumFancyFallback(
      Array.isArray(fromD?.data) ? fromD.data : []
    );
    if (fallbackMarkets.length) {
      return validateFancyAgainstMarkets(fallbackMarkets, {
        gameId: String(gameId),
        teamName,
        xValue,
        otype,
        fancyScore,
        oname,
      });
    }
  } catch (err) {
    const cacheKey = `${gameId}_${apitype}`;
    const cacheEntry = cachedData[cacheKey];
    const premiumMarkets = Array.isArray(cacheEntry?.premiumFancy)
      ? cacheEntry.premiumFancy
      : [];

    if (premiumMarkets.length) {
      return validateFancyAgainstMarkets(premiumMarkets, {
        gameId: cacheEntry?.providerCGameId || cGameId,
        teamName,
        xValue,
        otype,
        fancyScore,
        oname,
      });
    }

    return {
      valid: false,
      reason: 'Unable to verify premium fancy odds. Please try again.',
    };
  }
}

/**
 * Validate casino bet against live market data.
 *
 * @param {object} cachedData - shared cache object from bettingSocket
 * @param {object} params - { gameId, teamName, xValue, otype }
 * @returns {{ valid: boolean, reason?: string, currentOdds?: number }}
 */
export async function validateCasinoMarket(
  cachedData,
  { gameId, teamName, xValue, otype }
) {
  const freshResult = await fetchFreshCasinoData(cachedData, gameId);
  if (!freshResult.ok) {
    return { valid: false, reason: freshResult.reason };
  }

  const data = freshResult.data;

  if (data.status === 'SUSPENDED' || data.gstatus === 'SUSPENDED') {
    return { valid: false, reason: 'Market is suspended. Bet not accepted.' };
  }

  const players = data.sub;
  if (!players || !Array.isArray(players)) {
    return {
      valid: false,
      reason: 'Casino selection data unavailable. Please try again.',
    };
  }

  const allSuspended = players.every(
    (p) => p.gstatus === 'SUSPENDED' || p.status === 'SUSPENDED'
  );
  if (allSuspended) {
    return {
      valid: false,
      reason: 'All selections are suspended. Bet not accepted.',
    };
  }

  const player = players.find(
    (p) =>
      (p.nat || '').trim().toLowerCase() ===
      (teamName || '').trim().toLowerCase()
  );

  if (!player) {
    return {
      valid: false,
      reason: 'Selection not found in live data. Please try again.',
    };
  }

  if (player.gstatus === 'SUSPENDED' || player.status === 'SUSPENDED') {
    return {
      valid: false,
      reason: 'Selection is suspended. Bet not accepted.',
    };
  }

  if (!xValue) {
    return {
      valid: false,
      reason: 'Odds value is required. Please try again.',
    };
  }

  const userOdds = parseFloat(xValue);
  const liveOdds =
    otype === 'back' ? parseFloat(player.b) : parseFloat(player.l);

  if (isNaN(liveOdds) || liveOdds <= 0) {
    return {
      valid: false,
      reason: 'Unable to verify current casino odds. Please try again.',
    };
  }

  const drift = Math.abs(userOdds - liveOdds) / liveOdds;
  if (drift > 0.05) {
    return {
      valid: false,
      reason: `Odds changed. Current: ${liveOdds.toFixed(2)}. Please re-select.`,
      currentOdds: liveOdds,
    };
  }

  return { valid: true };
}

export { API_MARKET_ALIASES, MAX_CACHE_AGE_MS, SPORT_NAME_TO_APITYPE };