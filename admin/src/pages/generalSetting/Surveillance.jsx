import React from 'react'
import BetLockedUsers from '../../assets/bet-locked-users (1).jpg'
import cheatbet from '../../assets/cheatbet.png'
import playerBalance from '../../assets/playerbalance.png'
import userpl from '../../assets/userpl.png'
import preMatchPl from '../../assets/prematch.png'
import searchMatch from '../../assets/searchmatch.png'
import { useNavigate } from 'react-router'
function Surveillance() {
  const navigate=useNavigate()
  return (
      <div className='p-2'>
        <div className='bg-[#e0e6e6] border-b border-b-[#7e97a7]  p-4 mt-4'>
        <h2 className='text-[#243a48] font-[700]'>Match And Bets</h2>
        <div className='flex gap-2 mt-2'>
          <img src={BetLockedUsers} alt="" className='rounded-[10px] border-2 border-[#333] w-35 h-30'
          onClick={()=>navigate('/BetLockUser')}
          />
          <img src={cheatbet} alt="" className='rounded-[10px] border-2 border-[#333] w-35 h-30'/>
          <img src={playerBalance} alt="" className='rounded-[10px] border-2 border-[#333] w-35 h-30'
          onClick={()=>navigate('/PlayerBalance')}
          />
          <img src={userpl} alt="" className='rounded-[10px] border-2 border-[#333] w-35 h-30'/>
          <img src={preMatchPl} alt="" className='rounded-[10px] border-2 border-[#333] w-35 h-30'/>
          <img src={searchMatch} alt="" className='rounded-[10px] border-2 border-[#333] w-35 h-30'/>
        </div>
      </div>
      </div>
  )
}

export default Surveillance