/** Display labels for casino lobby provider tiles */
export const CASINO_PROVIDER_LABELS = {
  all: "All",
  evolution: "Evolution",
  ezugi: "Ezugi",
  pragmaticplay: "Pragmatic Play",
  playtech: "Playtech",
  smartsoft: "Smartsoft",
  spribe: "Spribe",
};

/** Fallback tile styling when no logo image is available */
export const CASINO_PROVIDER_STYLES = {
  all: { abbr: "♠", bg: "linear-gradient(145deg, #5c4a1a 0%, #c9a227 100%)" },
  evolution: { abbr: "EV", bg: "linear-gradient(145deg, #1a1a2e 0%, #4a4a6a 100%)" },
  ezugi: { abbr: "EZ", bg: "linear-gradient(145deg, #1e3a5f 0%, #2563eb 100%)" },
  pragmaticplay: { abbr: "PP", bg: "linear-gradient(145deg, #7c2d12 0%, #ea580c 100%)" },
  playtech: { abbr: "PT", bg: "linear-gradient(145deg, #1e3a8a 0%, #3b82f6 100%)" },
  smartsoft: { abbr: "SS", bg: "linear-gradient(145deg, #4a1942 0%, #9333ea 100%)" },
  spribe: { abbr: "SP", bg: "linear-gradient(145deg, #14532d 0%, #22c55e 100%)" },
};

export const getCasinoProviderLabel = (providerKey) =>
  CASINO_PROVIDER_LABELS[providerKey] ||
  providerKey.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

export const getCasinoProviderStyle = (providerKey) =>
  CASINO_PROVIDER_STYLES[providerKey] || {
    abbr: providerKey.slice(0, 2).toUpperCase(),
    bg: "linear-gradient(145deg, #1e2021 0%, #303232 100%)",
  };
