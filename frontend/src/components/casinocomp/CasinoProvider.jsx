import React, { useState } from "react";
import { Link, useParams ,useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Spinner from "../Spinner";
import { casinoData, isSportsCasinoGame } from "./data/CasinoData";
import SportsBookCardArt from "../sports/SportsBookCardArt";
import { launchCasinoGameForUser } from "../../services/casinoService";
import { motion } from "framer-motion";
import { IoIosArrowDown } from "react-icons/io";

import slot from '../../assets/icon/icon-slot.png'
import slotColor from '../../assets/icon/icon-slotColor.png'
import fish from '../../assets/icon/icon-fish.png'
import fishColor from '../../assets/icon/icon-fishColor.png'
import crash from '../../assets/icon/icon-crash.png'
import crashColor from '../../assets/icon/icon-crashColor.png'
import arcade from '../../assets/icon/icon-arcade.png'
import arcadeColor from '../../assets/icon/icon-arcadeColor.png'
import casino from '../../assets/icon/icon-casino.png'
import casinoColor from '../../assets/icon/icon-casinoColor.png'
import table from '../../assets/icon/icon-table.png'
import tableColor from '../../assets/icon/icon-tableColor.png'

function CasinoProvider() {
  const { category, provider } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [gameOption, setGameOption] = useState(false);
  const navigate = useNavigate();
  const games =
    provider === "all"
      ? Object.values(casinoData.providers).flat()
      : casinoData.providers?.[provider];

  const categoryDisplay = {
    slot: "Slots",
    casino: "Casino",
    table: "Table",
    fishing: "Fishing",
    arcade: "Arcade",
    crash: "Crash",
    sports: "Sports",
  };

const categoryIcons = {
  slot: slot,
  casino: casino,
  table: table,
  fishing: fish,
  arcade: arcade,
  crash: crash,
};

const categoryIconsColor = {
  slot: slotColor,
  casino: casinoColor,
  table: tableColor,
  fishing: fishColor,
  arcade: arcadeColor,
  crash: crashColor,
};

  const categoryLabel = categoryDisplay[category] || "Slots";
  const categoryOptions = Object.entries(categoryDisplay);

  if (!games) {
    return <div className="text-white">Invalid provider</div>;
  }

    const filteredGames = games.filter((game) => {
        const type = game.game_type?.toLowerCase();
        if (category === "slot") return type?.includes("slot");
        if (category === "casino") return type?.includes("casino");
        if (category === "table") return type?.includes("table");
        if (category === "fishing") return type?.includes("fish");
        if (category === "arcade") return type?.includes("arcade");
        if (category === "crash") return type?.includes("crash");
        if (category === "sports") return isSportsCasinoGame(game);
        return true;
    });

  const handleGameClick = async (game) => {
    if (!user) {
      toast.error("Please login");
      return;
    }

    setLoading(true);
    try {
      const res = await launchCasinoGameForUser(user, game.game_uid);
      toast.success(`${game.game_name} launching…`);
      window.location.assign(res.gameUrl);
    } catch (err) {
      toast.error(err.message || "Game launch failed");
    } finally {
      setLoading(false);
    }
  };

  if (!filteredGames.length) {
    return (
      <div className="text-white text-center mt-10">
        No games found
      </div>
    );
  }

  return (
    <div className="md:mt-15">
      <div className='relative'>
        <div className='flex items-center px-4 text-white text-[24px] md:text-[20px] font-bold h-[52px] leading-none gap-1.5 md:mb-3' onClick={() => setGameOption((prev) => !prev)}>
          <img 
              src={categoryIcons[category] || slot} 
              className='h-full block py-4' 
            /> <span className="leading-none">{categoryLabel}</span>
          <span className={`transform transition-transform duration-300  ${gameOption ? 'rotate-[180deg]' : ''}`}><IoIosArrowDown size={25} /></span>
        </div>
        {gameOption && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute top-[52px] left-0 text-white bg-[#141515] z-10 w-[150px]'
          >
            {categoryOptions.map(([key, label]) => (
              <div
                key={key}
                onClick={() => {
                  setGameOption(false);
                  navigate(`/casino/${key}/all`);
                }}
                className={`px-4 h-[52px] flex items-center cursor-pointer gap-2 
                  ${category === key ? 'bg-[#303232]' : 'hover:bg-[#2a2c2c]'}`}
              >
                <img 
                  src={categoryIconsColor[key]} 
                  alt="" 
                  className="h-5"
                /> {label}
              </div>
            ))}
          </motion.div>
        )}
      </div>
      <div className="p-4 grid grid-cols-3 md:grid-cols-8 gap-2">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <Spinner />
          </div>
        )}

        {filteredGames.map((game, index) => (
          <div
            key={`${provider}-${game.id}-${index}`}
            onClick={() => handleGameClick(game)}
            className="cursor-pointer"
          >
            {category === "sports" || isSportsCasinoGame(game) ? (
              <div className="rounded overflow-hidden bg-[#222424]">
                <SportsBookCardArt providerKey={game.provider_key} />
                <p className="px-2 py-2 text-[11px] font-semibold text-white truncate">
                  {game.game_name}
                </p>
              </div>
            ) : (
              <img
                src={game.icon}
                alt={game.game_name}
                className="rounded w-full h-[180px] object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CasinoProvider;