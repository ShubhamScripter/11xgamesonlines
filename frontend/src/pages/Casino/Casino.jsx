import React, { useState } from 'react'
import HeaderLogin from '../../components/Header/HeaderLogin'
import bg from '../../assets/casino/bgheadimg.png'
import popular from '../../assets/casino/popular.svg'
import popular1 from '../../assets/casino/hover-popular.svg'
import live from '../../assets/casino/icon-live.svg'
import live1 from '../../assets/casino/hover-live.svg'
import table from '../../assets/casino/icon-table.svg'
import table1 from '../../assets/casino/hover-table.svg'
import slot from '../../assets/casino/icon-slot.svg'
import slot1 from '../../assets/casino/hover-slot.svg'
import fishing from '../../assets/casino/icon-fishing.svg'
import fishing1 from '../../assets/casino/hover-fishing.svg'
import egame from '../../assets/casino/egame.svg'
import egame1 from '../../assets/casino/hover-egame.svg'

import Egame from '../../components/casinocomp/egame/Egame'
import Fishing from '../../components/casinocomp/fishing/Fishing'
import Live from '../../components/casinocomp/live/Live'
import Popular from '../../components/casinocomp/popular/Popular'
import Slot from '../../components/casinocomp/slot/Slot'
import Table from '../../components/casinocomp/table/Table'

function Casino() {
  const [selected, setSelected] = useState('Popular');
  let content;
  if (selected === 'Popular') {
    content = <Popular />;
  } else if (selected === 'Live') {
    content = <Live />;
  } else if (selected === 'Table') {
    content = <Table />;
  } else if (selected === 'Slot') {
    content = <Slot />;
  } else if (selected === 'Fishing') {
    content = <Fishing />;
  } else if (selected === 'Egame') {
    content = <Egame />;
  } else {
    content = <div className="p-4">No component for {selected}</div>;
  }

  return (
    <div>
      <HeaderLogin/>
      <div
        className=" flex items-center justify-between gap-5 p-2 py-4 px-5 overflow-x-auto no-scrollbar"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div
          className='flex flex-col justify-center items-center cursor-pointer'
          onClick={() => setSelected('Popular')}
        >
          <span className='text-lg font-bold text-[#946f3b]'>Popular</span>
          <img src={selected === 'Popular' ? popular1 : popular} alt="" className='min-w-[50px] transition-all duration-300 ease-in-out' />
        </div>
        <div
          className='flex flex-col justify-center items-center cursor-pointer'
          onClick={() => setSelected('Live')}
        >
          <span className='text-lg font-bold text-[#946f3b]'>Live</span>
          <img src={selected === 'Live' ? live1 : live} alt="" className='min-w-[50px] transition-all duration-300 ease-in' />
        </div>
        <div
          className='flex flex-col justify-center items-center cursor-pointer'
          onClick={() => setSelected('Table')}
        >
          <span className='text-lg font-bold text-[#946f3b]'>Table</span>
          <img src={selected === 'Table' ? table1 : table} alt="" className='min-w-[50px] transition-all duration-300 ease-in-out' />
        </div>
        <div
          className='flex flex-col justify-center items-center cursor-pointer'
          onClick={() => setSelected('Slot')}
        >
          <span className='text-lg font-bold text-[#946f3b]'>Slot</span>
          <img src={selected === 'Slot' ? slot1 : slot} alt="" className='min-w-[50px] transition-all duration-300 ease-in-out' />
        </div>
        <div
          className='flex flex-col justify-center items-center cursor-pointer'
          onClick={() => setSelected('Fishing')}
        >
          <span className='text-lg font-bold text-[#946f3b]'>Fishing</span>
          <img src={selected === 'Fishing' ? fishing1 : fishing} alt="" className='min-w-[50px] transition-all duration-300 ease-in-out' />
        </div>
        <div
          className='flex flex-col justify-center items-center cursor-pointer'
          onClick={() => setSelected('Egame')}
        >
          <span className='text-lg font-bold text-[#946f3b]'>Egame</span>
          <img src={selected === 'Egame' ? egame1 : egame} alt="" className='min-w-[50px] transition-all duration-300 ease-in-out' />
        </div>
      </div>

      {content}
    </div>
  )
}

export default Casino