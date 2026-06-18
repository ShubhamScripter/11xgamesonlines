import { fetchCricketData } from '../features/sports/cricketSlice';
import { fetchSoccerData } from '../features/sports/soccerSlice';
import { fetchTennisData } from '../features/sports/tennisSlice';

/** Fire cricket / soccer / tennis list APIs in parallel (deduped in each slice). */
export function prefetchSportsListings(dispatch) {
  dispatch(fetchCricketData());
  dispatch(fetchSoccerData());
  dispatch(fetchTennisData());
}

export function isHomePath(pathname) {
  const path = (pathname || '/').replace(/\/$/, '') || '/';
  return path === '/';
}
