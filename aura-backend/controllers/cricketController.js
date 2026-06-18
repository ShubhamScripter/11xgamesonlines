import dotenv from 'dotenv';

import adminModel from '../models/adminModel.js';
import {
  fetchMatchData,
  fetchMatchList,
  fetchScore,
} from '../services/matchApi/index.js';

dotenv.config();

/** Cricket leagues hidden from /api/cricket/matches listing (case-insensitive cname). */
const BLOCKED_CRICKET_CNAMES = new Set([
  'dim cricket league (1 over)',
  't5 xi',
  't10 xi',
]);

const isBlockedCricketLeague = (cname) => {
  const key = (cname || '').toString().trim().toLowerCase();
  return BLOCKED_CRICKET_CNAMES.has(key);
};

const cricketBettingCache = new Map();
const CRICKET_BETTING_CACHE_MS = 4000;
const CRICKET_MATCHES_CACHE_MS = 15000;
let cricketMatchesCache = { ts: 0, payload: null };
let cricketMatchesInFlight = null;

export const getCricketData = async (req, res) => {
  try {
    if (
      cricketMatchesCache.payload &&
      Date.now() - cricketMatchesCache.ts < CRICKET_MATCHES_CACHE_MS
    ) {
      return res.status(200).json(cricketMatchesCache.payload);
    }

    if (cricketMatchesInFlight) {
      const payload = await cricketMatchesInFlight;
      return res.status(200).json(payload);
    }

    cricketMatchesInFlight = fetchMatchList(4).then((data) => {
      if (!data.success) {
        throw new Error('Failed to fetch matches');
      }

      const t1 = data.data.t1 || [];
      const t2 = data.data.t2 || [];
      const allMatches = [...t1, ...t2];

      const transformed = allMatches
        .map((match) => ({
          id: match.beventId || match.oldgmid || match.gmid,
          beventId: match.beventId || null,
          match: match.ename,
          date: match.stime,
          cname: match.cname,
          channels: [],
          inplay: match.iplay,
          status: match.status != null ? String(match.status) : '',
        }))
        .filter((m) => {
          if (isBlockedCricketLeague(m.cname)) return false;

          const matchName = (m.match || '').toString().trim().toLowerCase();
          const categoryName = (m.cname || '').toString().trim().toLowerCase();

          if (!matchName) return false;
          if (!categoryName) return true;

          // Drop league/header rows where match name == competition name
          return matchName !== categoryName;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const now = new Date();
      const filteredMatches = transformed.filter((match) => {
        const matchDate = new Date(match.date);
        return match.inplay === true || matchDate >= now;
      });

      const payload = { success: true, matches: filteredMatches };
      cricketMatchesCache = { ts: Date.now(), payload };
      return payload;
    });

    const payload = await cricketMatchesInFlight;
    cricketMatchesInFlight = null;
    return res.status(200).json(payload);
  } catch (err) {
    cricketMatchesInFlight = null;
    console.error('Error fetching matches:', err.message, err.stack);
    return res.status(500).json({ success: false, message: 'Internal Server Error: ' + err.message });
  }
};

export const getCricketScorecard = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const data = await fetchScore(gameid, 4);
    if (data?.success && data?.iframe?.url) {
      return res.status(200).json(data);
    }
    return res.status(502).json({
      success: false,
      message: data?.message || 'Scorecard not available',
      data,
    });
  } catch (error) {
    console.error('Error fetching cricket scorecard:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const fetchCrirketBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const cacheKey = String(gameid);
    const cached = cricketBettingCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CRICKET_BETTING_CACHE_MS) {
      return res.status(200).json({ success: true, data: cached.payload });
    }

    const json = await fetchMatchData(gameid, 4);

    if (json.success) {
      cricketBettingCache.set(cacheKey, { ts: Date.now(), payload: json });
      return res.status(200).json({ success: true, data: json });
    } else {
      return res
        .status(500)
        .json({ success: false, message: 'Invalid response from API' });
    }
  } catch (error) {
    console.error('Error in fetchBettingData:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};