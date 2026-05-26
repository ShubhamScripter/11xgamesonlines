import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import hoverLiveIcon from "../../assets/casino/hover-live.svg";
import {
  getCasinoProviderLabel,
  getCasinoProviderStyle,
} from "./casinoProviderBrands";
import { getProviderTilesForCategory } from "./providerTilesUtils";
import "./ProviderTiles.css";

function ProviderTile({ tile, onClick }) {
  const brand = getCasinoProviderStyle(tile.key);
  const isAll = tile.key === "all";

  return (
    <button type="button" onClick={onClick} className="provider-tile">
      <span className="provider-tile-icon">
        {isAll ? (
          <img src={hoverLiveIcon} alt="" />
        ) : tile.icon ? (
          <img src={tile.icon} alt="" loading="lazy" />
        ) : (
          <span
            className="provider-tile-icon-fallback"
            style={{ background: brand.bg }}
          >
            {brand.abbr}
          </span>
        )}
      </span>
      <span className="provider-tile-label">{tile.label}</span>
    </button>
  );
}

function ProviderTilesGrid({ category, className = "" }) {
  const navigate = useNavigate();

  const tiles = useMemo(() => {
    const providers = getProviderTilesForCategory(category);
    return [
      { key: "all", label: getCasinoProviderLabel("all"), icon: null },
      ...providers,
    ];
  }, [category]);

  if (tiles.length <= 1) return null;

  return (
    <div className={className}>
      <div className="provider-tiles-grid">
        {tiles.map((tile) => (
          <ProviderTile
            key={tile.key}
            tile={tile}
            onClick={() => navigate(`/casino/${category}/${tile.key}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default ProviderTilesGrid;
