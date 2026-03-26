import React,{useState} from 'react'
import { BsFire } from "react-icons/bs";
import { FaArrowUpAZ } from "react-icons/fa6";
import Latest from './Latest';
import AtoZ from './AtoZ';
import Jili from './Jili';
import Jdb from './Jdb';
const categories = [
  { name: "Jili", icon: <BsFire size={45} /> },
  { name: "Jdb", icon: <FaArrowUpAZ size={40} /> },
];
function Fishing() {
    const [Filter,setFilter] = useState("Jili")
        let content;
        if (Filter === "Jili") {
            content = <Jili />;
        } else if (Filter === "Jdb") {
            content = <Jdb />;
        } else {
            content = <div className="p-4">No component for {Filter}</div>;
        }
    return (
    <div className='bg-[#f0f8ff] w-full  flex flex-col gap-1'>
        <div className='  flex p-2 rounded-2xl gap-4 h-fit '>
            {categories.map((cat) => (
              <div key={cat.name} 
              className={`flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer
              ${Filter === cat.name ? 'bg-[#19A044] text-white' : ''}
              `}
              onClick={() => setFilter(cat.name)}
              >
                <span className='text-xl font-semibold '>{cat.name}</span>
              </div>
            ))}
        </div>
        <div className='bg-white flex-1 h-full flex-col p-4 mt-1 mb-2 m-4 rounded-2xl gap-4 '>
          {content}
        </div>
    </div>
  )
}

export default Fishing