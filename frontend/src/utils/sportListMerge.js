import { hasRealOddsInList, matchHasRealOdds } from './sportOddsUtils';

/** Merge incoming list/odds response into Redux sport state. */
export function applySportListPayload(state, payload, listKey) {
  const incoming = payload?.matches ?? (Array.isArray(payload) ? payload : []);
  if (!Array.isArray(incoming) || incoming.length === 0) return;

  const incomingHasOdds = payload?.matchesHaveOdds === true;
  const current = state[listKey] || [];

  if (incomingHasOdds) {
    const byId = new Map(incoming.map((m) => [String(m.id), m]));
    if (current.length > 0) {
      state[listKey] = current.map((m) => {
        const upd = byId.get(String(m.id));
        if (!upd) return m;
        return {
          ...m,
          ...upd,
          inplay: upd.inplay ?? m.inplay,
          iplay: upd.iplay ?? m.iplay,
        };
      });
      const haveIds = new Set(state[listKey].map((m) => String(m.id)));
      incoming.forEach((m) => {
        if (!haveIds.has(String(m.id))) state[listKey].push(m);
      });
    } else {
      state[listKey] = incoming;
    }
    state.matchesHaveOdds = hasRealOddsInList(state[listKey]);
    state.matchesOddsScope = payload?.matchesOddsScope ?? null;
    return;
  }

  // List-only — never wipe existing odds prices.
  if (current.length === 0) {
    state[listKey] = incoming;
    return;
  }

  const prevById = new Map(current.map((m) => [String(m.id), m]));

  if (incoming.length >= current.length) {
    state[listKey] = incoming.map((m) => {
      const prev = prevById.get(String(m.id));
      if (!prev) return m;
      const merged = { ...m };
      if (matchHasRealOdds(prev) && !matchHasRealOdds(m)) {
        merged.odds = prev.odds;
      }
      merged.inplay = m.inplay ?? prev.inplay;
      merged.iplay = m.iplay ?? prev.iplay;
      return merged;
    });
    return;
  }

  const inById = new Map(incoming.map((m) => [String(m.id), m]));
  state[listKey] = current.map((m) => {
    const upd = inById.get(String(m.id));
    if (!upd) return m;
    return {
      ...m,
      inplay: upd.inplay ?? m.inplay,
      iplay: upd.iplay ?? m.iplay,
      date: upd.date ?? m.date,
    };
  });
}

export function packSportFetchResult(matches, oddsScope) {
  const oddsReady = hasRealOddsInList(matches);
  return {
    matches,
    matchesHaveOdds: oddsReady,
    matchesOddsScope: oddsReady ? oddsScope : null,
  };
}
