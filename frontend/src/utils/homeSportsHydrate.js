import { hydrateCricketList } from '../features/sports/cricketSlice';
import { hydrateSoccerList } from '../features/sports/soccerSlice';
import { hydrateTennisList } from '../features/sports/tennisSlice';
import { readHomeSportsCache, writeHomeSportsCache } from './homeSportsCache';

/** Instant paint on homepage from session cache (stale-while-revalidate). */
export function hydrateHomeSportsFromCache(dispatch) {
  const cached = readHomeSportsCache();
  if (!cached) return false;

  if (cached.cricket?.matches?.length) {
    dispatch(hydrateCricketList(cached.cricket));
  }
  if (cached.soccer?.matches?.length) {
    dispatch(hydrateSoccerList(cached.soccer));
  }
  if (cached.tennis?.matches?.length) {
    dispatch(hydrateTennisList(cached.tennis));
  }

  return Boolean(
    cached.cricket?.matches?.length ||
      cached.soccer?.matches?.length ||
      cached.tennis?.matches?.length
  );
}

export function persistHomeSportsCache({
  cricketMatches,
  cricketHaveOdds,
  cricketOddsScope,
  soccerMatches,
  soccerHaveOdds,
  soccerOddsScope,
  tennisMatches,
  tennisHaveOdds,
  tennisOddsScope,
}) {
  const hasAny =
    cricketMatches?.length || soccerMatches?.length || tennisMatches?.length;
  if (!hasAny) return;

  writeHomeSportsCache({
    cricket: {
      matches: cricketMatches,
      matchesHaveOdds: cricketHaveOdds,
      matchesOddsScope: cricketOddsScope,
    },
    soccer: {
      matches: soccerMatches,
      matchesHaveOdds: soccerHaveOdds,
      matchesOddsScope: soccerOddsScope,
    },
    tennis: {
      matches: tennisMatches,
      matchesHaveOdds: tennisHaveOdds,
      matchesOddsScope: tennisOddsScope,
    },
  });
}
