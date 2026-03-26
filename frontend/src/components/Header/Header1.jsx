import React from 'react'
import { PiGlobeStandFill } from "react-icons/pi";
import { BiSolidCricketBall } from "react-icons/bi";
import { IoIosFootball } from "react-icons/io";
import { GiSoccerBall } from "react-icons/gi";
import { BiSolidTennisBall } from "react-icons/bi";

const categories =[
    {name: "All", icon: <PiGlobeStandFill className='text-lg md:text-2xl text-white'/>},
    {name: "Cricket", icon: <BiSolidCricketBall className='text-lg md:text-2xl text-white'/>},
    {name: "Soccer", icon:<GiSoccerBall className='text-lg md:text-2xl text-white'/>},
    {name: "Tennis", icon: <BiSolidTennisBall className='text-lg md:text-2xl text-white'/>}
]
function Header1({Filter,setFilter}) {
  return (
    <div className='bg-[#333] w-full p-2 flex justify-around items-center overflow-x-auto no-scrollbar'>
        {categories.map((category) => (
            <div className={`flex justify-center items-center gap-1 cursor-pointer rounded-2xl p-2
                ${Filter === category.name ? 'bg-[#19A044] text-white' : ''}
                `}
            onClick={() => setFilter(category.name)}
            >
                {category.icon}
                <span className='text-sm md:text-xl text-white'>{category.name}</span>
            </div>
        ))}
    </div>
  )
}

export default Header1