import React from 'react'
import SusFancyresult from '../../assets/susfancyres.png'
import SusMarketresult from '../../assets/susmarketres.png'
import { useNavigate } from 'react-router'
function SuspendedResult() {
  const navigate=useNavigate()
  return (
    <div className='p-2'>
            <div className='bg-[#e0e6e6] border-b border-b-[#7e97a7]  p-4 mt-4'>
            <h2 className='text-[#243a48] font-[700]'>Suspended Result</h2>
            <div className='flex gap-2 mt-2'>
              <img src={SusFancyresult} alt="" className='rounded-[10px] border-2 border-[#333] w-35 h-30'
              onClick={()=>navigate('/SuspendedFancyResult')}
              />
              <img src={SusMarketresult} alt="" className='rounded-[10px] border-2 border-[#333] w-35 h-30'
              onClick={()=>navigate('/SuspendedMarketResult')}
              />
              
            </div>
          </div>
          </div>
  )
}

export default SuspendedResult