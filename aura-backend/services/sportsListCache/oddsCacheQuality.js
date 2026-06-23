/** True when a transformed list row has usable back/lay prices. */
export function matchHasListOdds(match) {
  const odds = match?.odds;
  if (!Array.isArray(odds) || odds.length === 0) return false;
  return odds.some((o) => {
    const home = Number(o?.home);
    const away = Number(o?.away);
    return (
      (Number.isFinite(home) && home > 1.01) ||
      (Number.isFinite(away) && away > 1.01)
    );
  });
}

/** Matches that should carry odds on listing pages (in-play / today / tomorrow). */
export function isFeaturedListMatch(match) {
  if (match?.inplay === true || match?.iplay === true) return true;
  const d = new Date(match?.date || match?.stime || 0);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const today = now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const ds = d.toDateString();
  return ds === today || ds === tomorrow.toDateString();
}

/**
 * Decide if an odds cache entry is good enough to serve / keep in Redis.
 * Returns { complete, withOdds, featured, featuredWithOdds, total, ratio }.
 */
export function assessOddsCacheQuality(payload, oddsScope = 'eligible') {
  const matches = Array.isArray(payload?.matches) ? payload.matches : [];
  if (matches.length === 0) {
    return {
      complete: true,
      withOdds: 0,
      featured: 0,
      featuredWithOdds: 0,
      total: 0,
      ratio: 0,
    };
  }

  const withOdds = matches.filter(matchHasListOdds).length;
  const featured = matches.filter(isFeaturedListMatch);
  const featuredWithOdds = featured.filter(matchHasListOdds).length;
  const ratio = withOdds / matches.length;

  // No odds at all on a non-empty odds cache → always incomplete
  if (withOdds === 0) {
    return {
      complete: false,
      withOdds,
      featured: featured.length,
      featuredWithOdds,
      total: matches.length,
      ratio,
    };
  }

  // Featured rows (homepage / in-play) must have some odds
  if (featured.length > 0 && featuredWithOdds === 0) {
    return {
      complete: false,
      withOdds,
      featured: featured.length,
      featuredWithOdds,
      total: matches.length,
      ratio,
    };
  }

  if (oddsScope === 'all') {
    const minRatio = 0.03;
    const complete = ratio >= minRatio || withOdds >= 5;
    return {
      complete,
      withOdds,
      featured: featured.length,
      featuredWithOdds,
      total: matches.length,
      ratio,
    };
  }

  // eligible scope — at least some featured or 15%+ overall
  const complete =
    featuredWithOdds >= Math.min(2, featured.length) ||
    ratio >= 0.12 ||
    withOdds >= 3;

  return {
    complete,
    withOdds,
    featured: featured.length,
    featuredWithOdds,
    total: matches.length,
    ratio,
  };
}

export function isOddsPayloadComplete(payload, oddsScope) {
  return assessOddsCacheQuality(payload, oddsScope).complete;
}
