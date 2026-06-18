/** Max stake/limit for display & bet slip: prefer max, else maxb (and common aliases). */
export function getMarketMaxLimit(market) {
  if (!market) return 0;

  const primary =
    market.maxLiabilityPerBet ??
    market.max ??
    market.maxLimit;
  if (primary != null && primary !== "" && !Number.isNaN(Number(primary))) {
    const n = Number(primary);
    if (n > 0) return n;
  }

  const maxb = market.maxb ?? market.maxB ?? market.max_b;
  if (maxb != null && maxb !== "" && !Number.isNaN(Number(maxb))) {
    const n = Number(maxb);
    if (n > 0) return n;
  }

  return 0;
}

export function getMarketMinLimit(market) {
  if (!market) return 0;
  const min = market.minLiabilityPerBet ?? market.min ?? 0;
  const n = Number(min);
  return Number.isNaN(n) ? 0 : n;
}
