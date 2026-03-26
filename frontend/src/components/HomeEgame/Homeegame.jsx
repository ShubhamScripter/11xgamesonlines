import React,{useState} from 'react'
import { BsFire } from "react-icons/bs";
import { FaArrowUpAZ } from "react-icons/fa6";
import Latest from './Latest';
import AtoZ from './AtoZ';
const categories = [
  { name: "Latest", icon: <BsFire size={35} /> },
  { name: "A-Z", icon: <FaArrowUpAZ size={35} /> },
];
function Homeegame() {
    const [Filter,setFilter] = useState("Latest")   
     let content;
     if (Filter === "Latest") {
         content = <Latest />;
     } else if (Filter === "A-Z") {
         content = <AtoZ />;
     } else {
         content = <div className="p-4">No component for {Filter}</div>;
     }
  return (
    <div className='bg-[#f0f8ff] w-full min-h-[450px]  flex gap-1'>
        <div className=' bg-white flex flex-col p-2 ml-3 mt-2 mb-2 rounded-2xl gap-4 h-fit '>
            {categories.map((cat) => (
              <div key={cat.name} 
              className={`flex flex-col items-center justify-center p-1 rounded-md cursor-pointer
              ${Filter === cat.name ? 'bg-[#19A044] text-white' : ''}
              `}
              onClick={() => setFilter(cat.name)}
              >
                {cat.icon}
                <span className='text-[10px] '>{cat.name}</span>
              </div>
            ))}
        </div>
        <div className=' flex-1 h-full flex-col p-2 mt-1 mb-2 rounded-2xl gap-4 '>
          {content}
        </div>
    </div>
  )
}

export default Homeegame