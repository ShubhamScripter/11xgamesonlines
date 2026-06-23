/** Infer inplay when provider flag missing but market is open and match started. */
export function inferListMatchInplay(match, sportKey) {
  if (match?.inplay === true || match?.iplay === true) {
    return { ...match, inplay: true, iplay: true };
  }

  const startMs = new Date(match?.stime || match?.date || 0).getTime();
  if (!Number.isFinite(startMs) || startMs > Date.now()) return match;

  const elapsed = Date.now() - startMs;
  const maxMs =
    sportKey === 'cricket'
      ? 10 * 3600 * 1000
      : sportKey === 'soccer'
        ? 3 * 3600 * 1000
        : 5 * 3600 * 1000;
  if (elapsed > maxMs) return match;

  const status = String(match?.status ?? '').toUpperCase();
  if (status === 'CLOSED' || status === 'COMPLETE' || status === 'SUSPENDED') {
    return match;
  }

  if (
    status === 'OPEN' ||
    status === 'ACTIVE' ||
    status === 'IN_PLAY' ||
    hasSectionOddsActive(match) ||
    hasListOddsActive(match, sportKey)
  ) {
    return {
      ...match,
      inplay: true,
      iplay: true,
      status: match.status || 'OPEN',
    };
  }

  return match;
}

function hasSectionOddsActive(match) {
  const sections = match?.section;
  if (!Array.isArray(sections)) return false;
  return sections.some((s) => {
    const o = s?.odds?.[0]?.odds;
    return o != null && Number(o) > 1.01;
  });
}

/** Transformed API rows use odds[] instead of section[]. */
function hasListOddsActive(match, sportKey) {
  const odds = match?.odds;
  if (!Array.isArray(odds) || odds.length === 0) return false;

  const started = new Date(match?.date || match?.stime || 0).getTime();
  if (!Number.isFinite(started) || started > Date.now()) return false;

  return odds.some((o) => {
    const st = String(o?.gstatus ?? o?.status ?? '').toUpperCase();
    if (st === 'CLOSED' || st === 'COMPLETE') return false;
    const h = Number(o?.home);
    const a = Number(o?.away);
    if (!(h > 1.01 || a > 1.01)) return false;
    // Tennis: ACTIVE prices after scheduled start = live
    if (sportKey === 'tennis' && (st === 'ACTIVE' || st === 'OPEN')) return true;
    return st === 'ACTIVE' || st === 'OPEN';
  });
}

export function applyInplayInferenceToPayload(payload, sportKey) {
  if (!payload?.matches?.length) return payload;
  return {
    ...payload,
    matches: payload.matches.map((m) => inferListMatchInplay(m, sportKey)),
    ...(payload.data
      ? { data: payload.data.map((m) => inferListMatchInplay(m, sportKey)) }
      : {}),
  };
}
