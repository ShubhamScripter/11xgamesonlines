import { useEffect, useMemo, useState } from 'react';
import {
  applyProgressiveDisplay,
  countNonLiveMatches,
} from '../utils/sportListProgressive';

const INITIAL_REST = 10;
const REST_STEP = 10;
const TICK_MS = 120;

/**
 * Progressive list render: all in-play immediately, then +10 non-live every tick.
 */
export function useProgressiveSportList(sections, activeTab) {
  const [visibleRest, setVisibleRest] = useState(INITIAL_REST);

  const sectionSignature = useMemo(
    () =>
      (sections || [])
        .map((s) => `${s.title}:${s.matches?.length ?? 0}:${s.isLiveSection ? 1 : 0}`)
        .join('|'),
    [sections]
  );

  useEffect(() => {
    setVisibleRest(INITIAL_REST);
  }, [activeTab, sectionSignature]);

  const totalRest = useMemo(
    () => countNonLiveMatches(sections),
    [sections]
  );

  const visibleSections = useMemo(
    () =>
      applyProgressiveDisplay(sections, {
        visibleRestCount: visibleRest,
      }),
    [sections, visibleRest]
  );

  const shownRest = Math.min(visibleRest, totalRest);
  const hasMore = shownRest < totalRest;

  useEffect(() => {
    if (!hasMore) return undefined;
    const timer = setInterval(() => {
      setVisibleRest((prev) => Math.min(prev + REST_STEP, totalRest));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [hasMore, totalRest]);

  return {
    visibleSections,
    hasMore,
    shownRest,
    totalRest,
  };
}

export default useProgressiveSportList;
