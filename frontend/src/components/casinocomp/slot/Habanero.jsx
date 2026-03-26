import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import jiliGames from '../../../components/api_json/Habanero.json'
import { startCasinoGame } from '../../../services/casinoService'
import { getSlotImage } from '../../../components/SlotPics'
import Spinner from '../../Spinner'
function Habanero() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  
  // Filter Slot Games and get remaining games for AtoZ (skip first 16)
  const slotGames = jiliGames.filter(game => game.game_type === 'Slot Game')
  
  const handleGameClick = async (game) => {
    if (!user) {
      toast.error('Please login to play casino games');
      return;
    }

    if (!user.avbalance || user.avbalance <= 0) {
      toast.error('Insufficient balance to play casino games');
      return;
    }

    setLoading(true);
    try {
      console.log(`🎮 Launching ${game.game_name} with UID: ${game.game_uid}`);
      
      const response = await startCasinoGame(
        user.userName,
        game.game_uid,
        user.avbalance
      );

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
    <div className='grid grid-cols-3 gap-2'>
        {slotGames.map((game, index) => (
          <div 
            key={game.id} 
            className={`cursor-pointer hover:opacity-80 transition-opacity relative ${
              loading ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => handleGameClick(game)}
          >
            <img 
            //   src={getSlotImage(game.iconlink)} 
            src={game.icon}
              alt={game.game_name} 
              className='rounded-2xl' 
              loading="lazy"
            />
            {/* {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl">
                <div className="text-white text-sm">Loading...</div>
              </div>
            )} */}
          </div>
        ))}
        {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Spinner />
        </div>
      )}
    </div>
  )
}

export default Habanero