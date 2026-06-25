import { isMatchInPlay } from './sportMatchFilters';

/** Apply WebSocket list_odds_update payloads onto Redux match rows. */
export function patchMatchesWithOddsUpdates(matches, updates, sport) {
  if (!Array.isArray(matches) || !matches.length) return matches;
  if (!Array.isArray(updates) || !updates.length) return matches;

  const byId = new Map(updates.map((u) => [String(u.id), u]));
  let changed = false;

  const next = matches.map((m) => {
    const id = String(m.id ?? m.gmid ?? m.eventId ?? m.gameId);
    const upd = byId.get(id);
    if (!upd) return m;
    changed = true;

    const merged = {
      ...m,
      odds: upd.odds ?? m.odds,
      status: upd.status ?? m.status,
    };

    if (upd.inplay === true || upd.iplay === true) {
      merged.inplay = true;
      merged.iplay = true;
    }

    if (sport && isMatchInPlay(merged, sport)) {
      merged.inplay = true;
      merged.iplay = true;
    }

    return merged;
  });

  return changed ? next : matches;
}
