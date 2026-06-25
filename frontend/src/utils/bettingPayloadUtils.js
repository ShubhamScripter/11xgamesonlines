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
  } else if (Array.isArray(nested?.data)) {
    markets = nested.data;
    premiumFancy = Array.isArray(nested.premiumFancy) ? nested.premiumFancy : [];
    providerCGameId = nested.providerCGameId ?? null;
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

/** Provider D fancy tab: normal + fancy1 (+ exchange INNINGS_RUNS). */
export function isProviderDFancyMarket(item) {
  if (!item || typeof item !== 'object') return false;
  const name = String(item.mname || item.name || '').trim().toLowerCase();
  const hasSections =
    Array.isArray(item.section) && item.section.length > 0;
  const hasRunners = Array.isArray(item.runners) && item.runners.length > 0;
  if (name === 'normal' || name === 'fancy1') return hasSections;
  if (item.mtype === 'INNINGS_RUNS') return hasSections || hasRunners;
  return false;
}

function toPosFancyNum(...vals) {
  for (const v of vals) {
    if (v == null || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function isExchangeStyleFancyOdds(lineVal, rateVal) {
  return (
    lineVal != null &&
    rateVal != null &&
    lineVal > 0 &&
    lineVal < 10 &&
    rateVal >= 1000
  );
}

/** fancy1: decode Winkaro 1.96-style back1 odds → line 1 / rate 96. */
function decodeFancy1EncodedOdds(section, market = {}) {
  const mname = String(market.mname || market.name || '').toLowerCase();
  const gtype = String(market.gtype || '').toLowerCase();
  if (mname !== 'fancy1' && gtype !== 'fancy1') return null;

  const raw = Array.isArray(section.odds) ? section.odds : [];
  const pick = (name) =>
    raw.find((o) => String(o.oname || o.name || '').toLowerCase() === name);

  const decodeSide = (entry) => {
    if (!entry) return null;
    const price = Number(entry.odds);
    const vol = Number(entry.size);
    if (!Number.isFinite(price) || price <= 0) return null;

    if (vol > 0 && vol < 1000 && price <= 15) {
      return { line: price, rate: vol };
    }

    if (price > 1 && price < 10 && (!Number.isFinite(vol) || vol >= 1000)) {
      const line = Math.floor(price) || 1;
      const rate = Math.round((price - line) * 100);
      if (rate > 0) return { line, rate };
    }
    return null;
  };

  const back = decodeSide(pick('back1'));
  const lay = decodeSide(pick('lay1'));
  const primary = back || lay;
  if (!primary) return null;

  const noSide = lay || primary;
  const yesSide = back || primary;
  return [
    { oname: 'lay1', otype: 'lay', tno: 0, odds: noSide.line, size: noSide.rate },
    { oname: 'back1', otype: 'back', tno: 0, odds: yesSide.line, size: yesSide.rate },
  ];
}

/** Normalize fancy section → line in odds, rate in size (reference UI). */
export function normalizeFancySectionOdds(section, market = {}) {
  if (!section || typeof section !== 'object') return [];

  const mname = String(market.mname || market.name || '').toLowerCase();
  const gtype = String(market.gtype || '').toLowerCase();
  const isFancy1 = mname === 'fancy1' || gtype === 'fancy1';

  const decodedFancy1 = decodeFancy1EncodedOdds(section, market);
  if (decodedFancy1?.length) return decodedFancy1;

  const b1 = toPosFancyNum(
    section.b1,
    section.b,
    section.back,
    market.b1,
    market.back
  );
  const l1 = toPosFancyNum(
    section.l1,
    section.l,
    section.lay,
    market.l1,
    market.lay
  );
  const line = toPosFancyNum(
    section.bs1,
    section.bs,
    section.ls1,
    section.line,
    section.runs
  );

  if (b1 != null || l1 != null) {
    const lineVal = line ?? (isFancy1 ? 1 : 1);
    const out = [];
    if (l1 != null) {
      out.push({ oname: 'lay1', otype: 'lay', tno: 0, odds: lineVal, size: l1 });
    }
    if (b1 != null) {
      out.push({ oname: 'back1', otype: 'back', tno: 0, odds: lineVal, size: b1 });
    }
    return out;
  }

  const raw = Array.isArray(section.odds) ? section.odds : [];
  const pick = (names, otype) =>
    raw.find((o) => {
      const on = String(o.oname || o.name || '').toLowerCase();
      return names.includes(on) || o.otype === otype;
    });

  const fixSide = (entry, oname, otype) => {
    if (!entry) return null;
    let lineVal = toPosFancyNum(entry.odds, entry.line, entry.runs);
    let rateVal = toPosFancyNum(entry.size, entry.rate, entry.vol, entry.volume);

    if (lineVal != null && rateVal != null) {
      if (isExchangeStyleFancyOdds(lineVal, rateVal)) return null;
      if (rateVal <= 15 && lineVal > 20) {
        [lineVal, rateVal] = [rateVal, lineVal];
      } else if (isFancy1 && lineVal > 20 && rateVal <= 15) {
        [lineVal, rateVal] = [rateVal, lineVal];
      }
    }

    if (lineVal == null && rateVal == null) return null;
    const finalLine =
      isFancy1 && (lineVal == null || lineVal > 15) ? 1 : (lineVal ?? 1);

    return {
      oname,
      otype,
      tno: entry.tno ?? 0,
      odds: finalLine,
      size: rateVal ?? 0,
    };
  };

  const out = [];
  const lay = fixSide(pick(['lay1', 'lay', 'no'], 'lay'), 'lay1', 'lay');
  const back = fixSide(pick(['back1', 'back', 'yes'], 'back'), 'back1', 'back');
  if (lay) out.push(lay);
  if (back) out.push(back);
  if (out.length) return out;

  return raw.filter((o) => {
    const lineVal = toPosFancyNum(o.odds, o.line);
    const rateVal = toPosFancyNum(o.size, o.rate);
    return !isExchangeStyleFancyOdds(lineVal, rateVal);
  });
}

export function pickFancyOdd(odds, type) {
  if (!Array.isArray(odds)) return null;
  const names = type === 'lay' ? ['lay1', 'lay', 'no'] : ['back1', 'back', 'yes'];
  return (
    odds.find(
      (o) =>
        names.includes(String(o.oname || o.name || '').toLowerCase()) ||
        o.otype === type
    ) || null
  );
}

/** Map Provider D fancy mname → app gameType for bet placement */
export function mapProviderDFancyGameType(mname) {
  const m = String(mname || '').trim().toLowerCase();
  if (m === 'fancy1') return 'fancy1';
  return 'Normal';
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
