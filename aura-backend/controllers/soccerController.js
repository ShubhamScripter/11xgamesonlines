import dotenv from 'dotenv';
import { fetchMatchData } from '../services/matchApi/index.js';
import {
  getAnyCachedSportPayload,
  serveSportsListRequest,
} from '../services/sportsListCache/sportsListCacheService.js';

dotenv.config();

export const fetchSoccerData = async (req, res) => {
  const withOdds =
    req.query?.withOdds === 'true' || req.query?.withOdds === '1';
  const oddsScope = req.query?.oddsScope === 'eligible' ? 'eligible' : 'all';

  try {
    const payload = await serveSportsListRequest(
      'soccer',
      withOdds,
      oddsScope
    );
    return res.status(200).json(payload);
  } catch (error) {
    console.error('Error fetching soccer data:', error.message);

    const stale = await getAnyCachedSportPayload('soccer');
    if (stale) {
      return res.status(200).json(stale);
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

export const fetchsoccerBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const json = await fetchMatchData(gameid, 1);

    if (json.success) {
      res.status(200).json({
        success: true,
        data: json,
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: 'Invalid response from API' });
    }
  } catch (error) {
    console.error('Error in fetchBettingData:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
