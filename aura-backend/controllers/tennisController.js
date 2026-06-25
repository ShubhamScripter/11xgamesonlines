import dotenv from 'dotenv';
import {
  fetchMatchData,
  fetchScore,
} from '../services/matchApi/index.js';
import {
  getAnyCachedSportPayload,
  serveSportsListRequest,
} from '../services/sportsListCache/sportsListCacheService.js';
import {
  sendBettingApiError,
  sendBettingProviderFailure,
} from '../utils/bettingApiErrors.js';

dotenv.config();

export const fetchTennisData = async (req, res) => {
  const withOdds =
    req.query?.withOdds === 'true' || req.query?.withOdds === '1';
  const oddsScope = req.query?.oddsScope === 'eligible' ? 'eligible' : 'all';

  try {
    const payload = await serveSportsListRequest(
      'tennis',
      withOdds,
      oddsScope
    );
    return res.status(200).json(payload);
  } catch (error) {
    console.error('Error fetching tennis data:', error.message);

    const stale = await getAnyCachedSportPayload('tennis');
    if (stale) {
      return res.status(200).json(stale);
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

export const getTennisScorecard = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const data = await fetchScore(gameid, 2);
    if (data?.success && data?.iframe?.url) {
      return res.status(200).json(data);
    }
    return res.status(502).json({
      success: false,
      message: data?.message || 'Scorecard not available',
      data,
    });
  } catch (error) {
    console.error('Error fetching tennis scorecard:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const fetchTannisBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const json = await fetchMatchData(gameid, 2);

    if (json.success) {
      return res.status(200).json({
        success: true,
        data: json,
      });
    }

    return sendBettingProviderFailure(res, json, gameid);
  } catch (error) {
    console.error('Error in fetchBettingData:', error.message);
    return sendBettingApiError(res, error, gameid);
  }
};
