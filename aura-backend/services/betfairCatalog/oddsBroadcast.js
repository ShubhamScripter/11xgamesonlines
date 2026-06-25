import { clients } from '../../socket/bettingSocket.js';

export function broadcastListOddsUpdate(sport, updates = []) {
  if (!updates.length) return;

  const sportKey = String(sport).toLowerCase();
  const payload = JSON.stringify({
    type: 'list_odds_update',
    sport: sportKey,
    updates,
  });

  let sent = 0;
  for (const client of clients) {
    if (!client?.ws || client.ws.readyState !== 1) continue;
    if (!client.listOddsSports?.has(sportKey)) continue;
    try {
      client.ws.send(payload);
      sent += 1;
    } catch {
      // ignore send errors
    }
  }

  if (sent > 0 && process.env.BETFAIR_ODDS_WS_LOG === 'true') {
    console.log(
      `[BetfairCatalog] list odds WS → ${sportKey}: ${updates.length} updates, ${sent} clients`
    );
  }
}
