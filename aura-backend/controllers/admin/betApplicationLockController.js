import {
  BET_LOCK_BET_TYPES,
  BET_LOCK_SPORTS,
} from '../../constants/betLockConstants.js';
import { buildSportPayload } from '../../services/sportsListCache/payloadBuilders.js';
import { getCachedSportsPayload } from '../../services/sportsListCache/sportsListCacheService.js';
import { getEventsFromDb } from '../../services/betfairCatalog/eventStore.js';
import {
  getBetLockSettings,
  saveBetLockSettings,
  updateSingleMatchLock,
} from '../../services/betApplicationLockService.js';
import DeactivatedMatch from '../../models/matchSettingsModel.js';

const MANAGE_ROLES = new Set(['superadmin', 'admin', 'subadmin', 'seniorSuper']);
const APP_TIMEZONE = 'Asia/Dhaka';

const SPORT_IDS = {
  cricket: 4,
  soccer: 1,
  tennis: 2,
};

/** Same blocked cricket leagues as user listing. */
const BLOCKED_CRICKET_CNAMES = new Set([
  'dim cricket league (1 over)',
  't5 xi',
  't10 xi',
]);

function canManageLocks(req) {
  return MANAGE_ROLES.has(req.role);
}

function toDateKey(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function toTodayDateKey() {
  return toDateKey(new Date());
}

function filterMatchesByDate(matches, dateKey) {
  if (!dateKey || dateKey === 'all') return matches;
  return (matches || []).filter((m) => toDateKey(m.date) === dateKey);
}

function mapListMatch(sport, m) {
  if (sport === 'cricket') {
    return {
      matchId: String(m.id ?? m.beventId ?? ''),
      matchName: m.match || '',
      leagueName: m.cname || m.title || '',
      date: m.date || '',
      inplay: Boolean(m.inplay),
    };
  }
  return {
    matchId: String(m.id ?? ''),
    matchName: m.match || '',
    leagueName: m.cname || m.title || '',
    date: m.date || '',
    inplay: Boolean(m.inplay),
  };
}

function mapDbEventToListMatch(row) {
  const matchName = row?.name || row?.raw?.event?.name || '';
  const leagueName = row?.competitionName || '';
  const date = row?.openDate || row?.raw?.event?.openDate || '';
  return {
    matchId: String(row?.eventId || ''),
    matchName,
    leagueName,
    date,
    inplay: false,
  };
}

function isUsableCricketRow(row) {
  const league = (row.leagueName || '').toString().trim().toLowerCase();
  if (BLOCKED_CRICKET_CNAMES.has(league)) return false;
  const matchName = (row.matchName || '').toString().trim().toLowerCase();
  if (!matchName) return false;
  if (league && matchName === league) return false;
  return true;
}

/** Prefer sports-list cache (already warmed for user site) — no third-party call. */
async function loadMatchesFromSportsCache(sport) {
  const scopes = [
    { withOdds: true, oddsScope: 'eligible' },
    { withOdds: true, oddsScope: 'all' },
    { withOdds: false, oddsScope: 'eligible' },
  ];

  for (const scope of scopes) {
    const cached = await getCachedSportsPayload(
      sport,
      scope.withOdds,
      scope.oddsScope
    );
    const list =
      sport === 'cricket'
        ? cached?.matches || []
        : cached?.data || cached?.matches || [];
    if (Array.isArray(list) && list.length > 0) {
      return list.map((m) => mapListMatch(sport, m)).filter((m) => m.matchId);
    }
  }
  return [];
}

/** Betfair event catalog already synced to MongoDB. */
async function loadMatchesFromEventDb(sport) {
  const sportId = SPORT_IDS[sport];
  if (!sportId) return [];

  const rows = await getEventsFromDb(sportId);
  return rows
    .map(mapDbEventToListMatch)
    .filter((m) => m.matchId && m.matchName);
}

/**
 * Admin lock UI listing — never block on third-party API.
 * Order: sports cache → BetfairEvent DB → live provider (last resort).
 */
async function fetchSportMatches(sport) {
  let list = await loadMatchesFromSportsCache(sport);
  let source = 'cache';

  if (!list.length) {
    list = await loadMatchesFromEventDb(sport);
    source = 'db';
  }

  if (!list.length) {
    try {
      const payload = await buildSportPayload(sport, false, 'all');
      const raw =
        sport === 'cricket'
          ? payload?.matches || []
          : payload?.data || payload?.matches || [];
      list = raw.map((m) => mapListMatch(sport, m)).filter((m) => m.matchId);
      source = 'provider';
    } catch (err) {
      console.warn(
        `[BetApplicationLock] provider fallback failed for ${sport}:`,
        err.message
      );
      list = [];
      source = 'empty';
    }
  }

  if (sport === 'cricket') {
    list = list.filter(isUsableCricketRow);
  }

  const byId = new Map();
  for (const row of list) {
    if (row.matchId) byId.set(String(row.matchId), row);
  }

  const [lockSettings, deactivated] = await Promise.all([
    getBetLockSettings(),
    DeactivatedMatch.find({ sport }).lean(),
  ]);

  for (const m of lockSettings.matches || []) {
    if (m.sport !== sport || !m.matchId) continue;
    const id = String(m.matchId);
    if (!byId.has(id)) {
      byId.set(id, {
        matchId: id,
        matchName: m.matchName || `Match ${id}`,
        leagueName: m.leagueName || 'Locked / hidden',
        date: m.date || '',
        inplay: false,
      });
    }
  }

  for (const m of deactivated) {
    const id = String(m.matchId);
    if (!id || byId.has(id)) continue;
    byId.set(id, {
      matchId: id,
      matchName: m.matchName || `Match ${id}`,
      leagueName: 'Inactive',
      date: m.createdAt || '',
      inplay: false,
    });
  }

  const matches = [...byId.values()].sort(
    (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
  );

  return { matches, source };
}

export const getBetApplicationLock = async (req, res) => {
  try {
    if (!canManageLocks(req)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const settings = await getBetLockSettings();
    return res.status(200).json({
      success: true,
      data: settings,
      meta: {
        sports: BET_LOCK_SPORTS,
        betTypes: BET_LOCK_BET_TYPES,
      },
    });
  } catch (error) {
    console.error('[BetApplicationLock] get failed:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateBetApplicationLock = async (req, res) => {
  try {
    if (!canManageLocks(req)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const saved = await saveBetLockSettings(req.body, req.id);
    return res.status(200).json({
      success: true,
      message: 'Lock settings saved',
      data: saved,
    });
  } catch (error) {
    console.error('[BetApplicationLock] save failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const patchBetLockMatch = async (req, res) => {
  try {
    if (!canManageLocks(req)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { matchId } = req.params;
    const { sport, locked, matchName, leagueName, date } = req.body || {};

    if (!matchId || !sport) {
      return res.status(400).json({
        success: false,
        message: 'matchId and sport are required',
      });
    }

    const saved = await updateSingleMatchLock(
      {
        matchId,
        sport,
        locked: locked === true,
        matchName,
        leagueName,
        date,
      },
      req.id
    );

    return res.status(200).json({
      success: true,
      message: locked ? 'Match locked' : 'Match unlocked',
      data: saved,
    });
  } catch (error) {
    console.error('[BetApplicationLock] patch match failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update match lock',
    });
  }
};

export const getBetLockEvents = async (req, res) => {
  try {
    if (!canManageLocks(req)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const sport = String(req.query.sport || 'cricket').trim().toLowerCase();
    const dateParam = String(req.query.date || 'all').trim().toLowerCase();
    const dateKey = dateParam === 'all' ? 'all' : dateParam || toTodayDateKey();

    const { matches: all, source } = await fetchSportMatches(sport);
    const filtered = filterMatchesByDate(all, dateKey);

    const leagues = [...new Set(filtered.map((m) => m.leagueName).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b)
    );

    return res.status(200).json({
      success: true,
      sport,
      date: dateKey,
      leagues,
      matches: filtered,
      total: filtered.length,
      totalAll: all.length,
      source,
    });
  } catch (error) {
    console.error('[BetApplicationLock] events failed:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load events' });
  }
};
