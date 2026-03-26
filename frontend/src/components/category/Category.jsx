import React, { useState } from 'react';
import { MdSportsKabaddi } from "react-icons/md";
import { CgMediaLive } from "react-icons/cg";
import { TbPlayCardStarFilled } from "react-icons/tb";
import { AiFillCalendar } from "react-icons/ai";
import { GiAnglerFish } from "react-icons/gi";
import { IoGameController } from "react-icons/io5";

const categories = [
  { name: "Sports", icon: <MdSportsKabaddi size={24} /> },
  { name: "Live", icon: <CgMediaLive size={24} /> },
  { name: "Table", icon: <TbPlayCardStarFilled size={24} /> },
  { name: "Slot", icon: <AiFillCalendar size={24} /> },
  { name: "Fishing", icon: <GiAnglerFish size={24} /> },
  { name: "Egame", icon: <IoGameController size={24} /> },
];

function Category({active, setActive}) {

  return (
    <div className="bg-[#1b1f23] w-full h-20 flex items-center overflow-x-auto no-scrollbar px-4 space-x-4">
      {categories.map((cat) => (
        <div
          key={cat.name}
          onClick={() => setActive(cat.name)}
          className={`
            flex flex-col items-center justify-center 
            text-sm cursor-pointer px-4 py-2 rounded-xl 
            transition-all duration-200
            ${active === cat.name 
              ? 'bg-gray-700 text-white -translate-y-1' 
              : 'text-gray-400 hover:bg-gray-800'}
          `}
        >
          {cat.icon}
          <span className="mt-1">{cat.name}</span>
        </div>
      ))}
    </div>
  );
}

export default Category;
