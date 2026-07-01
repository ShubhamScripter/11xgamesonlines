import BetfairEvent from '../models/betfairEventModel.js';
import BetApplicationLock, {
  getBetApplicationLockDoc,
} from '../models/betApplicationLockModel.js';
import {
  normalizeSportKey,
  resolveBetTypeLockId,
  isBetTypeLocked,
} from '../constants/betLockConstants.js';

const CACHE_MS = 15_000;
let cache = { ts: 0, data: null };

function mapToObject(maybeMap) {
  if (!maybeMap) return {};
  if (maybeMap instanceof Map) return Object.fromEntries(maybeMap);
  return { ...maybeMap };
}

export function serializeLockDoc(doc) {
  if (!doc) {
    return {
      sports: {},
      betTypes: {},
      marketTypes: {},
      leagues: [],
      matches: [],
      updatedAt: null,
    };
  }
  return {
    sports: mapToObject(doc.sports),
    betTypes: mapToObject(doc.betTypes),
    marketTypes: mapToObject(doc.marketTypes),
    leagues: Array.isArray(doc.leagues) ? doc.leagues : [],
    matches: Array.isArray(doc.matches) ? doc.matches : [],
    updatedAt: doc.updatedAt ?? null,
  };
}

export async function getBetLockSettings() {
  const now = Date.now();
  if (cache.data && now - cache.ts < CACHE_MS) {
    return cache.data;
  }
  const doc = await getBetApplicationLockDoc();
  const serialized = serializeLockDoc(doc);
  cache = { ts: now, data: serialized };
  return serialized;
}

export function invalidateBetLockCache() {
  cache = { ts: 0, data: null };
}

function isLocked(mapObj, key) {
  if (!key || !mapObj) return false;
  return mapObj[key] === true;
}

async function resolveLeagueName(gameId, sportKey) {
  const row = await BetfairEvent.findOne({ eventId: String(gameId) })
    .select('competitionName sportId')
    .lean();
  if (row?.competitionName) return row.competitionName.trim();

  const settings = await getBetLockSettings();
  const matchEntry = settings.matches.find(
    (m) => String(m.matchId) === String(gameId) && m.sport === sportKey
  );
  return matchEntry?.leagueName?.trim() || '';
}

/**
 * Returns { blocked: boolean, reason?: string }
 * locked=true in settings means betting is DISABLED for users.
 */
export async function checkBetApplicationLock({
  gameName,
  gameId,
  gameType,
  marketName,
  isFancy = false,
  isPremium = false,
}) {
  const sportKey = normalizeSportKey(gameName);
  if (!sportKey) return { blocked: false };

  const settings = await getBetLockSettings();

  if (isLocked(settings.sports, sportKey)) {
    return {
      blocked: true,
      reason: `${gameName || sportKey} betting is currently locked`,
    };
  }

  const betTypeId = resolveBetTypeLockId({
    gameType,
    marketName,
    isFancy,
    isPremium,
  });
  if (betTypeId && isBetTypeLocked(settings.betTypes, betTypeId)) {
    return {
      blocked: true,
      reason: 'This bet type is currently locked',
    };
  }

  if (gameId) {
    const matchEntry = settings.matches.find(
      (m) =>
        m.locked === true &&
        m.sport === sportKey &&
        String(m.matchId) === String(gameId)
    );
    if (matchEntry) {
      return {
        blocked: true,
        reason: `Match "${matchEntry.matchName || gameId}" is locked for betting`,
      };
    }

    const leagueName = await resolveLeagueName(gameId, sportKey);
    if (leagueName) {
      const leagueEntry = settings.leagues.find(
        (l) =>
          l.locked === true &&
          l.sport === sportKey &&
          l.leagueName.toLowerCase() === leagueName.toLowerCase()
      );
      if (leagueEntry) {
        return {
          blocked: true,
          reason: `League "${leagueName}" is locked for betting`,
        };
      }
    }
  }

  return { blocked: false };
}

export async function saveBetLockSettings(payload, userId) {
  const sportsMap = new Map(Object.entries(payload?.sports || {}));
  const betTypesMap = new Map(Object.entries(payload?.betTypes || {}));
  const marketTypesMap = new Map(Object.entries(payload?.marketTypes || {}));

  const leagues = Array.isArray(payload?.leagues)
    ? payload.leagues
        .filter((l) => l?.sport && l?.leagueName)
        .map((l) => ({
          sport: String(l.sport).trim(),
          leagueName: String(l.leagueName).trim(),
          locked: l.locked !== false,
        }))
    : [];

  const matches = Array.isArray(payload?.matches)
    ? payload.matches
        .filter((m) => m?.sport && m?.matchId)
        .map((m) => ({
          sport: String(m.sport).trim(),
          matchId: String(m.matchId).trim(),
          matchName: String(m.matchName || '').trim(),
          leagueName: String(m.leagueName || '').trim(),
          date: String(m.date || '').trim(),
          locked: m.locked !== false,
        }))
    : [];

  let doc = await BetApplicationLock.findOne();
  if (!doc) {
    doc = new BetApplicationLock();
  }

  doc.sports = sportsMap;
  doc.betTypes = betTypesMap;
  doc.marketTypes = marketTypesMap;
  doc.leagues = leagues;
  doc.matches = matches;
  doc.updatedBy = userId || null;
  await doc.save();

  invalidateBetLockCache();
  return serializeLockDoc(doc.toObject());
}
