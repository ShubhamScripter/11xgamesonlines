import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchSportWithOdds } from '../utils/prefetchSportsListings';

const POLL_MS = 60_000;

/**
 * Soft refresh of list odds. Prefer socket for live updates;
 * only force-bypass cache every few ticks to avoid REST storms.
 */
export function useSportsOddsRefresh(
  sports = [],
  oddsScope = 'eligible',
  { skipInitial = false } = {}
) {
  const dispatch = useDispatch();
  const tickRef = useRef(0);
  const key = `${sports.join(',')}:${oddsScope}:${skipInitial ? 1 : 0}`;

  useEffect(() => {
    if (!sports.length) return undefined;
    tickRef.current = 0;

    const refresh = (force = false) => {
      if (typeof document !== 'undefined' && document.hidden) return;
      sports.forEach((sport) => {
        fetchSportWithOdds(dispatch, sport, oddsScope, force);
      });
    };

    if (!skipInitial) refresh(false);

    const poll = setInterval(() => {
      tickRef.current += 1;
      // Force every tick so locked/disabled matches leave the listing promptly
      refresh(true);
    }, POLL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh(false);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [dispatch, key, oddsScope, skipInitial]);
}
