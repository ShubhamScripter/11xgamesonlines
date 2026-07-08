import { fetchCricketData } from '../features/sports/cricketSlice';
import { fetchSoccerData } from '../features/sports/soccerSlice';
import { fetchTennisData } from '../features/sports/tennisSlice';

/**
 * Prefetch sports listings once per sport (withOdds only).
 * Previously fired list + odds separately (= 6 HTTP calls); one withOdds call is enough.
 */
export function prefetchSportsListings(
  dispatch,
  { force = false, withOdds = true, oddsScope = 'eligible' } = {}
) {
  const arg = withOdds
    ? { withOdds: true, oddsScope, ...(force ? { force: true } : {}) }
    : force
      ? { force: true }
      : undefined;

  dispatch(fetchCricketData(arg));
  dispatch(fetchSoccerData(arg));
  dispatch(fetchTennisData(arg));
}

export function isHomePath(pathname) {
  const path = (pathname || '/').replace(/\/$/, '') || '/';
  return path === '/';
}

export function fetchSportWithOdds(dispatch, sport, oddsScope = 'eligible', force = false) {
  const arg = { withOdds: true, oddsScope, ...(force ? { force: true } : {}) };
  if (sport === 'cricket') dispatch(fetchCricketData(arg));
  if (sport === 'soccer') dispatch(fetchSoccerData(arg));
  if (sport === 'tennis') dispatch(fetchTennisData(arg));
}
