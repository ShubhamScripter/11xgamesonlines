import React, { useState } from 'react'
import { GrCatalog } from "react-icons/gr";
import { BsFire } from "react-icons/bs";
import { FaArrowUpAZ } from "react-icons/fa6";
import Catalog from './Catalog';
import Latest from './Latest';
import AtoZ from './AtoZ';
import Evolution from './Evolution';
import Pragmatic from './Pragmatic';
import PlayTech from './PlayTech';
import Ezugi from './Ezugi';
const categories = [
  // { name: "Catalog", icon: <GrCatalog size={45} /> },
  // { name: "Latest", icon: <BsFire size={45} /> },
  // { name: "A-Z", icon: <FaArrowUpAZ size={40} /> },
  { name: "Evolution", icon: <BsFire size={45} /> },
  { name: "Pragmatic", icon: <FaArrowUpAZ size={40} /> },
  { name: "PlayTech", icon: <FaArrowUpAZ size={40} /> },
  { name: "Ezugi", icon: <FaArrowUpAZ size={40} /> },
];

function Live() {
    const [Filter,setFilter] = useState("Evolution")

    let content;
    if (Filter === "Evolution") {
        content = <Evolution />;
    } else if (Filter === "Pragmatic") {
        content = <Pragmatic />;
    } else if (Filter === "PlayTech") {
        content = <PlayTech />;
    } else if (Filter === "Ezugi") {
        content = <Ezugi />;
    } else {
        content = <div className="p-4">No component for {Filter}</div>;
    }
  return (
    <div className='bg-[#f0f8ff] w-full  flex flex-col gap-1'>
        <div className='  flex  p-2  rounded-2xl gap-4  h-fit'>
            {categories.map((cat) => (
              <div key={cat.name} 
              className={`flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer
              ${Filter === cat.name ? 'bg-[#19A044] text-white' : ''}
              `}
              onClick={() => setFilter(cat.name)}
              >
                <span className='text-xl font-semibold'>{cat.name}</span>
              </div>
            ))}
        </div>
        <div className='bg-white flex-1 h-full flex-col p-2 m-4 mt-1 mb-2 rounded-2xl gap-4 '>
          {content}
        </div>
    </div>
  )
}

export default Live