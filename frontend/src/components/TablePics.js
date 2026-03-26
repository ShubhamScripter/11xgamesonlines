import Fairness_Games_BlockLobby from '../assets/jili/Fairness-Games(BlockLobby).png';
import Dragon_Tiger from '../assets/jili/Dragon-&-Tiger.png';
import Dice from '../assets/jili/Dice.png';
import UP_DOWN from '../assets/jili/7-UP-DOWN.png';
import Lucky_Number from '../assets/jili/Lucky-Number.png';
import Big_Small from '../assets/jili/Big-Small.png';
import Number_King from '../assets/jili/Number-King.png';
import Journey_West_M from '../assets/jili/Journey-West-M.png';
import Poker_King from '../assets/jili/Poker-King.png';
import iRich_Bingo from '../assets/jili/iRich-Bingo.png';
import up7down from '../assets/jili/7up7down.png';
import Baccarat from '../assets/jili/Baccarat.png';
import Fortune_Bingo from '../assets/jili/Fortune-Bingo.png';
import Sic_Bo from '../assets/jili/Sic-Bo.png';
import Super_Bingo from '../assets/jili/Super-Bingo.png';
import Bingo_Carnaval from '../assets/jili/Bingo-Carnaval.png';
import Win_Drop from '../assets/jili/Win-Drop.png';
import Lucky_Bingo from '../assets/jili/Lucky-Bingo.png';
import Jackpot_Bingo from '../assets/jili/Jackpot-Bingo.png';
import Color_Game from '../assets/jili/Color-Game.png';
import Go_Goal_BIngo from '../assets/jili/Go-Goal-BIngo.png';
import Calaca_Bingo from '../assets/jili/Calaca-Bingo.png';
import PAPPU from '../assets/jili/PAPPU.png';
import West_Hunter_Bingo from '../assets/jili/West-Hunter-Bingo.png';
import Bingo_Adventure from '../assets/jili/Bingo-Adventure.png';
import Golden_Land from '../assets/jili/Golden-Land.png';
import Candyland_Bingo from '../assets/jili/Candyland-Bingo.png';
import Color_Prediction from '../assets/jili/Color-Prediction.png';
import Magic_Lamp_Bingo from '../assets/jili/Magic-Lamp-Bingo.png';
import Pearls_of_Bingo from '../assets/jili/Pearls-of-Bingo.png';
import European_Roulette from '../assets/jili/European-Roulette.png';

export const TableImages = {
  'Fairness-Games(BlockLobby)': Fairness_Games_BlockLobby,
  'Dragon-&-Tiger': Dragon_Tiger,
  'Dice': Dice,
  '7-UP-DOWN': UP_DOWN,
  'Lucky-Number': Lucky_Number,
  'Big-Small': Big_Small,
  'Number-King': Number_King,
  'Journey-West-M': Journey_West_M,
  'Poker-King': Poker_King,
  'iRich-Bingo': iRich_Bingo,
  '7up7down': up7down,
  'Baccarat': Baccarat,
  'Fortune-Bingo': Fortune_Bingo,
  'Sic-Bo': Sic_Bo,
  'Super-Bingo': Super_Bingo,
  'Bingo-Carnaval': Bingo_Carnaval,
  'Win-Drop': Win_Drop,
  'Lucky-Bingo': Lucky_Bingo,
  'Jackpot-Bingo': Jackpot_Bingo,
  'Color-Game': Color_Game,
  'Go-Goal-BIngo': Go_Goal_BIngo,
  'Calaca-Bingo': Calaca_Bingo,
  'PAPPU': PAPPU,
  'West-Hunter-Bingo': West_Hunter_Bingo,
  'Bingo-Adventure': Bingo_Adventure,
  'Golden-Land': Golden_Land,
  'Candyland-Bingo': Candyland_Bingo,
  'Color-Prediction': Color_Prediction,
  'Magic-Lamp-Bingo': Magic_Lamp_Bingo,
  'Pearls-of-Bingo': Pearls_of_Bingo,
  'European-Roulette': European_Roulette
};

// Image mapping by game name for easy lookup
export const getTableImage = (iconlink) => {
  if (!iconlink) return null;
  // console.log("iconlink",iconlink)
  // Extract filename from iconlink (e.g., "../../assets/jili/Dice.png" -> "Dice.png")
  const filename = iconlink.split('/').pop();
  // console.log("filename",filename)
  const filenameWithoutExt = filename.replace(/\.(png|jpg|jpeg)$/i, '');
  // console.log("filenameWithoutExt",filenameWithoutExt)
  // console.log("TableImages[filenameWithoutExt]",TableImages[filenameWithoutExt])
  return TableImages[filenameWithoutExt] || null;
};

