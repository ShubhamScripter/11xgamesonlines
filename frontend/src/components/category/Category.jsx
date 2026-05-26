import React, { useRef } from "react";
import { GiSoccerBall } from "react-icons/gi";
import { IoRocketOutline } from "react-icons/io5";
import { HiOutlineTicket } from "react-icons/hi";

import popularIcon from "../../assets/casino/popular.svg";
import hoverPopularIcon from "../../assets/casino/hover-popular.svg";
import slotIcon from "../../assets/casino/icon-slot.svg";
import hoverSlotIcon from "../../assets/casino/hover-slot.svg";
import tableIcon from "../../assets/casino/icon-table.svg";
import hoverTableIcon from "../../assets/casino/hover-table.svg";
import fishingIcon from "../../assets/casino/icon-fishing.svg";
import hoverFishingIcon from "../../assets/casino/hover-fishing.svg";
import arcadeIcon from "../../assets/casino/egame.svg";
import hoverArcadeIcon from "../../assets/casino/hover-egame.svg";
import casinoIcon from "../../assets/casino/icon-live.svg";
import hoverCasinoIcon from "../../assets/casino/hover-live.svg";
import crashIcon from "../../assets/casino/icon-table.svg";

const categories = [
  { name: "Popular", icon: popularIcon, activeIcon: hoverPopularIcon },
  { name: "Sports", Icon: GiSoccerBall },
  { name: "Casino", icon: casinoIcon, activeIcon: hoverCasinoIcon },
  { name: "Crash", icon: crashIcon, activeIcon: crashIcon, Icon: IoRocketOutline },
  { name: "Slots", icon: slotIcon, activeIcon: hoverSlotIcon, mapTo: "Slot" },
  { name: "Table", icon: tableIcon, activeIcon: hoverTableIcon },
  { name: "Fishing", icon: fishingIcon, activeIcon: hoverFishingIcon },
  { name: "Arcade", icon: arcadeIcon, activeIcon: hoverArcadeIcon },
  { name: "Lottery", Icon: HiOutlineTicket },
];

function Category({ active, setActive }) {
  const prevActive = useRef(null);

  const handleClick = (cat) => {
    prevActive.current = active;
    setActive(cat.mapTo || cat.name);
  };

  const isCategoryActive = (cat) => {
    const key = cat.mapTo || cat.name;
    return active === key || active === cat.name;
  };

  return (
    <div className="bg-[#141515] w-full px-2">
      <div className="flex items-center overflow-x-auto no-scrollbar gap-2 pt-8 pb-4">
        {categories.map((cat) => {
          const isActive = isCategoryActive(cat);
          const isPrev =
            prevActive.current === (cat.mapTo || cat.name) ||
            prevActive.current === cat.name;

          return (
            <div
              key={cat.name}
              onClick={() => handleClick(cat)}
              className={`
                relative flex flex-col items-center justify-center font-bold
                text-xs cursor-pointer min-w-[72px] px-2 pb-2 rounded-md pt-3
                transition-all duration-300 shrink-0
                ${isActive ? "bg-[#14805e] text-white" : "text-gray-400 bg-[#222424]"}
              `}
            >
              <div
                className={`
                  absolute -top-5 flex h-10 w-10 items-center justify-center
                  ${isActive ? "scale-110" : ""}
                  ${isPrev && !isActive ? "opacity-70" : ""}
                `}
              >
                {cat.icon ? (
                  <img
                    src={isActive && cat.activeIcon ? cat.activeIcon : cat.icon}
                    alt=""
                    className="h-9 w-9 object-contain"
                  />
                ) : cat.Icon ? (
                  <cat.Icon
                    className={`text-2xl ${isActive ? "text-[#f5d77a]" : "text-gray-500"}`}
                  />
                ) : null}
              </div>
              <span className="mt-2 whitespace-nowrap">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Category;
