import React from "react";

function PopularGameCard({ game, onClick, disabled, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => onClick(game)}
      disabled={disabled}
      className={`flex-shrink-0 w-[108px] text-left disabled:opacity-60 ${className}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#1a1a1a]">
        <span className="absolute right-1.5 top-1.5 z-10 rounded bg-black/50 px-1 text-[9px] font-bold uppercase tracking-wide text-white/90">
          bj
        </span>
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
