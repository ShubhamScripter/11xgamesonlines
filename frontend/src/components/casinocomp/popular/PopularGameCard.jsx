import React from "react";

function PopularGameCard({ game, onClick, disabled, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => onClick(game)}
      disabled={disabled}
      className={`w-full min-w-0 text-left disabled:opacity-60 md:w-[108px] md:flex-shrink-0 ${className}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#1a1a1a]">
        <img
          src={game.icon}
          alt={game.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <p className="mt-1.5 truncate text-[11px] font-semibold leading-tight text-white">
        {game.title}
      </p>
      <p className="truncate text-[9px] font-medium uppercase tracking-wide text-[#8a8a8a]">
        {game.provider}
      </p>
    </button>
  );
}

export default PopularGameCard;
