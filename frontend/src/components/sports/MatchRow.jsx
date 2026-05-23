import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatOddsPrice = (v) => {
  if (v === null || v === undefined) return '-';
  const s = String(v).trim();
  if (s === '' || s === '0' || s === '0.0' || s === '0.00') return '-';
  const n = Number(s);
  if (!Number.isNaN(n) && n === 0) return '-';
  return s;
};

const MatchRow = ({ match, sportType }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const route = sportType === 'cricket' ? 'fullmarket' : sportType;
    navigate(`/sports/${route}/${encodeURIComponent(match.match)}/${match.id}`);
  };

  // Mock odds data if not present (to match the design in the screenshot)
  const odds = match.odds || [
    { home: '0', away: '0' },
    { home: '0', away: '0' },
    { home: '0', away: '0' }
  ];

  return (
    <div 
      className="grid grid-cols-12 gap-1 py-1 border-b border-[#2a313a] items-center bg-[#1b1f23] hover:bg-[#252a30] transition-colors cursor-pointer"
      onClick={handleClick}
    >
      {/* Match Info */}
      <div className="col-span-10 md:col-span-6 flex items-start gap-2 px-2">
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium leading-tight">{match.match}</span>
          <span className="text-gray-400 text-[10px]">{match.date}</span>
        </div>
      </div>

      {/* LIVE Badge / Market Icons */}
      <div className="col-span-2 md:col-span-1 flex justify-center">
         {match.inplay && (
          <span className="bg-red-600 text-white text-[10px] px-1 rounded font-bold mt-1">LIVE</span>
        )}
      </div>

      {/* Odds Columns (1, X, 2) */}
      <div className="col-span-12 md:col-span-5 grid grid-cols-3 gap-1 px-2">
        {/* Column 1 */}
        <div className="flex gap-0.5">
          <div className="flex-1 bg-[#4fa5d8] rounded-sm flex flex-col items-center justify-center py-1 min-h-[36px]">
            <span className="text-black font-bold text-xs">{formatOddsPrice(odds[0]?.home)}</span>
            <span className="text-[8px] text-black opacity-70">-</span>
          </div>
          <div className="flex-1 bg-[#f4adca] rounded-sm flex flex-col items-center justify-center py-1 min-h-[36px]">
            <span className="text-black font-bold text-xs">{formatOddsPrice(odds[0]?.away)}</span>
            <span className="text-[8px] text-black opacity-70">-</span>
          </div>
        </div>

        {/* Column X */}
        <div className="flex gap-0.5">
          <div className="flex-1 bg-[#4fa5d8] rounded-sm flex flex-col items-center justify-center py-1 min-h-[36px]">
            <span className="text-black font-bold text-xs">{formatOddsPrice(odds[1]?.home)}</span>
            <span className="text-[8px] text-black opacity-70">-</span>
          </div>
          <div className="flex-1 bg-[#f4adca] rounded-sm flex flex-col items-center justify-center py-1 min-h-[36px]">
            <span className="text-black font-bold text-xs">{formatOddsPrice(odds[1]?.away)}</span>
            <span className="text-[8px] text-black opacity-70">-</span>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex gap-0.5">
          <div className="flex-1 bg-[#4fa5d8] rounded-sm flex flex-col items-center justify-center py-1 min-h-[36px]">
            <span className="text-black font-bold text-xs">{formatOddsPrice(odds[2]?.home)}</span>
            <span className="text-[8px] text-black opacity-70">-</span>
          </div>
          <div className="flex-1 bg-[#f4adca] rounded-sm flex flex-col items-center justify-center py-1 min-h-[36px]">
            <span className="text-black font-bold text-xs">{formatOddsPrice(odds[2]?.away)}</span>
            <span className="text-[8px] text-black opacity-70">-</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchRow;
