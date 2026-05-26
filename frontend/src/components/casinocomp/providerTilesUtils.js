import { casinoData, isSportsCasinoGame } from "./data/CasinoData";
import { getCasinoProviderLabel } from "./casinoProviderBrands";

export const matchesGameType = (game, category) => {
  const type = game.game_type?.toLowerCase() || "";
  if (category === "casino") {
    return type.includes("casino") && !isSportsCasinoGame(game);
  }
  if (category === "slot") return type.includes("slot");
  if (category === "table") return type.includes("table");
  if (category === "fishing") return type.includes("fish");
  if (category === "arcade") return type.includes("arcade");
  if (category === "crash") return type.includes("crash");
  if (category === "sports") return isSportsCasinoGame(game);
  return true;
};

export const pickProviderIcon = (games, providerKey) => {
  const fromList = (games || []).find(
    (g) => g.icon && String(g.icon).trim().startsWith("http")
  );
  if (fromList?.icon) return fromList.icon;

  const allGames = casinoData.providers[providerKey] || [];
  const any = allGames.find(
    (g) => g.icon && String(g.icon).trim().startsWith("http")
  );
  return any?.icon || null;
};

/** Providers that exist on this site for a category (e.g. casino, slot). */
export const getProviderTilesForCategory = (category) => {
  const tiles = Object.entries(casinoData.providers)
    .map(([key, games]) => {
      const categoryGames = (games || []).filter((g) =>
        matchesGameType(g, category)
      );
      if (!categoryGames.length) return null;

      return {
        key,
        label: getCasinoProviderLabel(key),
        icon: pickProviderIcon(categoryGames, key),
        gameCount: categoryGames.length,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.label.localeCompare(b.label));

  return tiles;
};
