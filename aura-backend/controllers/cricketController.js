import dotenv from 'dotenv';

import {
  fetchProviderCPremiumFancy,
  fetchScore,
  isPremiumFancyEnabled,
  getProviderName,
} from '../services/matchApi/index.js';
import {
  getAnyCachedSportPayload,
  serveSportsListRequest,
} from '../services/sportsListCache/sportsListCacheService.js';
import { filterFullyDisabledFromPayload } from '../utils/matchSectionSettings.js';
import { serveSportsBettingRequest } from '../utils/sportsBettingServe.js';

dotenv.config();

export const getCricketData = async (req, res) => {
  const withOdds =
    req.query?.withOdds === 'true' || req.query?.withOdds === '1';
  const oddsScope = req.query?.oddsScope === 'eligible' ? 'eligible' : 'all';

  try {
    const payload = await serveSportsListRequest(
      'cricket',
      withOdds,
      oddsScope
    );
    return res.status(200).json(payload);
  } catch (err) {
    console.error('Error fetching cricket matches:', err.message);

    const stale = await getAnyCachedSportPayload('cricket');
    if (stale) {
      const filtered = await filterFullyDisabledFromPayload(stale, 'cricket');
      return res.status(200).json(filtered);
    }

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error: ' + err.message });
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

const cricketPremiumCache = new Map();
const CRICKET_PREMIUM_CACHE_MS = 4000;

export const fetchCrirketBettingData = (req, res) =>
  serveSportsBettingRequest(req, res, 4);

/** Premium fancy only — loaded separately so main markets render fast. */
export const fetchCricketPremiumFancy = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  if (!isPremiumFancyEnabled(getProviderName())) {
    return res.status(200).json({
      success: true,
      data: { premiumFancy: [], providerCGameId: String(gameid) },
    });
  }

  try {
    const cacheKey = String(gameid);
    const cached = cricketPremiumCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CRICKET_PREMIUM_CACHE_MS) {
      return res.status(200).json({ success: true, data: cached.payload });
    }

    const premium = await fetchProviderCPremiumFancy(gameid, 4);
    const payload = {
      premiumFancy: premium.premiumFancy ?? [],
      providerCGameId: premium.providerCGameId ?? String(gameid),
    };

    cricketPremiumCache.set(cacheKey, { ts: Date.now(), payload });
    return res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.error('Error in fetchCricketPremiumFancy:', error.message);
    return res.status(200).json({
      success: true,
      data: { premiumFancy: [], providerCGameId: String(gameid) },
    });
  }
};
