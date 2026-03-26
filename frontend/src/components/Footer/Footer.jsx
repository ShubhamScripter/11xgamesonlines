import React from 'react'
import { AiFillHome } from "react-icons/ai";
import { BsEnvelopePaperHeartFill } from "react-icons/bs";
import { MdSportsCricket } from "react-icons/md";
import { TfiCup } from "react-icons/tfi";
import { FaListAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { BsTrophyFill } from "react-icons/bs";
import { GiTrophy } from "react-icons/gi";
function Footer({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const items = [
        { label: "Home", icon: <AiFillHome className='w-6 md:w-8 h-6 md:h-8'/>, path: "/" },
        { label: "Casino", icon: <BsEnvelopePaperHeartFill className='w-6 md:w-8 h-6 md:h-8'/>, path: "/casino" },
        { label: "Sports", icon: <MdSportsCricket className='w-7 md:w-8 h-7 md:h-8'/>, path: "/sports" },
        { label: "Leagues", icon: <GiTrophy className='w-6 md:w-8 h-6 md:h-8'/>, path: "/leagues" },
        { label: "My Bets", icon: <FaListAlt className='w-6 md:w-8 h-6 md:h-8'/>, path: "/mybets" },
    ];

    return (
    //   <div className='sticky z-30 bottom-0 bg-[#EAEBED]'>
       <div className='sticky z-30 bottom-0 bg-[#f0f8ff]'>
        <div className="bg-[#ffffff] h-20 w-full rounded-t-2xl shadow-md flex justify-around items-center">
            {items.map(item => (
                <div
                    key={item.label}
                    onClick={() => {
                        setActiveTab(item.path);
                        navigate(item.path);
                    }}
                    className={`flex flex-col justify-center items-center cursor-pointer
                        ${activeTab === item.path ? 'text-[#19A044]' : 'text-gray-700'}
                    `}
                >
                    {item.icon}
                    <span className='text-[15px] font-semibold'>{item.label}</span>
                </div>
            ))}
        </div>
      </div>
    )
}

export default Footer