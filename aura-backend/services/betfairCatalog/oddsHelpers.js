import crypto from 'crypto';

import { extractBetfairArray, unwrapBetfairPayload } from '../matchApi/providerDHelpers.js';

function pickRunnerBackLay(runner = {}) {
  const back =
    runner?.ex?.availableToBack?.[0] ||
    runner?.back?.[0] ||
    (Array.isArray(runner?.availableToBack)
      ? runner.availableToBack[0]
      : null);
  const lay =
    runner?.ex?.availableToLay?.[0] ||
    runner?.lay?.[0] ||
    (Array.isArray(runner?.availableToLay)
      ? runner.availableToLay[0]
      : null);

  return { back, lay };
}

function normalizeRunner(runner = {}) {
  const selectionId = runner.selectionId ?? runner.id ?? runner.sid;
  const { back, lay } = pickRunnerBackLay(runner);

  return {
    selectionId,
    status: runner.status || 'ACTIVE',
    ex: {
      availableToBack: back ? [back] : [],
      availableToLay: lay ? [lay] : [],
    },
    back: back ? [back] : runner.back || [],
    lay: lay ? [lay] : runner.lay || [],
  };
}

/** Normalize GET /betfair/market-odds/{eventId}/{marketId} to listMarketBook-like book. */
export function normalizeMarketOddsToBook(data, marketId) {
  const root = unwrapBetfairPayload(data);
  let payload = root?.data ?? root?.body ?? root;

  if (Array.isArray(payload)) {
    payload = payload[0];
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const nested = payload.data ?? payload.market ?? payload.book;
    if (nested && typeof nested === 'object') {
      payload = Array.isArray(nested) ? nested[0] : nested;
    }
  }

  const list = extractBetfairArray(data);
  const item = list[0] || payload || {};
  const runners = Array.isArray(item.runners)
    ? item.runners
    : Array.isArray(item.runner)
      ? item.runner
      : [];

  return {
    marketId: String(marketId),
    status: item.status || 'OPEN',
    inplay: Boolean(item.inplay ?? item.iplay),
    runners: runners.map(normalizeRunner).filter((r) => r.selectionId != null),
  };
}

export function makeOddsContentHash(book = {}) {
  const payload = JSON.stringify({
    marketId: String(book.marketId || ''),
    status: String(book.status || ''),
    inplay: Boolean(book.inplay),
    runners: (book.runners || []).map((r) => {
      const { back, lay } = pickRunnerBackLay(r);
      return {
        selectionId: String(r.selectionId),
        back: back?.price ?? null,
        lay: lay?.price ?? null,
      };
    }),
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}
