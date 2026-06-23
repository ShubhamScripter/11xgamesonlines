import {
  fetchProviderCPremiumFancy,
  isPremiumFancyEnabled,
} from './providerCHybrid.js';

export function unwrapMatchMarkets(payload) {
  if (!payload) return [];
  const data = payload.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.markets)) return data.markets;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function unwrapPremiumFancy(payload) {
  if (!payload) return [];
  const data = payload.data ?? payload;
  if (Array.isArray(data?.premiumFancy)) return data.premiumFancy;
  if (Array.isArray(payload?.premiumFancy)) return payload.premiumFancy;
  return [];
}

export function unwrapProviderCGameId(payload) {
  const data = payload?.data ?? payload;
  return data?.providerCGameId ?? payload?.providerCGameId ?? null;
}

export async function enrichMatchDataWithPremium(
  primaryResult,
  gameId,
  sportId,
  activeProviderName,
  premiumResult = null
) {
  if (!primaryResult?.success) return primaryResult;

  const markets = unwrapMatchMarkets(primaryResult);
  const isCricket = Number(sportId) === 4;

  if (!isCricket || !isPremiumFancyEnabled(activeProviderName)) {
    return {
      ...primaryResult,
      data: markets,
      premiumFancy: [],
      providerCGameId: null,
    };
  }

  const premium =
    premiumResult ??
    (await fetchProviderCPremiumFancy(gameId, sportId));

  return {
    ...primaryResult,
    data: {
      markets,
      premiumFancy: premium.premiumFancy ?? [],
      providerCGameId: premium.providerCGameId ?? String(gameId),
    },
    premiumFancy: premium.premiumFancy ?? [],
    providerCGameId: premium.providerCGameId ?? String(gameId),
  };
}

/** Provider D + Provider C in parallel (cricket WS / combined fetch). */
export async function fetchCricketBettingPayload(
  activeProvider,
  gameId,
  activeProviderName
) {
  const isCricketPremium = isPremiumFancyEnabled(activeProviderName);

  const [primary, premiumResult] = await Promise.all([
    activeProvider.fetchMatchData(gameId, 4),
    isCricketPremium
      ? fetchProviderCPremiumFancy(gameId, 4)
      : Promise.resolve({ providerCGameId: null, premiumFancy: [] }),
  ]);

  return enrichMatchDataWithPremium(
    primary,
    gameId,
    4,
    activeProviderName,
    premiumResult
  );
}
