import DeactivatedMatch from '../models/matchSettingsModel.js';
import { getBetApplicationLockDoc } from '../models/betApplicationLockModel.js';
import {
  MATCH_SECTIONS,
  normalizeMatchSectionList,
  SECTION_TO_BET_LOCK_ID,
} from '../constants/matchSectionConstants.js';

const CACHE_MS = 10_000;
let cache = { ts: 0, byMatchId: new Map(), fullyDisabledIds: new Set() };

function isLegacyFullyDisabled(doc) {
  if (!doc) return false;
  if (doc.matchDisabled === false) return false;
  if (doc.matchDisabled === true) return true;
  const sections = normalizeMatchSectionList(doc.disabledSections);
  return sections.length === 0;
}

export function serializeMatchSectionDoc(doc) {
  if (!doc) {
    return {
      matchDisabled: false,
      disabledSections: [],
      sections: Object.fromEntries(MATCH_SECTIONS.map((s) => [s, true])),
    };
  }

  const disabledSections = normalizeMatchSectionList(doc.disabledSections);
  const matchDisabled = isLegacyFullyDisabled(doc);
  const disabledSet = new Set(disabledSections);

  const sections = Object.fromEntries(
    MATCH_SECTIONS.map((s) => [s, matchDisabled ? false : !disabledSet.has(s)])
  );

  return {
    matchDisabled,
    disabledSections,
    sections,
    matchName: doc.matchName || '',
    sport: doc.sport || '',
  };
}

async function refreshCache() {
  const now = Date.now();
  if (now - cache.ts < CACHE_MS) return;

  const rows = await DeactivatedMatch.find().lean();
  const byMatchId = new Map();
  const fullyDisabledIds = new Set();

  for (const doc of rows) {
    const serialized = serializeMatchSectionDoc(doc);
    byMatchId.set(String(doc.matchId), serialized);
    if (serialized.matchDisabled) {
      fullyDisabledIds.add(String(doc.matchId));
    }
  }

  cache = { ts: now, byMatchId, fullyDisabledIds };
}

export async function getMatchSectionSettings(matchId, sport) {
  await refreshCache();
  const key = String(matchId);

  const betLockedIds = await getBetLockedMatchIds(sport);
  if (betLockedIds.has(key)) {
    return {
      matchDisabled: true,
      disabledSections: [],
      sections: Object.fromEntries(MATCH_SECTIONS.map((s) => [s, false])),
      hiddenByBetLock: true,
    };
  }

  const hit = cache.byMatchId.get(key);
  if (hit) {
    if (sport && hit.sport && hit.sport !== sport) {
      return serializeMatchSectionDoc(null);
    }
    return hit;
  }
  return serializeMatchSectionDoc(null);
}

export async function getBetLockedMatchIds(sport) {
  const doc = await getBetApplicationLockDoc();
  const rows = Array.isArray(doc?.matches) ? doc.matches : [];
  const ids = new Set();
  for (const row of rows) {
    if (row.locked === true && (!sport || row.sport === sport)) {
      ids.add(String(row.matchId));
    }
  }
  return ids;
}

export async function getFullyDisabledMatchIds(sport) {
  // Always read DeactivatedMatch from DB so multi-instance (PM2) workers
  // see locks immediately — in-memory cache invalidation is per-process only.
  const [rows, betLockedIds] = await Promise.all([
    DeactivatedMatch.find().select('matchId sport matchDisabled disabledSections').lean(),
    getBetLockedMatchIds(sport),
  ]);

  const ids = new Set(betLockedIds);
  for (const doc of rows) {
    const serialized = serializeMatchSectionDoc(doc);
    if (!serialized.matchDisabled) continue;
    if (sport && serialized.sport && serialized.sport !== sport) continue;
    ids.add(String(doc.matchId));
  }
  return ids;
}

export async function getMatchSectionSettingsMap(sport) {
  await refreshCache();
  const map = {};
  for (const [matchId, row] of cache.byMatchId.entries()) {
    if (sport && row.sport && row.sport !== sport) continue;
    map[matchId] = row;
  }
  return map;
}

export function invalidateMatchSectionCache() {
  cache = { ts: 0, byMatchId: new Map(), fullyDisabledIds: new Set() };
}

export async function filterFullyDisabledFromPayload(payload, sport) {
  if (!payload) return payload;

  const hasMatches = Array.isArray(payload.matches) && payload.matches.length > 0;
  const hasData = Array.isArray(payload.data) && payload.data.length > 0;
  if (!hasMatches && !hasData) return payload;

  const disabledIds = await getFullyDisabledMatchIds(sport);
  if (!disabledIds.size) return payload;

  const next = { ...payload };

  if (hasMatches) {
    next.matches = payload.matches.filter((m) => {
      const id = String(m.id || m.eventId || m.matchId || '');
      return id && !disabledIds.has(id);
    });
  }

  if (hasData) {
    next.data = payload.data.filter((m) => {
      const id = String(m.id || m.eventId || m.matchId || '');
      return id && !disabledIds.has(id);
    });
  }

  return next;
}

/** Block bet if match fully disabled or this section is disabled for the match. */
export async function checkMatchSectionLock({
  gameId,
  sport,
  gameType,
  marketName,
  isFancy = false,
  isPremium = false,
}) {
  const settings = await getMatchSectionSettings(gameId, sport);
  if (settings.matchDisabled) {
    return {
      blocked: true,
      reason: 'This match is currently unavailable',
    };
  }

  let sectionKey = null;
  if (isPremium) sectionKey = 'premium';
  else if (isFancy) sectionKey = 'fancy';
  else {
    const gt = String(gameType || '').trim();
    const mn = String(marketName || '').trim().toLowerCase();
    if (gt === 'Bookmaker' || gt.includes('Bookmaker') || mn.includes('bookmaker')) {
      sectionKey = 'bookmaker';
    } else if (
      gt === 'Match Odds' ||
      gt === 'Tied Match' ||
      gt === 'Winner' ||
      gt.startsWith('OVER_UNDER')
    ) {
      sectionKey = 'match_odds';
    }
  }

  if (sectionKey && settings.sections[sectionKey] === false) {
    return {
      blocked: true,
      reason: 'This market section is disabled for this match',
    };
  }

  return { blocked: false, betTypeId: sectionKey ? SECTION_TO_BET_LOCK_ID[sectionKey] : null };
}
