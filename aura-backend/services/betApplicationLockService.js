import BetApplicationLock, {
  getBetApplicationLockDoc,
} from '../models/betApplicationLockModel.js';
import mongoose from 'mongoose';
import {
  normalizeSportKey,
  resolveBetTypeLockId,
  isBetTypeLocked,
} from '../constants/betLockConstants.js';
import { invalidateMatchSectionCache } from '../utils/matchSectionSettings.js';

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

/**
 * Fast lock check for place-bet.
 * Per-match / league / section locks are skipped — locked matches are already
 * hidden from the user list. Only sport-wide + bet-type locks remain.
 */
export async function checkBetApplicationLock({
  gameName,
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

  return { blocked: false };
}

function normalizeLockDate(raw) {
  if (raw == null || raw === '') return '';
  if (raw instanceof Date) return raw.toISOString();
  return String(raw).slice(0, 80);
}

function toBoolMap(obj) {
  const m = new Map();
  if (!obj || typeof obj !== 'object') return m;
  for (const [key, value] of Object.entries(obj)) {
    if (value === true) m.set(String(key), true);
  }
  return m;
}

function normalizeMatchLockRow(m) {
  return {
    sport: String(m.sport).trim(),
    matchId: String(m.matchId).trim(),
    matchName: String(m.matchName || '').trim(),
    leagueName: String(m.leagueName || '').trim(),
    date: normalizeLockDate(m.date),
    locked: m.locked !== false,
  };
}

export async function updateSingleMatchLock(
  { matchId, sport, locked, matchName, leagueName, date },
  userId
) {
  const id = String(matchId || '').trim();
  const sportKey = String(sport || '').trim();
  if (!id || !sportKey) {
    throw new Error('Valid matchId and sport are required');
  }

  let doc = await BetApplicationLock.findOne();
  if (!doc) {
    doc = new BetApplicationLock();
  }

  const current = Array.isArray(doc.matches)
    ? doc.matches.map((m) => normalizeMatchLockRow(m))
    : [];

  const rest = current.filter(
    (m) => !(m.matchId === id && m.sport === sportKey)
  );

  doc.matches = locked
    ? [
        ...rest,
        normalizeMatchLockRow({
          sport: sportKey,
          matchId: id,
          matchName,
          leagueName,
          date,
          locked: true,
        }),
      ]
    : rest;

  if (userId && mongoose.Types.ObjectId.isValid(String(userId))) {
    doc.updatedBy = userId;
  }

  await doc.save();
  invalidateBetLockCache();
  invalidateMatchSectionCache();
  return serializeLockDoc(doc.toObject());
}

export async function saveBetLockSettings(payload, userId) {
  const sportsMap = toBoolMap(payload?.sports);
  const betTypesMap = toBoolMap(payload?.betTypes);
  const marketTypesMap = toBoolMap(payload?.marketTypes);

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
        .map((m) => normalizeMatchLockRow(m))
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
  if (userId && mongoose.Types.ObjectId.isValid(String(userId))) {
    doc.updatedBy = userId;
  } else {
    doc.updatedBy = null;
  }
  await doc.save();

  invalidateBetLockCache();
  invalidateMatchSectionCache();
  return serializeLockDoc(doc.toObject());
}
