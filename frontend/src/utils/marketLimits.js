/** Max stake/limit for display & bet slip: prefer maxb, else max (and common aliases). */
export function getMarketMaxLimit(market) {
  if (!market) return 0;

  const maxb = market.maxb ?? market.maxB ?? market.max_b;
  if (maxb != null && maxb !== "" && !Number.isNaN(Number(maxb))) {
    const n = Number(maxb);
    if (n > 0) return n;
  }

  const fallback =
    market.maxLiabilityPerBet ??
    market.max ??
    market.maxLimit ??
    0;
  const n = Number(fallback);
  return Number.isNaN(n) ? 0 : n;
}

export function getMarketMinLimit(market) {
  if (!market) return 0;
  const min = market.minLiabilityPerBet ?? market.min ?? 0;
  const n = Number(min);
  return Number.isNaN(n) ? 0 : n;
}
