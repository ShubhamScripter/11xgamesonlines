import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { startCasinoGame, getCasinoWalletAmount } from "../../../services/casinoService";
import Spinner from "../../Spinner";
import PopularGameCard from "./PopularGameCard";
import {
  POPULAR_GAMES_ROW1,
  POPULAR_GAMES_ROW2,
} from "./popularGamesData";

function dedupeByUid(games) {
  const seen = new Set();
  return games.filter((g) => {
    if (seen.has(g.game_uid)) return false;
    seen.add(g.game_uid);
    return true;
  });
}

const ALL_POPULAR_GAMES = dedupeByUid([
  ...POPULAR_GAMES_ROW1,
  ...POPULAR_GAMES_ROW2,
]);

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
      {/* Mobile — 3 games per row */}
      <div className="grid grid-cols-3 gap-2 pb-3 md:hidden">
        {ALL_POPULAR_GAMES.map((game) => (
          <PopularGameCard
            key={`mob-${game.game_uid}-${game.title}`}
            game={game}
            onClick={handleGameClick}
            disabled={loading}
          />
        ))}
      </div>

      {/* Desktop — row 1 + More + row 2 */}
      <div className="hidden md:block">
        <div className="popular-scroll-row flex flex-nowrap gap-2.5 overflow-x-auto no-scrollbar pb-3">
          {POPULAR_GAMES_ROW1.map((game) => (
            <PopularGameCard
              key={`r1-${game.game_uid}-${game.title}`}
              game={game}
              onClick={handleGameClick}
              disabled={loading}
            />
          ))}
        </div>

        {!showMore && (
          <div className="flex justify-center pb-3">
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="rounded-md bg-[#14805e] px-8 py-3 text-base font-bold text-white transition-colors hover:bg-[#126b4f] active:scale-[0.99]"
            >
              More
            </button>
          </div>
        )}

        {showMore && (
          <div className="popular-scroll-row flex flex-nowrap gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {POPULAR_GAMES_ROW2.map((game) => (
              <PopularGameCard
                key={`r2-${game.game_uid}-${game.title}`}
                game={game}
                onClick={handleGameClick}
                disabled={loading}
              />
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Spinner />
        </div>
      )}
    </div>
  );
}

export default PopularGamesGrid;
