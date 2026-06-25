import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { patchCricketListOdds } from '../features/sports/cricketSlice';
import { patchSoccerListOdds } from '../features/sports/soccerSlice';
import { patchTennisListOdds } from '../features/sports/tennisSlice';
import { wsClient } from '../utils/wsClient';

const SPORT_DISPATCH = {
  cricket: patchCricketListOdds,
  soccer: patchSoccerListOdds,
  tennis: patchTennisListOdds,
};

/** Live match-list odds via WebSocket (backend syncs market-odds every ~1s). */
export function useListOddsSocket(sports = []) {
  const dispatch = useDispatch();
  const sportsKey = sports.join(',');

  useEffect(() => {
    if (!sports.length) return undefined;

    wsClient.send({ type: 'subscribe_list_odds', sports });

    const unsubscribe = wsClient.subscribe((message) => {
      if (message?.type !== 'list_odds_update') return;
      const sport = String(message.sport || '').toLowerCase();
      if (!sports.includes(sport)) return;

      const updates = message.updates;
      if (!Array.isArray(updates) || !updates.length) return;

      const action = SPORT_DISPATCH[sport];
      if (action) dispatch(action(updates));
    });

    return unsubscribe;
  }, [dispatch, sportsKey]);
}
