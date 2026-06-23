/** True when at least one match has a non-zero back price in odds[]. */
export function hasRealOddsInList(matches = []) {
  return (matches || []).some((m) =>
    (m.odds || []).some((o) => {
      const home = String(o?.home ?? '').trim();
      return home && home !== '0' && home !== '-';
    })
  );
}

export function matchHasRealOdds(match) {
  return (match?.odds || []).some((o) => {
    const home = String(o?.home ?? '').trim();
    const away = String(o?.away ?? '').trim();
    return (
      (home && home !== '0' && home !== '-') ||
      (away && away !== '0' && away !== '-')
    );
  });
}

/** Sport fetch finished or already has rows to show. */
export function isSportListSettled(matches = [], loading = false) {
  if (Array.isArray(matches) && matches.length > 0) return true;
  return !loading;
}

/** Homepage: show widget once any sport has list data (odds may still load). */
export function isHomeSportsListReady({
  cricketMatches = [],
  cricketLoading = false,
  soccerMatches = [],
  soccerLoading = false,
  tennisMatches = [],
  tennisLoading = false,
} = {}) {
  return (
    isSportListSettled(cricketMatches, cricketLoading) ||
    isSportListSettled(soccerMatches, soccerLoading) ||
    isSportListSettled(tennisMatches, tennisLoading)
  );
}

export function isActiveHomeSportSettled(activeSport, states) {
  const key =
    activeSport === 'FOOTBALL'
      ? 'soccer'
      : activeSport === 'TENNIS'
        ? 'tennis'
        : 'cricket';
  const s = states[key];
  if (!s) return false;
  return isSportListSettled(s.matches, s.loading);
}

/** Homepage: all three sports fetched with odds before showing cards. */
export function isHomeSportsOddsReady({
  cricketMatches = [],
  cricketHaveOdds = false,
  cricketLoading = false,
  soccerMatches = [],
  soccerHaveOdds = false,
  soccerLoading = false,
  tennisMatches = [],
  tennisHaveOdds = false,
  tennisLoading = false,
} = {}) {
  const sportReady = (matches, haveOdds, loading) => {
    if (haveOdds || hasRealOddsInList(matches)) return true;
    if (!loading && matches.length === 0) return true;
    return false;
  };

  return (
    sportReady(cricketMatches, cricketHaveOdds, cricketLoading) &&
    sportReady(soccerMatches, soccerHaveOdds, soccerLoading) &&
    sportReady(tennisMatches, tennisHaveOdds, tennisLoading)
  );
}
