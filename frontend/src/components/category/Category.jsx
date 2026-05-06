import React, { useRef } from 'react';

import fishing from '../../assets/fishing.png';
import slotGame from '../../assets/slotGame.png';
import casino from '../../assets/casinoGame.png';
import crash from '../../assets/crashGame.png';
import table from '../../assets/tableGame.png';
import arcade from '../../assets/arcadeGame.png';

const categories = [
  { name: "Casino", sprite: casino },
  { name: "Crash", sprite: crash },
  { name: "Slot", sprite: slotGame },
  { name: "Table", sprite: table },
  { name: "Fishing", sprite: fishing },
  { name: "Arcade", sprite: arcade },
];

function Category({ active, setActive }) {
  const prevActive = useRef(null);

  const handleClick = (name) => {
    prevActive.current = active;
    setActive(name);
  };

  return (
    <div className="bg-[#141515] w-full px-4">
      <div className="flex items-center overflow-x-auto no-scrollbar space-x-4 pt-10 pb-5">
        {categories.map((cat) => {
          const isActive = active === cat.name;
          const isPrev = prevActive.current === cat.name;

          return (
            <div
              key={cat.name}
              onClick={() => handleClick(cat.name)}
              className={`
                relative flex flex-col items-center justify-center font-bold
                text-sm cursor-pointer min-w-[85px] pb-2 rounded-md pt-3
                transition-all duration-300
                ${isActive ? 'bg-[#14805e] text-white' : 'text-gray-400 bg-[#222424]'}
              `}
            >
              <div
                className={`
                  absolute -top-5 w-10 h-10 bg-no-repeat
                  ${isActive ? "animate-forward scale-110" : ""}
                  ${isPrev ? "animate-backward" : ""}
                `}
                style={{
                  backgroundImage: `url(${cat.sprite})`,
                  backgroundSize: "auto 100%",
                }}
              />

              <span className="mt-2">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Category;