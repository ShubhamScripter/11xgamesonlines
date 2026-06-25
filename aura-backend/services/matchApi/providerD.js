import axios from 'axios';
import dotenv from 'dotenv';

import {
  fetchBsettleBookmakerResult,
  fetchBsettleFancyResult,
  fetchBsettleMatchOddsResult,
  isBsettleConfigured,
  isBookmakerResultPayload,
  isFancyResultPayload,
  normalizeBsettleFancyResult,
  normalizeBsettleSportsResult,
} from '../bsettleResultService.js';
import {
  getCompetitionsForProvider,
  hasCatalogEntries,
  isCatalogFresh,
} from '../betfairCatalog/competitionStore.js';
import { syncCompetitionsForSport } from '../betfairCatalog/competitionSync.js';
import {
  getEventsForProvider,
  hasEventCatalogEntries,
  isEventCatalogFresh,
} from '../betfairCatalog/eventStore.js';
import { syncEventsForSport } from '../betfairCatalog/eventSync.js';
import {
  findMatchOddsMarket,
  getMarketsForEvent,
  getMatchOddsMetaByEventIds,
  getSportIdForEvent,
  hasMarketsForEvent,
  isEventMarketsFresh,
} from '../betfairCatalog/marketStore.js';
import { syncMarketsForEvent } from '../betfairCatalog/marketSync.js';
import { normalizeMarketOddsToBook } from '../betfairCatalog/oddsHelpers.js';
import {
  getOddsBookForEvent,
  getOddsBooksByEventIds,
  isOddsFreshInMemory,
} from '../betfairCatalog/oddsStore.js';
import { fetchAndStoreMarketOdds } from '../betfairCatalog/oddsSync.js';
import {
  applyDefaultMarketLimits,
  applyMatchOddsToListMatch,
  chunkArray,
  collectResultMarketIds,
  enrichFancyMarketsWithEventId,
  extractBetfairArray,
  filterProviderDFullMarketMarkets,
  findMarketIdByName,
  mapPool,
  mergeMarketMetaWithBook,
  normalizeEventToListMatch,
  normalizeMarketResultResponse,
  normalizeMatchName,
  parseFancyBookmakerPayload,
  pickFeaturedOddsTargets,
} from './providerDHelpers.js';

dotenv.config();

const LIST_MARKET_BOOK_MAX = 10;
const EVENT_MARKETS_CACHE_MS =
  Number(process.env.BETFAIR_EVENT_MARKETS_CACHE_MS) || 1500;
const eventMarketsCache = new Map();

/**
 * Provider D — Winkaro Betfair APIs
 * Uses /betfair/* endpoints (not legacy /esid or /getPriveteData).
 */
export function createProviderD() {
  const API_URL =
    process.env.PROVIDER_D_API_URL || 'https://winkaro.online/api/v1';
  const API_KEY = process.env.PROVIDER_D_API_KEY || process.env.API_KEY;

  const ensureConfig = () => {
    if (!API_KEY) {
      throw new Error(
        '[ProviderD] PROVIDER_D_API_KEY (or API_KEY) must be set in .env'
      );
    }
  };

  const betfairGet = async (path, params = {}) => {
    const response = await axios.get(`${API_URL}${path}`, {
      params: { key: API_KEY, ...params },
    });
    return response.data;
  };

  const betfairPost = async (path, body = {}) => {
    const response = await axios.post(`${API_URL}${path}`, body, {
      params: { key: API_KEY },
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  };

  const normalizeBetfairList = (data) => {
    const list = extractBetfairArray(data);
    if (list.length > 0) {
      return { success: true, status: data?.status ?? 200, data: list };
    }
    return { success: false, status: data?.status ?? 500, data: [] };
  };

  const normalizeBetfairStatusResponse = (data) => {
    if (data?.status === true) {
      return { success: true, ...data };
    }
    if (data?.status === false) {
      return {
        success: false,
        message: data.message || 'Request failed',
        data: data.data ?? null,
      };
    }
    return {
      success: false,
      message: 'Unexpected response from Provider D',
      data,
    };
  };

  const resolveCompetitionsForSport = async (sportId) => {
    const sid = Number(sportId);
    const hasDb = await hasCatalogEntries(sid);
    const fresh = hasDb ? await isCatalogFresh(sid) : false;

    if (hasDb && fresh) {
      const fromDb = await getCompetitionsForProvider(sid);
      if (fromDb.length > 0) {
        return fromDb;
      }
    }

    const compData = await betfairGet(`/betfair/competition-list/${sid}`);
    const competitions = extractBetfairArray(compData);

    syncCompetitionsForSport(sid, { preloaded: competitions }).catch((err) => {
      console.warn(
        `[ProviderD] competition catalog sync failed for sport ${sid}:`,
        err.message
      );
    });

    return competitions;
  };

  const fetchEventsLiveForSport = async (sportId, competitions) => {
    const events = [];

    await mapPool(
      competitions,
      async (comp) => {
        const compId = comp?.competition?.id;
        if (!compId) return;
        try {
          const evData = await betfairGet(
            `/betfair/event-list/${sportId}/${compId}`
          );
          const evList = extractBetfairArray(evData);
          for (const ev of evList) {
            events.push({
              event: ev.event || ev,
              competitionName: comp.competition?.name || '',
            });
          }
        } catch (err) {
          console.warn(
            `[ProviderD] event-list failed for competition ${compId}:`,
            err.message
          );
        }
      },
      4
    );

    return events;
  };

  const resolveEventsForSport = async (sportId, competitions) => {
    const sid = Number(sportId);
    const hasDb = await hasEventCatalogEntries(sid);
    const fresh = hasDb ? await isEventCatalogFresh(sid) : false;

    if (hasDb && fresh) {
      const fromDb = await getEventsForProvider(sid);
      if (fromDb.length > 0) {
        return fromDb;
      }
    }

    const events = await fetchEventsLiveForSport(sid, competitions);

    syncEventsForSport(sid).catch((err) => {
      console.warn(
        `[ProviderD] event catalog sync failed for sport ${sid}:`,
        err.message
      );
    });

    return events;
  };

  const fetchAllEventsForSport = async (sportId) => {
    const competitions = await resolveCompetitionsForSport(sportId);
    return resolveEventsForSport(sportId, competitions);
  };

  const resolveMarketListForEvent = async (eventId, sportIdHint = null) => {
    const eid = String(eventId);
    const hasDb = await hasMarketsForEvent(eid);
    const fresh = hasDb ? await isEventMarketsFresh(eid) : false;

    if (hasDb && fresh) {
      const fromDb = await getMarketsForEvent(eid);
      if (fromDb.length > 0) {
        return fromDb;
      }
    }

    const data = await betfairGet(`/betfair/market-all-list/${eid}`);
    const metaList = extractBetfairArray(data);
    const sid =
      sportIdHint != null ? Number(sportIdHint) : await getSportIdForEvent(eid);

    if (sid != null && metaList.length > 0) {
      syncMarketsForEvent(eid, sid, { preloaded: metaList }).catch((err) => {
        console.warn(
          `[ProviderD] market catalog sync failed for event ${eid}:`,
          err.message
        );
      });
    }

    return metaList;
  };

  const resolveEventId = async (gameId, sportId) => {
    const id = String(gameId);

    if (await hasMarketsForEvent(id)) {
      return id;
    }

    try {
      const probe = await resolveMarketListForEvent(id, sportId);
      if (probe.length > 0) return id;
    } catch {
      // not a direct event id — search competitions
    }

    const events = await fetchAllEventsForSport(sportId);
    const direct = events.find((e) => String(e.event?.id) === id);
    if (direct?.event?.id) return String(direct.event.id);

    return id;
  };

  const fetchMarketBooksBulk = async (marketIds) => {
    const ids = [...new Set(marketIds.map(String).filter(Boolean))];
    const books = new Map();

    for (const chunk of chunkArray(ids, LIST_MARKET_BOOK_MAX)) {
      try {
        const res = await betfairPost('/betfair/listMarketBook', {
          marketIds: chunk,
        });
        const normalized = normalizeBetfairStatusResponse(res);
        const list = extractBetfairArray(normalized.data ?? normalized);
        for (const book of list) {
          if (book?.marketId) books.set(String(book.marketId), book);
        }
      } catch (err) {
        console.warn('[ProviderD] listMarketBook chunk failed:', err.message);
      }
    }

    return books;
  };

  const fetchFancyMarketsForEventId = async (eventId) => {
    let fancyMarkets = [];
    try {
      const fancyV3 = await betfairGet(
        `/betfair/fancy-all-bookmaker-odds-v3/${eventId}`
      );
      fancyMarkets = parseFancyBookmakerPayload(fancyV3);
    } catch (err) {
      console.warn('[ProviderD] fancy-all-bookmaker-odds-v3:', err.message);
    }

    if (!fancyMarkets.length) {
      try {
        const fancy = await betfairGet(
          `/betfair/fancy-bookmaker-odds/${eventId}`
        );
        fancyMarkets = parseFancyBookmakerPayload(fancy);
      } catch (err) {
        console.warn('[ProviderD] fancy-bookmaker-odds:', err.message);
      }
    }

    return enrichFancyMarketsWithEventId(
      fancyMarkets.map(applyDefaultMarketLimits),
      eventId
    );
  };

  /** Match Odds book: in-memory sync cache → single market-odds GET → listMarketBook fallback. */
  const resolveMatchOddsBookForEvent = async (eventId, matchOddsMeta) => {
    if (!matchOddsMeta?.marketId) return null;

    const eid = String(eventId);
    const marketId = String(matchOddsMeta.marketId);

    const cached = getOddsBookForEvent(eid, marketId);
    if (cached?.runners?.length) return cached;

    try {
      const raw = await betfairGet(`/betfair/market-odds/${eid}/${marketId}`);
      const book = normalizeMarketOddsToBook(raw, marketId);
      if (book.runners?.length) return book;
    } catch (err) {
      console.warn('[ProviderD] market-odds:', err.message);
    }

    try {
      const books = await fetchMarketBooksBulk([marketId]);
      return books.get(marketId) || null;
    } catch (err) {
      console.warn('[ProviderD] match-odds listMarketBook:', err.message);
      return null;
    }
  };

  /**
   * Full-market page: Match Odds + Fancy only (no tied match / bookmaker / other exchange).
   */
  const buildMarketsForEvent = async (eventId) => {
    const metaList = await resolveMarketListForEvent(eventId);
    if (!metaList.length) {
      return { success: false, data: [], message: 'No markets for event' };
    }

    const matchOddsMeta = findMatchOddsMarket(metaList);

    const [fancyMarkets, matchOddsBook] = await Promise.all([
      fetchFancyMarketsForEventId(eventId),
      resolveMatchOddsBookForEvent(eventId, matchOddsMeta),
    ]);

    const exchangeMarkets = [];
    if (matchOddsMeta) {
      exchangeMarkets.push(
        mergeMarketMetaWithBook(matchOddsMeta, matchOddsBook)
      );
    }

    const merged = filterProviderDFullMarketMarkets([
      ...exchangeMarkets,
      ...fancyMarkets,
    ]).map(applyDefaultMarketLimits);

    return { success: true, data: merged };
  };

  const buildMarketsForEventCached = async (eventId) => {
    const key = String(eventId);
    const hit = eventMarketsCache.get(key);
    if (hit && Date.now() - hit.ts < EVENT_MARKETS_CACHE_MS) {
      return hit.result;
    }

    const result = await buildMarketsForEvent(eventId);
    if (result.success) {
      eventMarketsCache.set(key, { ts: Date.now(), result });
    }
    return result;
  };

  /** Started matches only — listMarketBook inplay flag (no odds on list page). */
  const enrichListMatchesWithInplay = async (matches) => {
    const now = Date.now();
    const startedWindowMs = 6 * 60 * 60 * 1000;

    const candidates = matches.filter((m) => {
      const startMs = new Date(m.stime || 0).getTime();
      if (!Number.isFinite(startMs) || !startMs) return false;
      return startMs <= now && now - startMs <= startedWindowMs;
    });

    if (!candidates.length) return matches;

    const candidateIds = candidates.map((m) => String(m.gmid));
    const books = await getOddsBooksByEventIds(candidateIds);

    const missingIds = candidateIds.filter((id) => !books.has(id));
    if (missingIds.length > 0) {
      const eventMeta = await getMatchOddsMetaByEventIds(missingIds);
      await mapPool(
        missingIds,
        async (eventId) => {
          const meta = eventMeta.get(eventId);
          if (!meta?.marketId) return;
          try {
            if (!isOddsFreshInMemory(eventId)) {
              await fetchAndStoreMarketOdds(
                eventId,
                meta.marketId,
                meta.sportId
              );
            }
            const book = (await getOddsBooksByEventIds([eventId])).get(eventId);
            if (book) books.set(eventId, book);
          } catch {
            // keep default inplay false
          }
        },
        2
      );
    }

    const inplayByEvent = new Map();

    for (const [eventId, book] of books) {
      if (!book) continue;
      const startMs = new Date(
        matches.find((m) => String(m.gmid) === eventId)?.stime || 0
      ).getTime();
      const started =
        Number.isFinite(startMs) && startMs > 0 && startMs <= Date.now();
      const hasPrices = (book.runners || []).some((r) => {
        const back = r?.ex?.availableToBack?.[0]?.price ?? r?.back?.[0]?.price;
        return Number(back) > 1.01;
      });
      const live = Boolean(book.inplay) || (started && hasPrices);
      inplayByEvent.set(eventId, {
        iplay: live,
        inplay: live,
        status: book.status || 'OPEN',
      });
    }

    return matches.map((m) => {
      const patch = inplayByEvent.get(String(m.gmid));
      return patch ? { ...m, ...patch } : m;
    });
  };

  const mergeInplayAndOddsLists = (baseList, inplayList, oddsList) => {
    const byId = new Map(inplayList.map((m) => [String(m.gmid), m]));
    for (const m of oddsList) {
      const id = String(m.gmid);
      const base = byId.get(id) || {};
      byId.set(id, {
        ...base,
        ...m,
        inplay: Boolean(m.inplay ?? m.iplay ?? base.inplay ?? base.iplay),
        iplay: Boolean(m.iplay ?? m.inplay ?? base.iplay ?? base.inplay),
      });
    }
    return baseList.map((m) => byId.get(String(m.gmid)) || m);
  };

  /** Match Odds back/lay preview for list pages (from synced market-odds cache). */
  const enrichListMatchesWithOdds = async (matches) => {
    const eventIds = matches.map((m) => String(m.gmid));
    const eventMeta = await getMatchOddsMetaByEventIds(eventIds);

    const missingMetaIds = eventIds.filter((id) => !eventMeta.has(id));
    if (missingMetaIds.length > 0) {
      await mapPool(
        missingMetaIds,
        async (eventId) => {
          try {
            const metaList = await resolveMarketListForEvent(eventId);
            const matchOddsMeta = findMatchOddsMarket(metaList);
            if (matchOddsMeta?.marketId) {
              eventMeta.set(eventId, {
                marketId: String(matchOddsMeta.marketId),
                runners: matchOddsMeta.runners || [],
                sportId: await getSportIdForEvent(eventId),
              });
            }
          } catch {
            // keep match without odds
          }
        },
        5
      );
    }

    let books = await getOddsBooksByEventIds(eventIds);
    const needsLiveFetch = eventIds.filter(
      (id) => eventMeta.has(id) && !books.has(id) && !isOddsFreshInMemory(id)
    );

    if (needsLiveFetch.length > 0) {
      await mapPool(
        needsLiveFetch,
        async (eventId) => {
          const meta = eventMeta.get(eventId);
          if (!meta?.marketId) return;
          try {
            await fetchAndStoreMarketOdds(
              eventId,
              meta.marketId,
              meta.sportId
            );
          } catch {
            // keep match without odds
          }
        },
        5
      );
      books = await getOddsBooksByEventIds(eventIds);
    }

    if (!books.size) return matches;

    return matches.map((m) => {
      const eventId = String(m.gmid);
      const meta = eventMeta.get(eventId);
      const book = books.get(eventId);
      if (!meta || !book) return m;
      return applyMatchOddsToListMatch(m, book, meta.runners);
    });
  };

  const resolveMarketIdForResult = async (payload, sportId) => {
    const marketLabel =
      payload?.market_name ||
      payload?.game_type ||
      payload?.gameType ||
      '';
    if (!payload?.event_id || !marketLabel) return null;

    const eventId = await resolveEventId(payload.event_id, sportId);
    const markets = await resolveMarketListForEvent(eventId, sportId);
    return findMarketIdByName(markets, marketLabel);
  };

  return {
    name: 'providerD',

    async fetchCompetitionList(sportId) {
      ensureConfig();
      const data = await betfairGet(`/betfair/competition-list/${sportId}`);
      return normalizeBetfairList(data);
    },

    async fetchEventList(sportId, competitionId) {
      ensureConfig();
      const data = await betfairGet(
        `/betfair/event-list/${sportId}/${competitionId}`
      );
      return normalizeBetfairList(data);
    },

    async fetchMarketList(eventId) {
      ensureConfig();
      const metaList = await resolveMarketListForEvent(eventId);
      return normalizeBetfairList({ data: metaList });
    },

    async fetchMarketOdds(eventId, marketId) {
      ensureConfig();
      const data = await betfairGet(
        `/betfair/market-odds/${eventId}/${marketId}`
      );
      return normalizeBetfairStatusResponse(data);
    },

    async fetchMarketBookBulk(marketIds) {
      ensureConfig();
      const ids = Array.isArray(marketIds) ? marketIds.map(String) : [];
      const data = await betfairPost('/betfair/listMarketBook', {
        marketIds: ids,
      });
      return normalizeBetfairStatusResponse(data);
    },

    async fetchFancyBookmakerOdds(eventId) {
      ensureConfig();
      const data = await betfairGet(
        `/betfair/fancy-bookmaker-odds/${eventId}`
      );
      return normalizeBetfairStatusResponse(data);
    },

    async fetchFancyAllBookmakerOddsV3(eventId) {
      ensureConfig();
      const data = await betfairGet(
        `/betfair/fancy-all-bookmaker-odds-v3/${eventId}`
      );
      return normalizeBetfairStatusResponse(data);
    },

    /** Match list via competition-list → event-list (+ optional Match Odds preview) */
    async fetchMatchList(sportId, options = {}) {
      ensureConfig();
      const includeOdds = options?.includeOdds === true;
      const events = await fetchAllEventsForSport(sportId);
      let matches = events.map(({ event, competitionName }) =>
        normalizeEventToListMatch({ event }, competitionName)
      );

      matches = matches.filter((m) => m.ename && m.gmid);
      matches.sort(
        (a, b) => new Date(a.stime || 0) - new Date(b.stime || 0)
      );

      if (includeOdds) {
        try {
          const oddsScope =
            options?.oddsScope === 'eligible' ? 'eligible' : 'all';
          const targets =
            oddsScope === 'eligible'
              ? pickFeaturedOddsTargets(matches)
              : matches;
          const [withInplay, withOdds] = await Promise.all([
            enrichListMatchesWithInplay(matches),
            enrichListMatchesWithOdds(targets),
          ]);

          matches = mergeInplayAndOddsLists(matches, withInplay, withOdds);
        } catch (err) {
          console.warn(
            '[ProviderD] odds enrichment failed, returning list only:',
            err.message
          );
          matches = await enrichListMatchesWithInplay(matches);
        }
      } else {
        matches = await enrichListMatchesWithInplay(matches);
      }

      return {
        success: true,
        msg: 'Success',
        status: 200,
        data: { t1: matches, t2: [] },
      };
    },

    /** Full market data via market-all-list + listMarketBook + fancy APIs */
    async fetchMatchData(gameId, sportId) {
      ensureConfig();
      const eventId = await resolveEventId(gameId, sportId);
      const result = await buildMarketsForEventCached(eventId);
      return {
        success: result.success,
        msg: result.success ? 'Success' : result.message || 'Failed',
        status: result.success ? 200 : 500,
        data: result.data,
      };
    },

    /** Fancy-only fetch for fast bet validation (skips exchange market-all-list + listMarketBook) */
    async fetchFancyMarketsForEvent(gameId, sportId) {
      ensureConfig();
      const eventId = await resolveEventId(gameId, sportId);
      const data = await fetchFancyMarketsForEventId(eventId);
      return {
        success: true,
        msg: 'Success',
        status: 200,
        data,
      };
    },

    /**
     * Returns { final_result } for betController compatibility.
     * Sports/bookmaker: bsettle match-odds or bookmaker endpoints when configured.
     */
    async getResult(payload = {}) {
      ensureConfig();
      const sportId = Number(payload.sport_id) || 4;
      const eventId = payload.event_id || payload.eventId;

      let marketIds = collectResultMarketIds(payload);

      if (!marketIds.length) {
        const resolved = await resolveMarketIdForResult(payload, sportId);
        if (resolved) marketIds.push(resolved);
      }

      marketIds = [...new Set(marketIds)];
      if (!marketIds.length) {
        console.warn(
          '[RESULT-API] getResult: no marketIds for',
          payload.event_id,
          payload.market_name || payload.gameType
        );
        return {};
      }

      const marketId = marketIds[0];
      const marketLabel =
        payload.market_name || payload.gameType || payload.game_type || '';

      console.log('[RESULT-API] getResult called');
      console.log('[RESULT-API] eventId:', eventId);
      console.log('[RESULT-API] sport_id:', sportId);
      console.log('[RESULT-API] market_name:', marketLabel);
      console.log('[RESULT-API] all marketIds:', marketIds);
      console.log('[RESULT-API] payload.market_id:', payload.market_id);

      const bsettleReady = isBsettleConfigured();
      const fancyPayload = isFancyResultPayload(payload);
      console.log('[RESULT-API] isBsettleConfigured:', bsettleReady);
      console.log('[RESULT-API] isFancyResultPayload:', fancyPayload);

      if (bsettleReady && !fancyPayload) {
        console.log('bsettle configured is open for result');
        const path = isBookmakerResultPayload(payload)
          ? 'bookmaker'
          : 'match-odds';
        console.log(
          `[RESULT-API]2 shubham routing → POST /result/${path} (bsettle configured)`
        );
        const raw =
          path === 'bookmaker'
            ? await fetchBsettleBookmakerResult(eventId, marketId)
            : await fetchBsettleMatchOddsResult(eventId, marketId);
        const normalized = normalizeBsettleSportsResult(raw, marketId);
        console.log('[RESULT-API] normalized sports result:', normalized);
        return normalized;
      }

      console.log("bsettle configured is close for result");

      console.log(
        '[RESULT-API] routing → POST /result/get-market-results (fallback)',
        { marketIds }
      );
      const raw = await betfairPost('/result/get-market-results', { marketIds });
      const normalized = normalizeMarketResultResponse(raw, marketIds[0]);
      console.log('[RESULT-API] normalized fallback result:', normalized);
      return normalized;
    },

    /**
     * No external bet placement API for Provider D — bets are stored/settled locally.
     */
    async sendBetIncoming(payload = {}) {
      console.log(
        '[ProviderD] sendBetIncoming skipped (local DB bet):',
        payload.market_name || payload.fancyType,
        'event:',
        payload.event_id
      );
      return { success: true, local: true };
    },

    async fetchCasinoTables() {
      ensureConfig();
      throw new Error('[ProviderD] fetchCasinoTables not configured yet');
    },

    async fetchCasinoData() {
      ensureConfig();
      throw new Error('[ProviderD] fetchCasinoData not configured yet');
    },

    async fetchCasinoResult() {
      ensureConfig();
      throw new Error('[ProviderD] fetchCasinoResult not configured yet');
    },

    async fetchCasinoDetailResult() {
      ensureConfig();
      throw new Error('[ProviderD] fetchCasinoDetailResult not configured yet');
    },

    async fetchCricketFancyResult(eventId, fancyId) {
      ensureConfig();
      if (!isBsettleConfigured()) {
        throw new Error(
          '[ProviderD] fetchCricketFancyResult requires PROVIDER_D_API_KEY (or API_KEY)'
        );
      }
      const fancyMarketId = `${eventId}_${fancyId}`;
      console.log('[RESULT-API] fetchCricketFancyResult called');
      console.log('[RESULT-API] routing → POST /result/fancy');
      console.log('[RESULT-API] eventId:', String(eventId));
      console.log('[RESULT-API] fancyId:', String(fancyId));
      console.log('[RESULT-API] marketIds:', [fancyMarketId]);
      const raw = await fetchBsettleFancyResult(eventId, fancyId);
      const normalized = normalizeBsettleFancyResult(raw);
      console.log('[RESULT-API] normalized fancy result:', normalized);
      return normalized;
    },

    async fetchCricketFancyByEvent() {
      ensureConfig();
      throw new Error('[ProviderD] fetchCricketFancyByEvent not configured yet');
    },

    async fetchStFancyByEvent() {
      ensureConfig();
      throw new Error('[ProviderD] fetchStFancyByEvent not configured yet');
    },

    async resolveBetfairEventId(gmid, sportId = 4) {
      ensureConfig();
      return resolveEventId(gmid, sportId);
    },

    async fetchScore(gmid, sid) {
      ensureConfig();
      const eventId = await resolveEventId(gmid, sid);
      const data = await betfairGet('/betfair-score', { gmid: eventId });
      return { ...data, resolvedEventId: eventId };
    },

    async fetchAllIframes() {
      ensureConfig();
      throw new Error('[ProviderD] fetchAllIframes not configured yet');
    },
  };
}
