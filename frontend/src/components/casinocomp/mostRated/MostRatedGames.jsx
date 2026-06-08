import React, { useRef, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { startCasinoGame, getCasinoWalletAmount } from "../../../services/casinoService";
import Spinner from "../../Spinner";
import { MOST_RATED_GAMES } from "./mostRatedGamesData";
import "../exclusive/ExclusiveGames.css";

const SCROLL_STEP = 280;

function MostRatedGames() {
  const scrollRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [updateScrollButtons]);

  const scrollBy = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" });
    setTimeout(updateScrollButtons, 350);
  };

  const handleGameClick = async (game) => {
    if (!user) {
      toast.error("Please login to play casino games");
      return;
    }

    setLoading(true);
    try {
      const response = await startCasinoGame(
        user.userName,
        game.game_uid,
        getCasinoWalletAmount(user)
      );
      if (response.success) {
        toast.success(`${game.title} launching...`);
        window.location.href = response.gameUrl;
      } else {
        toast.error(response.message || `Failed to launch ${game.title}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Failed to launch ${game.title}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!MOST_RATED_GAMES.length) return null;

  return (
    <section className="exclusive-section">
      <div className="exclusive-header">
        <div className="exclusive-title-wrap">
          <span className="exclusive-title-bar" aria-hidden />
          <h2 className="exclusive-title">Most Rated Games</h2>
        </div>
        <div className="exclusive-nav">
          <button
            type="button"
            className="exclusive-nav-btn"
            aria-label="Scroll left"
            disabled={!canScrollLeft}
            onClick={() => scrollBy(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="exclusive-nav-btn"
            aria-label="Scroll right"
            disabled={!canScrollRight}
            onClick={() => scrollBy(1)}
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="exclusive-scroll"
        onScroll={updateScrollButtons}
      >
        {MOST_RATED_GAMES.map((game) => (
          <button
            key={`${game.game_uid}-${game.title}`}
            type="button"
            className="exclusive-card"
            disabled={loading}
            onClick={() => handleGameClick(game)}
          >
            <div className="exclusive-card-image-wrap">
              <span className="exclusive-card-badge exclusive-card-badge--rated">
                ★
              </span>
              <img
                src={game.icon}
                alt={game.title}
                className="exclusive-card-image"
                loading="lazy"
              />
            </div>
            <p className="exclusive-card-title">{game.title}</p>
            <span className="exclusive-card-provider">{game.provider}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Spinner />
        </div>
      )}
    </section>
  );
}

export default MostRatedGames;
