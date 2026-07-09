import { createProviderC } from './providerC.js';
import { normalizeBsettleFancyResult } from '../bsettleResultService.js';

const CRICKET_SPORT_ID = 4;
const PREMIUM_FETCH_TIMEOUT_MS = Number(
  process.env.PREMIUM_FANCY_TIMEOUT_MS || 3500
);

let providerCInstance = null;

function getProviderC() {
  if (!providerCInstance) {
    providerCInstance = createProviderC();
  }
  return providerCInstance;
}

export function isPremiumFancyEnabled(activeProviderName) {
  const p = String(activeProviderName || '').toLowerCase();
  const isProviderD = p === 'providerd' || p === 'provider_d';
  const disabled =
    String(process.env.PREMIUM_FANCY_ENABLED || 'true').toLowerCase() ===
    'false';
  if (disabled) return false;
  if (isProviderD) return true;
  const hasProviderC =
    Boolean(process.env.PROVIDER_C_API_KEY || process.env.API_KEY) &&
    Boolean(process.env.PROVIDER_C_API_URL || process.env.API_URL);
  return hasProviderC;
}

function normalizeEventLabel(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*\/\s*.*$/, '')
    .trim();
}

function listProviderDMatches(listPayload) {
  if (!listPayload?.success) return [];
  return [...(listPayload.data?.t1 || []), ...(listPayload.data?.t2 || [])];
}

async function resolveProviderCGameId(eventId, sportId = CRICKET_SPORT_ID) {
  const eventKey = String(eventId);
  const providerC = getProviderC();

  const tryFetchPremium = async (gameId) => {
    const raw = await withTimeout(
      providerC.fetchMatchData(String(gameId), sportId),
      PREMIUM_FETCH_TIMEOUT_MS,
      'premium-fancy-timeout'
    );
    const premiumFancy = extractProviderCPremiumFancy(extractMarketsArray(raw));
    return premiumFancy.length
      ? { providerCGameId: String(gameId), premiumFancy }
      : null;
  };

  try {
    const direct = await tryFetchPremium(eventKey);
    if (direct) return direct;
  } catch {
    // try name-based mapping below
  }

  try {
    const { createProviderD } = await import('./providerD.js');
    const providerD = createProviderD();
    const [dList, cList] = await Promise.all([
      providerD.fetchMatchList(sportId),
      providerC.fetchMatchList(sportId),
    ]);
    const dMatches = listProviderDMatches(dList);
    const cMatches = listProviderDMatches(cList);
    const dMatch = dMatches.find(
      (m) =>
        String(m.gmid) === eventKey ||
        String(m.beventId) === eventKey ||
        String(m.oldgmid) === eventKey
    );
    if (!dMatch?.ename) return null;

    const target = normalizeEventLabel(dMatch.ename);
    const cMatch = cMatches.find((m) => {
      const label = normalizeEventLabel(m.ename);
      if (!label) return false;
      return label === target || label.includes(target) || target.includes(label);
    });
    if (!cMatch?.gmid) return null;
    return await tryFetchPremium(cMatch.gmid);
  } catch (err) {
    console.warn(
      `[PremiumFancy] Provider C gameId resolve for eventId=${eventKey}:`,
      err.message
    );
    return null;
  }
}

/** Premium markets from Winkaro fancy API — exclude normal/fancy1 (already on Fancy tab). */
export function extractProviderDPremiumFancyFallback(markets) {
  if (!Array.isArray(markets)) return [];
  return markets
    .filter((market) => {
      if (!isProviderCPremiumFancyMarket(market)) return false;
      const mname = String(market.mname || market.name || '').toLowerCase();
      const gtype = String(market.gtype || '').toLowerCase();
      if (mname === 'normal' || mname === 'fancy1' || gtype === 'fancy1') {
        return false;
      }
      return true;
    })
    .map((market) => ({
      ...market,
      _betSource: 'providerD',
      _isPremium: true,
    }));
}

async function fetchPremiumFromProviderD(eventId, sportId = CRICKET_SPORT_ID) {
  const eventKey = String(eventId);
  const { createProviderD } = await import('./providerD.js');
  const providerD = createProviderD();
  const result = await providerD.fetchFancyMarketsForEvent(eventKey, sportId);
  const markets = Array.isArray(result?.data) ? result.data : [];
  const premiumFancy = extractProviderDPremiumFancyFallback(markets);
  return {
    providerCGameId: eventKey,
    premiumFancy,
    premiumSource: premiumFancy.length ? 'providerD' : null,
  };
}

function extractMarketsArray(raw) {
  const data = raw?.data ?? raw;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

/** Premium tab: all Provider C fancy markets (normal + gtype variants) */
export const PREMIUM_FANCY_GTYPES = new Set([
  'fancy',
  'ball',
  'khado',
  'line',
  'meter',
  'oddeven',
  'cricketcasino',
]);

export function isProviderCPremiumFancyMarket(item) {
  if (!item || typeof item !== 'object') return false;
  const mname = String(item.mname || item.name || '').trim().toLowerCase();
  const gtype = String(item.gtype || '').trim().toLowerCase();
  const hasSections =
    Array.isArray(item.section) && item.section.length > 0;
  if (!hasSections) return false;
  if (mname === 'normal' || mname === 'oddeven') return true;
  return PREMIUM_FANCY_GTYPES.has(gtype);
}

/** @deprecated use isProviderCPremiumFancyMarket */
export const isProviderCNormalFancyMarket = isProviderCPremiumFancyMarket;

export function extractProviderCPremiumFancy(markets) {
  if (!Array.isArray(markets)) return [];
  return markets
    .filter(isProviderCPremiumFancyMarket)
    .map((market) => ({
      ...market,
      _betSource: 'providerC',
      _isPremium: true,
    }));
}

/** @deprecated use extractProviderCPremiumFancy */
export const extractProviderCNormalFancy = extractProviderCPremiumFancy;

function withTimeout(promise, ms, label = 'timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(label)), ms);
    }),
  ]);
}

/**
 * Cricket only: Provider C getPriveteData when available, else Winkaro fancy fallback.
 */
export async function fetchProviderCPremiumFancy(
  eventId,
  sportId = CRICKET_SPORT_ID
) {
  if (!eventId || Number(sportId) !== CRICKET_SPORT_ID) {
    return { providerCGameId: null, premiumFancy: [] };
  }

  const eventKey = String(eventId);

  try {
    const fromC = await resolveProviderCGameId(eventKey, sportId);
    if (fromC?.premiumFancy?.length) {
      return { ...fromC, premiumSource: 'providerC' };
    }
  } catch (err) {
    if (err.message !== 'premium-fancy-timeout') {
      console.warn(
        `[PremiumFancy] Provider C fetch for eventId=${eventKey}:`,
        err.message
      );
    }
  }

  try {
    const fromD = await fetchPremiumFromProviderD(eventKey, sportId);
    if (fromD.premiumFancy.length) {
      console.log(
        `[PremiumFancy] Using Provider D fallback for eventId=${eventKey} (${fromD.premiumFancy.length} markets)`
      );
      return fromD;
    }
  } catch (err) {
    console.warn(
      `[PremiumFancy] Provider D fallback for eventId=${eventKey}:`,
      err.message
    );
  }

  return { providerCGameId: eventKey, premiumFancy: [] };
}

export async function fetchProviderCMatchMarkets(
  gameId,
  sportId = CRICKET_SPORT_ID
) {
  if (Number(sportId) !== CRICKET_SPORT_ID) return [];
  const providerC = getProviderC();
  const raw = await withTimeout(
    providerC.fetchMatchData(String(gameId), CRICKET_SPORT_ID),
    PREMIUM_FETCH_TIMEOUT_MS,
    'premium-fancy-timeout'
  );
  return extractMarketsArray(raw);
}

export function sendProviderCBetIncoming(payload) {
  return getProviderC().sendBetIncoming(payload);
}

function extractFancyByEventRows(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.body)) return raw.body;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

/** Map app gameType → Provider C fancyType label for result matching */
export function mapGameTypeToProviderCFancyType(gameType) {
  const g = String(gameType || 'Normal').trim().toLowerCase();
  if (g === 'normal') return 'normal';
  return g;
}

/**
 * Provider C fancy result — normalize + optional fancybyevent fallback.
 * Returns { success, result } shape used by updateFancyBetResult.
 */
export async function fetchProviderCFancyResult(
  eventId,
  fancyId,
  { teamName, gameType } = {}
) {
  const providerC = getProviderC();
  const eid = String(eventId);
  const fid = String(fancyId);

  const raw = await providerC.fetchCricketFancyResult(eid, fid);
  let normalized = normalizeBsettleFancyResult(raw);

  if (normalized.result != null) {
    return normalized;
  }

  try {
    const byEventRaw = await providerC.fetchCricketFancyByEvent(eid);
    const rows = extractFancyByEventRows(byEventRaw);
    const teamNeedle = String(teamName || '').toLowerCase().trim();
    const typeNeedle = mapGameTypeToProviderCFancyType(gameType);

    const matched =
      rows.find(
        (r) =>
          r.isResult &&
          r.result != null &&
          String(r.fancyId ?? r.sid ?? r.id ?? '') === fid
      ) ||
      rows.find((r) => {
        if (!r.isResult || r.result == null) return false;
        const fancyName = String(r.fancyName || '').toLowerCase().trim();
        const fancyType = String(r.fancyType || '').toLowerCase().trim();
        if (teamNeedle && fancyName === teamNeedle) return true;
        if (
          teamNeedle &&
          fancyType === typeNeedle &&
          fancyName.includes(teamNeedle)
        ) {
          return true;
        }
        return false;
      });

    if (matched) {
      normalized = normalizeBsettleFancyResult(matched);
      console.log(
        `[ProviderC] fancybyevent fallback hit eventId=${eid} fancyId=${fid} gameType=${gameType}`
      );
    }
  } catch (err) {
    console.warn(
      `[ProviderC] fancybyevent fallback failed eventId=${eid}:`,
      err.message
    );
  }

  return normalized;
}
