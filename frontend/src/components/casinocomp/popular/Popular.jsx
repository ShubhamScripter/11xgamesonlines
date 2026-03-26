import React, { useState } from 'react'
import { GrCatalog } from "react-icons/gr";
import { BsFire } from "react-icons/bs";
import { FaArrowUpAZ } from "react-icons/fa6";
import Catalog from './Catalog';
import Latest from './Latest';
import AtoZ from './AtoZ';
const categories = [
  { name: "Catalog", icon: <GrCatalog size={45} /> },
  { name: "Latest", icon: <BsFire size={45} /> },
  { name: "A-Z", icon: <FaArrowUpAZ size={40} /> },
];
function Popular() {
    const [Filter,setFilter] = useState("Catalog")

    let content;
    if (Filter === "Catalog") {
        content = <Catalog />;
    } else if (Filter === "Latest") {
        content = <Latest />;
    } else if (Filter === "A-Z") {
        content = <AtoZ />;
    } else {
        content = <div className="p-4">No component for {Filter}</div>;
    }
  return (
    <div className='bg-[#f0f8ff] w-full  flex flex-col gap-1'>
        <div className='  flex  p-2 rounded-2xl gap-4  h-fit'>
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
        <div className='flex-1 h-full flex-col p-2 mt-1 mb-2 rounded-2xl gap-4 '>
          {content}
        </div>
    </div>
  )
}

export default Popular