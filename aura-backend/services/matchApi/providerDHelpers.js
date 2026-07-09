/**
 * Betfair API response normalizers for Provider D (winkaro.online).
 */

export const BETFAIR_SPORT_IDS = {
  soccer: 1,
  tennis: 2,
  cricket: 4,
};

/** Static stake limits (Betfair APIs do not provide min/max). */
export const DEFAULT_MARKET_MIN = 1;
export const DEFAULT_MARKET_MAX = 10000;

export function applyDefaultMarketLimits(market) {
  if (!market || typeof market !== 'object') return market;
  const min =
    market.min ?? market.minLiabilityPerBet ?? DEFAULT_MARKET_MIN;
  const max =
    market.max ??
    market.maxLiabilityPerBet ??
    market.maxb ??
    DEFAULT_MARKET_MAX;
  const minN = Number(min);
  const maxN = Number(max);
  return {
    ...market,
    min: Number.isFinite(minN) && minN > 0 ? minN : DEFAULT_MARKET_MIN,
    max: Number.isFinite(maxN) && maxN > 0 ? maxN : DEFAULT_MARKET_MAX,
    maxb:
      Number.isFinite(Number(market.maxb)) && Number(market.maxb) > 0
        ? Number(market.maxb)
        : Number.isFinite(maxN) && maxN > 0
          ? maxN
          : DEFAULT_MARKET_MAX,
  };
}

function toPosFancyNum(...vals) {
  for (const v of vals) {
    if (v == null || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function isExchangeStyleFancyOdds(lineVal, rateVal) {
  return (
    lineVal != null &&
    rateVal != null &&
    lineVal > 0 &&
    lineVal < 10 &&
    rateVal >= 1000
  );
}

/**
 * fancy1 session/toss: Winkaro encodes line+rate in back1.odds (e.g. 1.96 → line 1, rate 96)
 * with inflated size (500000). Decode before exchange-style filter removes it.
 */
function decodeFancy1EncodedOdds(section, market = {}) {
  const mname = String(market.mname || market.name || '').toLowerCase();
  const gtype = String(market.gtype || '').toLowerCase();
  if (mname !== 'fancy1' && gtype !== 'fancy1') return null;

  const raw = Array.isArray(section.odds) ? section.odds : [];
  const pick = (name) =>
    raw.find((o) => String(o.oname || o.name || '').toLowerCase() === name);

  const decodeSide = (entry) => {
    if (!entry) return null;
    const price = Number(entry.odds);
    const vol = Number(entry.size);
    if (!Number.isFinite(price) || price <= 0) return null;

    if (vol > 0 && vol < 1000 && price <= 15) {
      return { line: price, rate: vol };
    }

    if (price > 1 && price < 10 && (!Number.isFinite(vol) || vol >= 1000)) {
      const line = Math.floor(price) || 1;
      const rate = Math.round((price - line) * 100);
      if (rate > 0) return { line, rate };
    }
    return null;
  };

  const back = decodeSide(pick('back1'));
  const lay = decodeSide(pick('lay1'));
  const primary = back || lay;
  if (!primary) return null;

  const noSide = lay || primary;
  const yesSide = back || primary;
  return [
    {
      oname: 'lay1',
      otype: 'lay',
      tno: 0,
      odds: noSide.line,
      size: noSide.rate,
    },
    {
      oname: 'back1',
      otype: 'back',
      tno: 0,
      odds: yesSide.line,
      size: yesSide.rate,
    },
  ];
}

/**
 * Normalize fancy section odds to legacy UI shape:
 * big number = line/score (odds), small number = rate (size).
 * Handles fancy1 b1/l1 fields and filters exchange-style price/size leaks.
 */
export function normalizeFancySectionOdds(section, market = {}) {
  if (!section || typeof section !== 'object') return [];

  const mname = String(market.mname || market.name || '').toLowerCase();
  const gtype = String(market.gtype || '').toLowerCase();
  const isFancy1 = mname === 'fancy1' || gtype === 'fancy1';

  const decodedFancy1 = decodeFancy1EncodedOdds(section, market);
  if (decodedFancy1?.length) return decodedFancy1;

  const b1 = toPosFancyNum(
    section.b1,
    section.b,
    section.back,
    market.b1,
    market.back
  );
  const l1 = toPosFancyNum(
    section.l1,
    section.l,
    section.lay,
    market.l1,
    market.lay
  );
  const line = toPosFancyNum(
    section.bs1,
    section.bs,
    section.ls1,
    section.line,
    section.runs
  );

  if (b1 != null || l1 != null) {
    const lineVal = line ?? (isFancy1 ? 1 : line ?? 1);
    const out = [];
    if (l1 != null) {
      out.push({ oname: 'lay1', otype: 'lay', tno: 0, odds: lineVal, size: l1 });
    }
    if (b1 != null) {
      out.push({ oname: 'back1', otype: 'back', tno: 0, odds: lineVal, size: b1 });
    }
    return out;
  }

  const raw = Array.isArray(section.odds) ? section.odds : [];
  const pick = (names, otype) =>
    raw.find((o) => {
      const on = String(o.oname || o.name || '').toLowerCase();
      return names.includes(on) || o.otype === otype;
    });

  const fixSide = (entry, oname, otype) => {
    if (!entry) return null;
    let lineVal = toPosFancyNum(entry.odds, entry.line, entry.runs);
    let rateVal = toPosFancyNum(entry.size, entry.rate, entry.vol, entry.volume);

    if (lineVal != null && rateVal != null) {
      if (isExchangeStyleFancyOdds(lineVal, rateVal)) return null;

      if (rateVal <= 15 && lineVal > 20) {
        [lineVal, rateVal] = [rateVal, lineVal];
      } else if (isFancy1 && lineVal > 20 && rateVal <= 15) {
        [lineVal, rateVal] = [rateVal, lineVal];
      }
    }

    if (lineVal == null && rateVal == null) return null;

    const finalLine =
      isFancy1 && (lineVal == null || lineVal > 15) ? 1 : (lineVal ?? 1);

    return {
      oname,
      otype,
      tno: entry.tno ?? 0,
      odds: finalLine,
      size: rateVal ?? 0,
    };
  };

  const out = [];
  const lay = fixSide(pick(['lay1', 'lay', 'no'], 'lay'), 'lay1', 'lay');
  const back = fixSide(pick(['back1', 'back', 'yes'], 'back'), 'back1', 'back');
  if (lay) out.push(lay);
  if (back) out.push(back);
  if (out.length) return out;

  return raw.filter((o) => {
    const lineVal = toPosFancyNum(o.odds, o.line);
    const rateVal = toPosFancyNum(o.size, o.rate);
    return !isExchangeStyleFancyOdds(lineVal, rateVal);
  });
}

export function normalizeFancyMarketSections(market) {
  if (!market || !Array.isArray(market.section)) return market;
  return {
    ...market,
    section: market.section.map((sec) => ({
      ...sec,
      odds: normalizeFancySectionOdds(sec, market),
    })),
  };
}

export function normalizeMatchName(name = '') {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+vs\s+/gi, ' v ')
    .replace(/\s+/g, ' ');
}

/** Unwrap { status: 200, body: { success, data } } style envelopes */
export function unwrapBetfairPayload(data) {
  if (!data || typeof data !== 'object') return data;
  if (
    data.body &&
    typeof data.body === 'object' &&
    !Array.isArray(data.body)
  ) {
    return data.body;
  }
  return data;
}

export function extractBetfairArray(data) {
  if (Array.isArray(data)) return data;

  const root = unwrapBetfairPayload(data);
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.data)) return root.data;

  if (root?.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    const nested = [];
    for (const key of ['fancy', 'bookmaker', 'normal', 'fancy1', 'data']) {
      if (Array.isArray(root.data[key])) nested.push(...root.data[key]);
    }
    if (nested.length) return nested;
  }

  if (Array.isArray(data?.body)) return data.body;
  if (Array.isArray(data?.body?.data)) return data.body.data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function mapMarketName(marketName = '') {
  const n = String(marketName).trim();
  const lower = n.toLowerCase();
  if (lower === 'match odds') return 'MATCH_ODDS';
  if (lower.includes('bookmaker')) return 'Bookmaker';
  return n;
}

export function isTiedMatchMarket(market) {
  const name = String(
    market?.marketName || market?.name || market?.mname || ''
  ).toLowerCase();
  const mtype = String(market?.mtype || '').toUpperCase();
  const mname = String(market?.mname || '').toUpperCase();
  return (
    name.includes('tied match') ||
    mtype === 'TIED_MATCH' ||
    mname === 'TIED_MATCH' ||
    mname === 'TIED MATCH'
  );
}

export function excludeTiedMatchMarkets(markets) {
  if (!Array.isArray(markets)) return markets;
  return markets.filter((m) => !isTiedMatchMarket(m));
}

export function isBookmakerMarket(market) {
  const name = String(
    market?.marketName || market?.name || market?.mname || ''
  ).toLowerCase();
  const mtype = String(market?.mtype || '').toUpperCase();
  const mname = String(market?.mname || '').toUpperCase();
  return (
    name.includes('bookmaker') ||
    mtype === 'BOOKMAKER' ||
    mname === 'BOOKMAKER' ||
    mname === 'Bookmaker'
  );
}

export function isMatchOddsMarket(market) {
  const name = String(
    market?.marketName || market?.name || market?.mname || ''
  ).toLowerCase();
  const mtype = String(market?.mtype || '').toUpperCase();
  const mname = String(market?.mname || '').toUpperCase();
  return (
    name.includes('match odds') ||
    mtype === 'MATCH_ODDS' ||
    mname === 'MATCH_ODDS'
  );
}

/** Duplicate MATCH_ODDS from fancy-bookmaker API (gtype match, not Betfair 1.x id). */
export function isFancyApiMatchOddsDuplicate(market) {
  if (!isMatchOddsMarket(market)) return false;
  const gtype = String(market?.gtype || '').toLowerCase();
  const marketId = String(
    market?.marketId || market?.id || market?.mid || ''
  );
  return gtype === 'match' && !marketId.startsWith('1.');
}

/** Fancy session markets for full-market page (not bookmaker / tied / oddeven). */
export function isFancySessionMarket(market) {
  if (
    isTiedMatchMarket(market) ||
    isBookmakerMarket(market) ||
    isMatchOddsMarket(market)
  ) {
    return false;
  }

  const mname = String(market?.mname || market?.name || '').toLowerCase();
  const gtype = String(market?.gtype || '').toLowerCase();
  const hasSections =
    Array.isArray(market?.section) && market.section.length > 0;

  if (!hasSections) return false;
  if (mname === 'oddeven' || mname.includes('odd even')) return false;
  if (mname === 'normal' || mname === 'fancy1') return true;
  if (
    ['fancy', 'fancy1', 'ball', 'khado', 'line', 'meter'].includes(gtype)
  ) {
    return true;
  }
  if (market?.mtype === 'INNINGS_RUNS') return true;
  return false;
}

/** Provider D full-market UI: Match Odds + Bookmaker + Fancy (exclude tied / duplicate match odds). */
export function filterProviderDFullMarketMarkets(markets = []) {
  if (!Array.isArray(markets)) return [];
  return markets.filter(
    (m) =>
      (isMatchOddsMarket(m) && !isFancyApiMatchOddsDuplicate(m)) ||
      isBookmakerMarket(m) ||
      isFancySessionMarket(m)
  );
}

export function mapMarketType(marketName = '') {
  const lower = String(marketName).toLowerCase();
  if (lower === 'match odds') return 'MATCH_ODDS';
  if (lower.includes('bookmaker')) return 'BOOKMAKER';
  if (lower.includes('over') || lower.includes('innings')) return 'INNINGS_RUNS';
  if (lower.includes('odd') && lower.includes('even')) return 'oddeven';
  return upperSnake(marketName);
}

function upperSnake(str) {
  return String(str)
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

export function runnerExToOdds(runner) {
  const back = runner?.ex?.availableToBack?.[0] || runner?.back?.[0];
  const lay = runner?.ex?.availableToLay?.[0] || runner?.lay?.[0];
  const odds = [];
  if (back) {
    odds.push({
      oname: 'back1',
      otype: 'back',
      tno: 0,
      odds: back.price,
      size: back.size,
    });
  }
  if (lay) {
    odds.push({
      oname: 'lay1',
      otype: 'lay',
      tno: 0,
      odds: lay.price,
      size: lay.size,
    });
  }
  return odds;
}

/** Homepage / featured cards: in-play + today/tomorrow + recently started (for live flag). */
export function pickFeaturedOddsTargets(matches = []) {
  const nowMs = Date.now();
  const now = new Date();
  const today = now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toDateString();
  const startedWindowMs = 6 * 60 * 60 * 1000;

  return matches.filter((m) => {
    if (m?.iplay || m?.inplay) return true;
    const d = new Date(m?.stime || 0);
    if (Number.isNaN(d.getTime())) return false;
    const startMs = d.getTime();
    const ds = d.toDateString();
    if (ds === today || ds === tomorrowStr) return true;
    if (startMs <= nowMs && nowMs - startMs <= startedWindowMs) return true;
    return false;
  });
}

export function runnersToSection(runners = [], metaRunners = []) {
  const metaById = new Map(
    metaRunners.map((r) => [String(r.selectionId), r.runnerName || r.name])
  );

  return runners.map((runner) => {
    const sid = runner.selectionId ?? runner.id;
    const name =
      runner.runnerName ||
      runner.name ||
      metaById.get(String(sid)) ||
      '';
    return {
      nat: name,
      sid,
      gstatus: runner.status || 'ACTIVE',
      status: runner.status || 'ACTIVE',
      odds: runnerExToOdds(runner),
    };
  });
}

export function mergeMarketMetaWithBook(meta, book) {
  const metaRunners = meta?.runners || [];
  const liveRunners = book?.runners || [];
  const runnerMap = new Map(
    liveRunners.map((r) => [String(r.selectionId), r])
  );

  const mergedRunners = metaRunners.map((mr) => {
    const live = runnerMap.get(String(mr.selectionId)) || {};
    const back = live.ex?.availableToBack?.[0];
    const lay = live.ex?.availableToLay?.[0];
    return {
      id: mr.selectionId,
      name: mr.runnerName,
      status: live.status || book?.status || 'ACTIVE',
      back: back ? [{ price: back.price, size: back.size }] : [],
      lay: lay ? [{ price: lay.price, size: lay.size }] : [],
    };
  });

  const mname = mapMarketName(meta.marketName);
  const mtype = mapMarketType(meta.marketName);
  const status = book?.status || meta.status || 'OPEN';

  return {
    id: meta.marketId,
    marketId: meta.marketId,
    mid: meta.marketId,
    gmid: meta.event?.id,
    name: meta.marketName,
    mname,
    mtype,
    status,
    inplay: book?.inplay ?? false,
    matched: book?.totalMatched ?? meta.totalMatched ?? 0,
    runners: mergedRunners,
    section: runnersToSection(liveRunners.length ? liveRunners : mergedRunners, metaRunners),
    event: meta.event,
    competition: meta.competition,
  };
}

export function normalizeEventToListMatch(eventWrapper, competitionName) {
  const ev = eventWrapper?.event || eventWrapper;
  const openDate = ev?.openDate || '';
  return {
    gmid: ev?.id,
    beventId: ev?.id,
    oldgmid: ev?.id,
    ename: ev?.name || '',
    stime: openDate,
    cname: competitionName || '',
    iplay: false,
    inplay: false,
    status: 'OPEN',
  };
}

export function applyMatchOddsToListMatch(match, book, metaRunners = []) {
  if (!book?.runners?.length) return match;

  const nameById = new Map(
    metaRunners.map((r) => [String(r.selectionId), r.runnerName || ''])
  );

  const sections = book.runners.map((runner) => ({
    nat: nameById.get(String(runner.selectionId)) || '',
    sid: runner.selectionId,
    gstatus: runner.status || book.status || 'ACTIVE',
    odds: runnerExToOdds(runner),
  }));

  const section =
    sections.length >= 3
      ? sections.slice(0, 3)
      : sections.length === 2
        ? [
            sections[0],
            {
              nat: 'Draw',
              odds: [{ odds: 0, size: 0 }, { odds: 0, size: 0 }],
              gstatus: 'OPEN',
            },
            sections[1],
          ]
        : sections;

  return {
    ...match,
    iplay: Boolean(book.inplay),
    inplay: Boolean(book.inplay),
    status: book.status || match.status,
    section,
  };
}

/** Parse fancy / bookmaker payloads from fancy-bookmaker-odds or v3 */
export function parseFancyBookmakerPayload(raw) {
  const items = extractBetfairArray(raw);
  if (items.length > 0) {
    return items.map(normalizeLegacyMarket).filter(Boolean);
  }

  const root = unwrapBetfairPayload(raw);
  const success =
    root?.success === true ||
    root?.status === true ||
    root?.status === 200 ||
    raw?.status === 200;

  if (root && typeof root === 'object' && success && root.data) {
    const d = root.data;
    if (Array.isArray(d)) return d.map(normalizeLegacyMarket).filter(Boolean);
    const out = [];
    for (const key of ['fancy', 'bookmaker', 'normal', 'fancy1', 'data']) {
      if (Array.isArray(d[key])) {
        out.push(...d[key].map(normalizeLegacyMarket).filter(Boolean));
      }
    }
    if (out.length) return out;
  }

  return [];
}

function normalizeLegacyMarket(m) {
  if (!m || typeof m !== 'object') return null;
  if (m.mname || m.section) return m;
  if (m.marketName || m.name) {
    return {
      ...m,
      mname: m.mname || mapMarketName(m.marketName || m.name),
      section: m.section || [],
      runners: m.runners || [],
    };
  }
  return m;
}

/** Fancy settlement id: `${eventId}_${section.sid}` */
export function buildFancyMarketId(eventId, sid) {
  if (eventId == null || sid == null || String(sid).trim() === '') return null;
  return `${String(eventId)}_${String(sid)}`;
}

const FANCY_GTYPE_SET = new Set([
  'fancy',
  'fancy1',
  'khado',
  'oddeven',
  'meter',
  'line',
  'ball',
]);

/** Attach eventId + per-section marketId for fancy-all-bookmaker-odds-v3 payloads */
export function enrichFancyMarketsWithEventId(markets, eventId) {
  if (!eventId || !Array.isArray(markets)) return markets;
  const eid = String(eventId);

  return markets.map((market) => {
    const gtype = String(market?.gtype || '').toLowerCase();
    const mname = String(market?.mname || market?.name || '').toLowerCase();
    const isFancyMarket =
      FANCY_GTYPE_SET.has(gtype) ||
      mname === 'normal' ||
      mname === 'fancy1' ||
      mname === 'oddeven';
    if (!isFancyMarket || !Array.isArray(market.section)) {
      return market;
    }

    return {
      ...market,
      eventId: eid,
      section: market.section.map((sec) => {
        const marketId = buildFancyMarketId(eid, sec.sid);
        const normalizedSec = {
          ...sec,
          fancyId: sec.sid,
          marketId,
          market_id: marketId,
          odds: normalizeFancySectionOdds(sec, market),
        };
        return normalizedSec;
      }),
    };
  });
}

export async function mapPool(items, fn, concurrency = 5) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Unwrap bsettle result envelopes:
 * { status: 200, body: [{ status: true, result: { winnerName, marketId, ... } }] }
 */
export function unwrapBsettleResultItem(item) {
  if (!item || typeof item !== 'object') return item;
  const inner = item.result;
  if (
    inner &&
    typeof inner === 'object' &&
    !Array.isArray(inner) &&
    (inner.winnerName != null ||
      inner.marketId != null ||
      inner.market_id != null ||
      inner.eventId != null ||
      inner.type != null)
  ) {
    return inner;
  }
  return item;
}

export function extractBsettleResultRow(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (Array.isArray(raw.data) && raw.data.length) {
    return unwrapBsettleResultItem(raw.data[0]);
  }
  if (Array.isArray(raw.body?.data) && raw.body.data.length) {
    return unwrapBsettleResultItem(raw.body.data[0]);
  }
  if (Array.isArray(raw.body) && raw.body.length) {
    return unwrapBsettleResultItem(raw.body[0]);
  }
  if (Array.isArray(raw) && raw.length) return unwrapBsettleResultItem(raw[0]);
  return unwrapBsettleResultItem(raw);
}

export function normalizeMarketResultResponse(raw, marketId) {
  if (raw?.final_result != null && String(raw.final_result).trim() !== '') {
    return {
      final_result: String(raw.final_result).trim(),
      marketId: raw.marketId || raw.market_id || marketId,
      raw,
    };
  }

  const list = extractBetfairArray(raw).map(unwrapBsettleResultItem);
  if (!list.length) return {};

  const item =
    list.find(
      (r) => String(r.marketId || r.market_id) === String(marketId)
    ) || list[0];

  const winner =
    item.winnerName ??
    item.winner ??
    item.result ??
    item.winnerRunnerName ??
    item.runnerName ??
    item.selectionName ??
    item.winningSelection ??
    (Array.isArray(item.runners)
      ? item.runners.find((r) => r.status === 'WINNER')?.runnerName ||
        item.runners.find((r) => r.status === 'WINNER')?.name
      : null);

  if (winner == null || winner === '') return {};

  return {
    final_result: String(winner),
    marketId: item.marketId || item.market_id || marketId,
    raw: item,
  };
}

const RESULT_MARKET_ALIASES = {
  MATCH_ODDS: 'match odds',
  TIED_MATCH: 'tied match',
  BOOKMAKER: 'bookmaker',
  'Match Odds': 'match odds',
  'Tied Match': 'tied match',
  Bookmaker: 'bookmaker',
};

export function isBetfairExchangeMarketId(id) {
  if (id == null || id === '') return false;
  return /^\d+\.\d+$/.test(String(id).trim());
}

/** Collect marketIds for POST /result/get-market-results */
export function collectResultMarketIds(payload = {}) {
  const ids = new Set();

  if (Array.isArray(payload.marketIds)) {
    for (const id of payload.marketIds) {
      const s = String(id ?? '').trim();
      if (s) ids.add(s);
    }
  }

  const fromPayload = payload.market_id;
  if (fromPayload != null && String(fromPayload).trim()) {
    const s = String(fromPayload).trim();
    if (isBetfairExchangeMarketId(s) || /^\d+$/.test(s) || /^\d+_\d+$/.test(s)) {
      ids.add(s);
    }
  }

  return [...ids];
}

export function findMarketIdByName(markets, marketName = '') {
  const key = String(marketName).trim();
  const lower = (RESULT_MARKET_ALIASES[key] || key).toLowerCase();

  const found = markets.find((m) => {
    const name = String(m.marketName || m.name || '').toLowerCase();
    return (
      name === lower ||
      mapMarketName(m.marketName || m.name) === key ||
      name.includes(lower)
    );
  });

  return found?.marketId ? String(found.marketId) : null;
}
