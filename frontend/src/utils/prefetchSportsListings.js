import { fetchCricketData } from '../features/sports/cricketSlice';
import { fetchSoccerData } from '../features/sports/soccerSlice';
import { fetchTennisData } from '../features/sports/tennisSlice';

/** Fetch sports — list first for fast paint, then odds in parallel. */
export function prefetchSportsListings(
  dispatch,
  { force = false, withOdds = true, oddsScope = 'eligible' } = {}
) {
  const listArg = force ? { force: true } : undefined;
  const oddsArg = withOdds
    ? { ...(force ? { force: true } : {}), withOdds: true, oddsScope }
    : listArg;

  if (withOdds) {
    dispatch(fetchCricketData(listArg));
    dispatch(fetchSoccerData(listArg));
    dispatch(fetchTennisData(listArg));
  }

  dispatch(fetchCricketData(oddsArg));
  dispatch(fetchSoccerData(oddsArg));
  dispatch(fetchTennisData(oddsArg));
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
