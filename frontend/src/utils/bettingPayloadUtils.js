/**
 * Normalize betting API / WebSocket payloads (Provider D markets + Provider C premium fancy).
 * Cricket only for premiumFancy.
 */
export function parseBettingPayload(payload) {
  const root = payload?.data ?? payload;
  const nested = root?.data ?? root;

  let markets = [];
  let premiumFancy = [];
  let providerCGameId = null;

  if (Array.isArray(nested?.markets)) {
    markets = nested.markets;
    premiumFancy = Array.isArray(nested.premiumFancy) ? nested.premiumFancy : [];
    providerCGameId = nested.providerCGameId ?? null;
  } else if (Array.isArray(root?.markets)) {
    markets = root.markets;
    premiumFancy = Array.isArray(root.premiumFancy) ? root.premiumFancy : [];
    providerCGameId = root.providerCGameId ?? null;
  } else if (Array.isArray(nested)) {
    markets = nested;
    premiumFancy = Array.isArray(root?.premiumFancy) ? root.premiumFancy : [];
    providerCGameId = root?.providerCGameId ?? null;
  } else if (Array.isArray(root)) {
    markets = root;
  }

  if (!premiumFancy.length && Array.isArray(payload?.premiumFancy)) {
    premiumFancy = payload.premiumFancy;
  }
  if (!providerCGameId) {
    providerCGameId =
      payload?.providerCGameId ??
      nested?.providerCGameId ??
      root?.providerCGameId ??
      null;
  }

  return { markets, premiumFancy, providerCGameId };
}

/** Map Provider C gtype / mname → app fancy gameType for bet placement */
export function mapPremiumGtypeToGameType(gtype, mname) {
  const g = String(gtype || '').trim().toLowerCase();
  const m = String(mname || '').trim().toLowerCase();
  if (g === 'ball') return 'ball';
  if (g === 'khado') return 'khado';
  if (g === 'line') return 'line';
  if (g === 'meter') return 'meter';
  if (g === 'oddeven' || m === 'oddeven') return 'Normal';
  return 'Normal';
}

export function mapPremiumFancyData(fancyList, gameid, providerCGameId) {
  if (!Array.isArray(fancyList) || fancyList.length === 0) return [];

  const eventId = providerCGameId || gameid;

  return fancyList.flatMap((market) => {
    if (!Array.isArray(market.section) || market.section.length === 0) return [];

    return market.section.map((sec) => ({
      team: sec.nat,
      sid: sec.sid,
      odds: sec.odds,
      max: sec.max ?? market.max ?? null,
      min: sec.min ?? market.min ?? null,
      mname: market.mname,
      gtype: market.gtype,
      gameType: mapPremiumGtypeToGameType(market.gtype, market.mname),
      gstatus: sec.gstatus,
      marketStatus: market.status,
      marketid:
        eventId && sec.sid != null
          ? `${eventId}_${sec.sid}`
          : sec.marketId || sec.market_id || market.mid,
      event_id: eventId,
      isPremium: true,
    }));
  });
}
