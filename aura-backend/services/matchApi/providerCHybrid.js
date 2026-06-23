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
  const hasProviderC =
    Boolean(process.env.PROVIDER_C_API_KEY || process.env.API_KEY) &&
    Boolean(process.env.PROVIDER_C_API_URL || process.env.API_URL);
  const disabled =
    String(process.env.PREMIUM_FANCY_ENABLED || 'true').toLowerCase() ===
    'false';
  return isProviderD && hasProviderC && !disabled;
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
 * Cricket only: Provider D eventId → Provider C getPriveteData → ball/khado/fancy markets.
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
    const raw = await withTimeout(
      getProviderC().fetchMatchData(eventKey, CRICKET_SPORT_ID),
      PREMIUM_FETCH_TIMEOUT_MS,
      'premium-fancy-timeout'
    );
    const premiumFancy = extractProviderCPremiumFancy(extractMarketsArray(raw));
    return {
      providerCGameId: eventKey,
      premiumFancy,
    };
  } catch (err) {
    if (err.message !== 'premium-fancy-timeout') {
      console.warn(
        `[PremiumFancy] Provider C fetch for eventId=${eventKey}:`,
        err.message
      );
    }
    return { providerCGameId: eventKey, premiumFancy: [] };
  }
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
