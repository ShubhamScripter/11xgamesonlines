import React from "react";
import { useNavigate } from "react-router-dom";
import { casinoData } from "../data/CasinoData";

function Slot() {
  const navigate = useNavigate();

  const slotProviders = Object.entries(casinoData.providers)
    .filter(([_, games]) =>
      games.some((g) =>
        g.game_type?.toLowerCase().includes("slot")
      )
    )
    .map(([key]) => key);

  const providers = ["all", ...slotProviders];

  return (
    <div className="bg-[#141515] px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pb-4">
        {providers.map((p) => (
          <div
            key={p}
            onClick={() => navigate(`/casino/slot/${p}`)}
            className="flex flex-col items-center justify-center py-3 rounded cursor-pointer bg-[#222424] text-gray-400"
          >
            <span className="text-[13px] uppercase font-semibold">
              {p === "all" ? "All" : p}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Slot;