import React,{useState} from 'react'
import { BsFire } from "react-icons/bs";
import { FaArrowUpAZ } from "react-icons/fa6";
import Latest from './Latest';
import AtoZ from './AtoZ';
import Spribe from './Spribe';
import Inout from './Inout';
import Jili from './Jili';
import Pragmatic from './Pragmatic';
import SmartSoft from './SmartSoft';
const categories = [
 
  { name: "Spribe", icon: <FaArrowUpAZ size={40} /> },
  { name: "Inout", icon: <FaArrowUpAZ size={40} /> },
  { name: "Jili", icon: <FaArrowUpAZ size={40} /> },
  { name: "Pragmatic", icon: <FaArrowUpAZ size={40} /> },
  // { name: "smartSoft", icon: <FaArrowUpAZ size={40} /> },
];
function Egame() {
    const [Filter,setFilter] = useState("Spribe")   
     let content;
     if (Filter === "Spribe") {
         content = <Spribe />;
     } else if (Filter === "Inout") {
         content = <Inout />;
     } else if (Filter === "Jili") {
         content = <Jili />;
     } else if (Filter === "Pragmatic") {
         content = <Pragmatic />;
     } else {
         content = <div className="p-4">No component for {Filter}</div>;
     }
  return (
    <div className='bg-[#f0f8ff] w-full  flex flex-col gap-1'>
        <div className=' flex p-2 rounded-2xl gap-4 h-fit '>
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
        <div className='bg-white flex-1 h-full flex-col p-4 m-4 mt-1 mb-2 rounded-2xl gap-4 '>
          {content}
        </div>
    </div>
  )
}

export default Egame