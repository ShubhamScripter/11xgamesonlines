import React, { useState } from 'react'
import { GrCatalog } from "react-icons/gr";
import { BsFire } from "react-icons/bs";
import { FaArrowUpAZ } from "react-icons/fa6";
import Catalog from './Catalog';
import Latest from './Latest';
import AtoZ from './AtoZ';
import { useTranslation } from '../../i18n/LanguageContext';

function Live() {
    const { t } = useTranslation();
    const [Filter,setFilter] = useState("Catalog")

    const categories = [
      { id: "Catalog", labelKey: "home.catalog", icon: <GrCatalog size={35} /> },
      { id: "Latest", labelKey: "home.latest", icon: <BsFire size={35} /> },
      { id: "A-Z", labelKey: "home.aToZ", icon: <FaArrowUpAZ size={35} /> },
    ];

    let content;
    if (Filter === "Catalog") {
        content = <Catalog />;
    } else if (Filter === "Latest") {
        content = <Latest />;
    } else if (Filter === "A-Z") {
        content = <AtoZ />;
    } else {
        content = <div className="p-4">{t('home.noComponentFor', { name: Filter })}</div>;
    }
  return (
    <div className='bg-[#f0f8ff] w-full  flex gap-1'>
        <div className=' bg-white flex flex-col p-2 ml-3 mt-2 mb-2 rounded-2xl gap-4  h-fit'>
            {categories.map((cat) => (
              <div key={cat.id} 
              className={`flex flex-col items-center justify-center p-1 rounded-md cursor-pointer
              ${Filter === cat.id ? 'bg-[#19A044] text-white' : ''}
              `}
              onClick={() => setFilter(cat.id)}
              >
                {cat.icon}
                <span className='text-[10px] '>{t(cat.labelKey)}</span>
              </div>
            ))}
        </div>
        <div className=' flex-1 h-full flex-col p-2 mt-1 mb-2 rounded-2xl gap-4 '>
          {content}
        </div>
    </div>
  )
}

export default Live
