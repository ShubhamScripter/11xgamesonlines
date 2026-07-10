import { cachedData } from '../socket/bettingSocket.js';
import { unwrapMatchMarkets } from '../services/matchApi/hybridMatchData.js';
import { fetchMatchData } from '../services/matchApi/index.js';
import {
  sendBettingApiError,
  sendBettingProviderFailure,
} from './bettingApiErrors.js';

const memoryCache = new Map();
const MEMORY_CACHE_MS = Number(process.env.SPORTS_BETTING_CACHE_MS) || 10000;

const APITYPE_BY_SID = {
  4: 'cricket',
  1: 'soccer',
  2: 'tennis',
  10: 'horse-racing',
};

/**
 * Fast fullmarket betting response for all sports:
 * 1) live socket poll cache
 * 2) short memory cache
 * 3) provider fetch (Provider D already times out fancy at ~3s)
 */
export async function serveSportsBettingRequest(req, res, sportId) {
  const { gameid } = req.query;
  const sid = Number(sportId);

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  const apitype = APITYPE_BY_SID[sid] || 'cricket';
  const cacheKey = String(gameid);
  const memKey = `${apitype}:${cacheKey}`;

  try {
    const socketHit = cachedData[`${cacheKey}_${apitype}`];
    const socketMarkets =
      socketHit?.outbound?.markets || unwrapMatchMarkets(socketHit);
    if (Array.isArray(socketMarkets) && socketMarkets.length > 0) {
      const payload = {
        success: true,
        data: socketMarkets,
        premiumFancy: socketHit?.outbound?.premiumFancy || [],
        providerCGameId:
          socketHit?.outbound?.providerCGameId || String(gameid),
      };
      return res.status(200).json({ success: true, data: payload });
    }

    const cached = memoryCache.get(memKey);
    if (cached && Date.now() - cached.ts < MEMORY_CACHE_MS) {
      return res.status(200).json({ success: true, data: cached.payload });
    }

    const json = await fetchMatchData(gameid, sid);

    if (json.success) {
      memoryCache.set(memKey, { ts: Date.now(), payload: json });
      return res.status(200).json({ success: true, data: json });
    }

    if (cached?.payload) {
      return res.status(200).json({
        success: true,
        stale: true,
        data: cached.payload,
      });
    }

    return sendBettingProviderFailure(res, json, gameid);
  } catch (error) {
    console.error(
      `[BETTING] ${apitype} gameId=${gameid}:`,
      error.message
    );
    const stale = memoryCache.get(memKey);
    if (stale?.payload) {
      return res.status(200).json({
        success: true,
        stale: true,
        data: stale.payload,
      });
    }
    return sendBettingApiError(res, error, gameid);
  }
}
