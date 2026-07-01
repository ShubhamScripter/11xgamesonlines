import {
  BET_LOCK_BET_TYPES,
  BET_LOCK_SPORTS,
} from '../../constants/betLockConstants.js';
import { serveSportsListRequest } from '../../services/sportsListCache/sportsListCacheService.js';
import {
  getBetLockSettings,
  saveBetLockSettings,
} from '../../services/betApplicationLockService.js';

const MANAGE_ROLES = new Set(['superadmin', 'admin', 'subadmin', 'seniorSuper']);

function canManageLocks(req) {
  return MANAGE_ROLES.has(req.role);
}

function toDateKey(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function filterMatchesByDate(matches, dateKey) {
  if (!dateKey) return matches;
  return (matches || []).filter((m) => toDateKey(m.date) === dateKey);
}

async function fetchSportMatches(sport) {
  if (sport === 'cricket') {
    const payload = await serveSportsListRequest('cricket', false, 'eligible');
    return (payload?.matches || []).map((m) => ({
      matchId: String(m.id ?? m.beventId ?? ''),
      matchName: m.match || '',
      leagueName: m.cname || m.title || '',
      date: m.date || '',
      inplay: Boolean(m.inplay),
    }));
  }
  if (sport === 'soccer') {
    const payload = await serveSportsListRequest('soccer', false, 'eligible');
    const list = payload?.data || payload?.matches || [];
    return list.map((m) => ({
      matchId: String(m.id ?? ''),
      matchName: m.match || '',
      leagueName: m.cname || m.title || '',
      date: m.date || '',
      inplay: Boolean(m.inplay),
    }));
  }
  if (sport === 'tennis') {
    const payload = await serveSportsListRequest('tennis', false, 'eligible');
    const list = payload?.data || payload?.matches || [];
    return list.map((m) => ({
      matchId: String(m.id ?? ''),
      matchName: m.match || '',
      leagueName: m.cname || m.title || '',
      date: m.date || '',
      inplay: Boolean(m.inplay),
    }));
  }
  return [];
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
    console.error('[BetApplicationLock] save failed:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getBetLockEvents = async (req, res) => {
  try {
    if (!canManageLocks(req)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const sport = String(req.query.sport || 'cricket').trim().toLowerCase();
    const dateKey = String(req.query.date || '').trim() || toDateKey(new Date());

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
    });
  } catch (error) {
    console.error('[BetApplicationLock] events failed:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load events' });
  }
};
