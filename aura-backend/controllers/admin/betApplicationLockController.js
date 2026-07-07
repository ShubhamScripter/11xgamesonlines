import {
  BET_LOCK_BET_TYPES,
  BET_LOCK_SPORTS,
} from '../../constants/betLockConstants.js';
import { buildSportPayload } from '../../services/sportsListCache/payloadBuilders.js';
import {
  getBetLockSettings,
  saveBetLockSettings,
  updateSingleMatchLock,
} from '../../services/betApplicationLockService.js';
import DeactivatedMatch from '../../models/matchSettingsModel.js';

const MANAGE_ROLES = new Set(['superadmin', 'admin', 'subadmin', 'seniorSuper']);
const APP_TIMEZONE = 'Asia/Dhaka';

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

async function fetchSportMatches(sport) {
  const payload = await buildSportPayload(sport, false, 'all');
  const list =
    sport === 'cricket'
      ? payload?.matches || []
      : payload?.data || payload?.matches || [];

  const byId = new Map();
  for (const m of list) {
    const row = mapListMatch(sport, m);
    if (row.matchId) byId.set(row.matchId, row);
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

  return [...byId.values()].sort(
    (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
  );
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

    const all = await fetchSportMatches(sport);
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
    });
  } catch (error) {
    console.error('[BetApplicationLock] events failed:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load events' });
  }
};
