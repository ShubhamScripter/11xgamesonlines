import Aviator from '../assets/spribe/Aviator.png';
import Balloon from '../assets/spribe/Balloon.png';
import Dice from '../assets/spribe/Dice.png';
import Goal from '../assets/spribe/Goal.png';
import HiLo from '../assets/spribe/HiLo.png';
import Hotline from '../assets/spribe/Hotline.png';
import Keno from '../assets/spribe/Keno.png';
import Keno80 from '../assets/spribe/Keno80.png';
import Mines from '../assets/spribe/Mines.png';
import Mini_Roulette from '../assets/spribe/Mini_Roulette.png';
import Plinko from '../assets/spribe/Plinko.png';
import Trader from '../assets/spribe/Trader.png';

export const SpribeImages = {
  Aviator,
  Balloon,
  Dice,
  Goal,
  HiLo,
  Hotline,
  Keno,
  Keno80,
  Mines,
  Mini_Roulette,
  Plinko,
  Trader
};

// Image mapping by game name for easy lookup
export const getSpribeImage = (gameName) => {
  const normalizedName = gameName.replace(/\s+/g, '_'); // Replace spaces with underscores
  return SpribeImages[normalizedName] || null;
};

