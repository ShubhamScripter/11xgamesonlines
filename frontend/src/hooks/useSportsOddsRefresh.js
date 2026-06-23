import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchSportWithOdds } from '../utils/prefetchSportsListings';

const POLL_MS = 30_000;

/** Load & refresh matches + odds together (single API call per sport). */
export function useSportsOddsRefresh(
  sports = [],
  oddsScope = 'eligible',
  { skipInitial = false } = {}
) {
  const dispatch = useDispatch();
  const key = `${sports.join(',')}:${oddsScope}:${skipInitial ? 1 : 0}`;

  useEffect(() => {
    if (!sports.length) return undefined;

    const refresh = (force = false) => {
      sports.forEach((sport) => {
        fetchSportWithOdds(dispatch, sport, oddsScope, force);
      });
    };

    if (!skipInitial) refresh();
    const poll = setInterval(() => refresh(true), POLL_MS);
    return () => clearInterval(poll);
  }, [dispatch, key, oddsScope, skipInitial]);
}
