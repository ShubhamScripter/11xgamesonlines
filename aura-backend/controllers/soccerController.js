import dotenv from 'dotenv';
import {
  getAnyCachedSportPayload,
  serveSportsListRequest,
} from '../services/sportsListCache/sportsListCacheService.js';
import { filterFullyDisabledFromPayload } from '../utils/matchSectionSettings.js';
import { serveSportsBettingRequest } from '../utils/sportsBettingServe.js';

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
      const filtered = await filterFullyDisabledFromPayload(stale, 'soccer');
      return res.status(200).json(filtered);
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

export const fetchsoccerBettingData = (req, res) =>
  serveSportsBettingRequest(req, res, 1);
