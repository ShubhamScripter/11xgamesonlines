import { hasRealOddsInList, matchHasRealOdds } from './sportOddsUtils';

/**
 * Merge incoming list/odds response into Redux sport state.
 *
 * Incoming list is the source of truth for which matches exist.
 * Locked/disabled matches removed by the API must disappear from Redux —
 * do not keep stale rows that are missing from the response.
 * Odds prices from the previous state are preserved when the new row lacks them.
 */
export function applySportListPayload(state, payload, listKey) {
  const incoming = payload?.matches ?? (Array.isArray(payload) ? payload : []);
  if (!Array.isArray(incoming) || incoming.length === 0) return;

  const incomingHasOdds = payload?.matchesHaveOdds === true;
  const current = state[listKey] || [];
  const prevById = new Map(current.map((m) => [String(m.id), m]));

  state[listKey] = incoming.map((m) => {
    const prev = prevById.get(String(m.id));
    if (!prev) return m;

    const merged = incomingHasOdds
      ? {
          ...prev,
          ...m,
          inplay: m.inplay ?? prev.inplay,
          iplay: m.iplay ?? prev.iplay,
        }
      : {
          ...m,
          inplay: m.inplay ?? prev.inplay,
          iplay: m.iplay ?? prev.iplay,
          date: m.date ?? prev.date,
        };

    if (matchHasRealOdds(prev) && !matchHasRealOdds(merged)) {
      merged.odds = prev.odds;
      if (prev.section && !merged.section) merged.section = prev.section;
    }

    return merged;
  });

  if (incomingHasOdds) {
    state.matchesHaveOdds = hasRealOddsInList(state[listKey]);
    state.matchesOddsScope = payload?.matchesOddsScope ?? null;
  }
}

export function packSportFetchResult(matches, oddsScope) {
  const oddsReady = hasRealOddsInList(matches);
  return {
    matches,
    matchesHaveOdds: oddsReady,
    matchesOddsScope: oddsReady ? oddsScope : null,
  };
}
