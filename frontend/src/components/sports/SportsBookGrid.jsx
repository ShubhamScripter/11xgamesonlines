import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Spinner from "../Spinner";
import { launchCasinoGameForUser } from "../../services/casinoService";
import { sportsCasinoGames } from "../casinocomp/data/CasinoData";
import {
  getSportsBrandImage,
  getSportsBrandStyle,
  getSportsDisplayName,
} from "./sportsBookBrands";
import "./Sports.css";

function SportsBookTile({ game, disabled, onLaunch }) {
  const image = getSportsBrandImage(game.provider_key);
  const brand = getSportsBrandStyle(game.provider_key);
  const label = getSportsDisplayName(game.provider_key, game.game_name);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onLaunch(game)}
      className="sportsbook-tile"
    >
      <span className="sportsbook-tile-icon">
        {image ? (
          <img src={image} alt="" />
        ) : (
          <span
            className="sportsbook-tile-icon-fallback"
            style={{ background: brand.bg }}
          >
            {brand.abbr}
          </span>
        )}
      </span>
      <span className="sportsbook-tile-label">{label}</span>
    </button>
  );
}

function SportsBookGrid({ className = "" }) {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleGameClick = async (game) => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }

    setLoading(true);
    try {
      const res = await launchCasinoGameForUser(user, game.game_uid);
      toast.success(`${game.game_name} launching…`);
      window.location.assign(res.gameUrl);
    } catch (error) {
      toast.error(error.message || "Game launch failed");
    } finally {
      setLoading(false);
    }
  };

  if (!sportsCasinoGames.length) return null;

  return (
    <div className={className}>
      <div className="sportsbook-tiles-grid">
        {sportsCasinoGames.map((game) => (
          <SportsBookTile
            key={game.game_uid}
            game={game}
            disabled={loading}
            onLaunch={handleGameClick}
          />
        ))}
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Spinner />
        </div>
      )}
    </div>
  );
}

export default SportsBookGrid;
