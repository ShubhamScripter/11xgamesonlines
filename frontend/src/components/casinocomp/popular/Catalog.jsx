import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import {GameShows , Baccarat, Roulette,Dice, NewLiveGames} from '../../../components/Homelive/Pics'
import { startCasinoGame } from '../../../services/casinoService'
import { GAME_NAMES } from '../../../components/Homelive/gameMappings'
import Spinner from '../../Spinner'
function Catalog() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleGameClick = async (gameData, gameName) => {
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
      console.log(`🎮 Launching ${gameName} with UID: ${gameData.game_uid}`);
      
      const response = await startCasinoGame(
        user.userName, // username from logged in user
        gameData.game_uid, // game UID from the image mapping
        user.avbalance // user's current balance as credit amount
      );

      if (response.success) {
        toast.success(`${gameName} launching...`);
        // Open the game in a new window/tab
        // window.open(response.gameUrl, '_blank');
        window.location.href = response.gameUrl;
      } else {
        toast.error(response.message || `Failed to launch ${gameName}`);
      }
    } catch (error) {
      console.error(`Error launching ${gameName}:`, error);
      toast.error(error.response?.data?.message || `Failed to launch ${gameName}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='bg-white rounded-2xl p-2'>
        <div className=' font-semibold pr-5 text-xl p-2 bg-[#19A044] w-fit rounded-r-2xl my-2'>| Live Casino Games</div>
        <div className='grid grid-cols-3 gap-2'>
          {Object.entries(NewLiveGames).map(([key, gameData], index) => {
            // Extract image code from key (e.g., "Live1000" -> "1000")
            const imageCode = key.replace('Live', '');
            const gameName = GAME_NAMES[imageCode] || 'Casino Game';
            
            return (
              <div 
                key={index} 
                className={`cursor-pointer hover:opacity-80 transition-opacity relative ${
                  loading ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => handleGameClick(gameData, gameName)}
              >
                <img 
                  src={gameData.image} 
                  alt={gameName} 
                  className='rounded-2xl'
                />
                {/* {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl">
                    <div className="text-white text-sm">Loading...</div>
                  </div>
                )} */}
              </div>
            );
          })}
        </div>
        {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Spinner />
        </div>
      )}
      </div>
      
    </div>
  )
}

export default Catalog