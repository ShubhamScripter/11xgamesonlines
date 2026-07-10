import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import jiliGames from '../../../components/api_json/pg.json'
import { startCasinoGame, getCasinoWalletAmount } from '../../../services/casinoService';import { getSlotImage } from '../../../components/SlotPics'
import Spinner from '../../Spinner'
import { motion } from "framer-motion";
import { IoIosArrowDown } from "react-icons/io";
import slot from '../../../assets/icon/icon-slot.png'
import slotColor from '../../../assets/icon/icon-slotColor.png'



function PocketGames() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [gameOption, setGameOption] = useState(false);
  // Filter Slot Games and get remaining games for AtoZ (skip first 16)
  const slotGames = jiliGames.filter(game => game.game_type === 'Slot Game')
  
  const handleGameClick = async (game) => {
    if (!user) {
      toast.error('Please login to play casino games');
      return;
    }

    setLoading(true);
    try {
      console.log(`🎮 Launching ${game.game_name} with UID: ${game.game_uid}`);
      
      const response = await startCasinoGame(user.userName,
        game.game_uid, getCasinoWalletAmount(user));

      if (response.success) {
        toast.success(`${game.game_name} launching...`);
        // window.open(response.gameUrl, '_blank');
        window.location.href = response.gameUrl;
      } else {
        toast.error(response.message || `Failed to launch ${game.game_name}`);
      }
    } catch (error) {
      console.error(`Error launching ${game.game_name}:`, error);
      toast.error(error.response?.data?.message || `Failed to launch ${game.game_name}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mt-20 px-4 mx-auto'>
      <div className='relative'>
        <div className='flex items-center px-4 text-white text-[20px] font-bold h-[52px] leading-none gap-1.5 mb-3' onClick={() => setGameOption(prev=>!prev)}><img src={slot} className='h-full block py-4'/> Slots <span className={`transform transition-transform duration-300  ${gameOption ? 'rotate-[180deg]':''}`}><IoIosArrowDown size={25} /></span></div>
        {gameOption && (
          <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className='absolute top-[52px] left-0 text-white bg-[#141515] z-10 w-[150px]'
            >
            <div className='px-4 h-[52px] flex items-center gap-3 bg-[#303232]'><img src={slotColor} alt="" className='h-full py-4'/> Slot</div>
            <div className='px-4 h-[52px] flex items-center'>Fishing</div>
          </motion.div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <Spinner />
          </div>
        )}
        {slotGames.map((game, index) => (
          <div 
            key={game.id} 
            className={`cursor-pointer hover:opacity-80 transition-opacity relative ${
              loading ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => handleGameClick(game)}
          >
            <img 
              src={game.icon}
              alt={game.game_name} 
              className='rounded-sm w-full h-auto aspect-[3/4] object-cover' 
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PocketGames