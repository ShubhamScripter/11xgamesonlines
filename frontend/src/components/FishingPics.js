// Static imports for all Fish Game images
import Royal_Fishing from '../assets/jili/Royal-Fishing.png';
import Bombing_Fishing from '../assets/jili/Bombing-Fishing.png';
import Dinosaur_Tycoon from '../assets/jili/Dinosaur-Tycoon.png';
import Jackpot_Fishing from '../assets/jili/Jackpot-Fishing.png';
import Dragon_Fortune from '../assets/jili/Dragon-Fortune.png';
import Mega_Fishing from '../assets/jili/Mega-Fishing.png';
import Boom_Legend from '../assets/jili/Boom-Legend.png';
import Happy_Fishing from '../assets/jili/Happy-Fishing.png';
import All_star_Fishing from '../assets/jili/All-star-Fishing.png';
import Dinosaur_Tycoon_II from '../assets/jili/Dinosaur-Tycoon-II.png';
import Ocean_King_Jackpot from '../assets/jili/Ocean-King-Jackpot.png';

export const FishingImages = {
  'Royal-Fishing': Royal_Fishing,
  'Bombing-Fishing': Bombing_Fishing,
  'Dinosaur-Tycoon': Dinosaur_Tycoon,
  'Jackpot-Fishing': Jackpot_Fishing,
  'Dragon-Fortune': Dragon_Fortune,
  'Mega-Fishing': Mega_Fishing,
  'Boom-Legend': Boom_Legend,
  'Happy-Fishing': Happy_Fishing,
  'All-star-Fishing': All_star_Fishing,
  'Dinosaur-Tycoon-II': Dinosaur_Tycoon_II,
  'Ocean-King-Jackpot': Ocean_King_Jackpot,
};

// Image mapping by filename for easy lookup
export const getFishingImage = (iconlink) => {
  if (!iconlink) return null;
  
  // Extract filename from iconlink (e.g., "../../assets/jili/Dice.png" -> "Dice.png")
  const filename = iconlink.split('/').pop();
  const filenameWithoutExt = filename.replace(/\.(png|jpg|jpeg)$/i, '');
  
  return FishingImages[filenameWithoutExt] || null;
};

