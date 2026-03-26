import React, { useState } from 'react'
import { MdArrowBackIos } from "react-icons/md";
import HeaderLogin from '../../components/Header/HeaderLogin'

function Setting() {
  const [highlightOdds, setHighlightOdds] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  return (
    <div>
      <HeaderLogin/>
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className='text-white text-2xl font-semibold' />
        </div>
        <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">Setting</span>
      </div>
      <div className='bg-[#f1f7ff] min-h-[80vh]'>
        <div className='px-2'>
          <h3 className='p-2 text-lg font-semibold'>My Wallet Id</h3>
          <div className='bg-white rounded-lg p-4 m-2 flex justify-between items-center'>
            <span>Highlight when odds change</span>
            <input
              type="checkbox"
              checked={highlightOdds}
              onChange={() => setHighlightOdds(prev => !prev)}
            />
          </div>
        </div>
        <div className='px-2'>
          <h3 className='p-2 text-lg font-semibold'>Events Widget</h3>
          <div className='bg-white rounded-lg p-4 m-2 flex justify-between items-center'>
            <span>Show in Full-Markets</span>
            <input
              type="checkbox"
              checked={showWidget}
              onChange={() => setShowWidget(prev => !prev)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Setting