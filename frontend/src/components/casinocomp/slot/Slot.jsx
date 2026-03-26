import React,{useState} from 'react'
import { BsFire } from "react-icons/bs";
import { FaArrowUpAZ } from "react-icons/fa6";
import Latest from './Latest';
import AtoZ from './AtoZ';
import Jili from './Jili';
import PocketGames from './PocketGames';
import BigTimeGaming from './BigTimeGaming';
import Cq9 from './Cq9';
import Jdb from './Jdb';
import SmartSoft from './SmartSoft';
import RedTiger from './RedTiger';
import Microgaming from './Microgaming';
import PlayTech from './PlayTech';
import Habanero from './Habanero';
import NoLimit from './NoLimit';
import OneGame from './OneGame';
import Pragmatic from './Pragmatic';
import RelaxGaming from './RelaxGaming';
const categories = [
    { name: "Jili", icon: <BsFire size={45} /> },
    { name: "PocketGames", icon: <FaArrowUpAZ size={40} /> },
    { name: "BigTimeGaming", icon: <FaArrowUpAZ size={40} /> },
    { name: "Cq9", icon: <FaArrowUpAZ size={40} /> },
    { name: "Jdb", icon: <FaArrowUpAZ size={40} /> },
    { name: "SmartSoft", icon: <FaArrowUpAZ size={40} /> },
    { name: "RedTiger", icon: <FaArrowUpAZ size={40} /> },
    { name: "Microgaming", icon: <FaArrowUpAZ size={40} /> },
    { name: "PlayTech", icon: <FaArrowUpAZ size={40} /> },
    { name: "Habanero", icon: <FaArrowUpAZ size={40} /> },
    { name: "NoLimit", icon: <FaArrowUpAZ size={40} /> },
    { name: "OneGame", icon: <FaArrowUpAZ size={40} /> },
    { name: "Pragmatic", icon: <FaArrowUpAZ size={40} /> },
    { name: "RelaxGaming", icon: <FaArrowUpAZ size={40} /> },
];
function Slot() {
        const [Filter,setFilter] = useState("Jili")

    let content;
    if (Filter === "Jili") {
        content = <Jili />;
    } else if (Filter === "PocketGames") {
        content = <PocketGames />;
    } else if (Filter === "BigTimeGaming") {
        content = <BigTimeGaming />;
    } else if (Filter === "Cq9") {
        content = <Cq9 />;
    } else if (Filter === "Jdb") {
        content = <Jdb />;
    } else if (Filter === "SmartSoft") {
        content = <SmartSoft />;
    } else if (Filter === "RedTiger") {
        content = <RedTiger />;
    } else if (Filter === "Microgaming") {
        content = <Microgaming />;
    } else if (Filter === "PlayTech") {
        content = <PlayTech />;
    } else if (Filter === "Habanero") {
        content = <Habanero />;
    } else if (Filter === "NoLimit") {
        content = <NoLimit />;
    } else if (Filter === "OneGame") {
        content = <OneGame />;
    } else if (Filter === "Pragmatic") {
        content = <Pragmatic />;
    } else if (Filter === "RelaxGaming") {
        content = <RelaxGaming />;
    } else {
        content = <div className="p-4">No component for {Filter}</div>;
    }
   return (
    <div className='bg-[#f0f8ff] w-full  flex flex-col gap-1'>
        <div className='  flex flex-wrap p-2 rounded-2xl gap-4 h-fit '>
            {categories.map((cat) => (
              <div key={cat.name} 
              className={`flex flax-col items-center justify-center p-1 rounded-md cursor-pointer
              ${Filter === cat.name ? 'bg-[#19A044] text-white' : ''}
              `}
              onClick={() => setFilter(cat.name)}
              >
                <span className='text-xl font-semibold'>{cat.name}</span>
              </div>
            ))}
        </div>
        <div className='bg-white flex-1 h-full flex-col p-2 mt-1 mb-2 m-4 rounded-2xl gap-4 '>
          {content}
        </div>
    </div>
  )
}

export default Slot