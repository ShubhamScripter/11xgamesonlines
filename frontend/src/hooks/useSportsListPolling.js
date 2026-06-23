import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCricketData } from '../features/sports/cricketSlice';
import { fetchSoccerData } from '../features/sports/soccerSlice';
import { fetchTennisData } from '../features/sports/tennisSlice';

const POLL_MS = 30_000;

/** Refresh match lists (in-play flags). Preserves odds via sportListMerge. */
export function useSportsListPolling(sports = []) {
  const dispatch = useDispatch();
  const key = sports.join(',');

  useEffect(() => {
    if (!sports.length) return undefined;

    const refresh = () => {
      const arg = { force: true };
      if (sports.includes('cricket')) dispatch(fetchCricketData(arg));
      if (sports.includes('soccer')) dispatch(fetchSoccerData(arg));
      if (sports.includes('tennis')) dispatch(fetchTennisData(arg));
    };

    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [dispatch, key]);
}
