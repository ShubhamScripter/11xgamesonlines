import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { startCasinoGame, getCasinoWalletAmount } from "../../../services/casinoService";
import Spinner from "../../Spinner";
import PopularGameCard from "./PopularGameCard";
import {
  POPULAR_GAMES_ROW1,
  POPULAR_GAMES_ROW2,
  POPULAR_GAMES_MORE,
} from "./popularGamesData";

function PopularGamesGrid() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleGameClick = async (game) => {
    if (!user) {
      toast.error("Please login to play casino games");
      return;
    }

    setLoading(true);
    try {
      const response = await startCasinoGame(user.userName,
        game.game_uid, getCasinoWalletAmount(user));
      if (response.success) {
        toast.success(`${game.title} launching...`);
        window.location.href = response.gameUrl;
      } else {
        toast.error(response.message || `Failed to launch ${game.title}`);
      }
    } catch (error) {
      toast.error(
        error.message ||
          error.response?.data?.message ||
          `Failed to launch ${game.title}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#141515] px-3 pt-2 pb-5">
      {/* Row 1 */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-3">
        {POPULAR_GAMES_ROW1.map((game) => (
          <PopularGameCard
            key={`r1-${game.game_uid}-${game.title}`}
            game={game}
            onClick={handleGameClick}
            disabled={loading}
          />
        ))}
      </div>

      {/* Row 2 — 3 games + More (center-right) */}
      <div className="flex items-center gap-2.5 pb-3">
        <div className="flex gap-2.5">
          {POPULAR_GAMES_ROW2.map((game) => (
            <PopularGameCard
              key={`r2-${game.game_uid}-${game.title}`}
              game={game}
              onClick={handleGameClick}
              disabled={loading}
            />
          ))}
        </div>

        {!showMore && (
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="ml-auto shrink-0 self-center rounded-md bg-[#14805e] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#126b4f] active:scale-[0.99]"
          >
            More
          </button>
        )}
      </div>

      {/* Expanded listing — button hidden after click */}
      {showMore && (
        <div className="flex flex-wrap gap-2.5 pb-1">
          {POPULAR_GAMES_MORE.map((game) => (
            <PopularGameCard
              key={`more-${game.game_uid}-${game.title}`}
              game={game}
              onClick={handleGameClick}
              disabled={loading}
            />
          ))}
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Spinner />
        </div>
      )}
    </div>
  );
}

export default PopularGamesGrid;
