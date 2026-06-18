import React from 'react';
import { getOddsBlockStyle } from './matchListUtils';

function MatchListHeader({ columnLabels = ['1', '2'] }) {
  const oddsStyle = getOddsBlockStyle(columnLabels.length);

  return (
    <div className="sticky top-0 z-10 flex items-end gap-2 px-2 sm:px-3 py-2 bg-[#14181c] border-b border-[#2a313a]">
      <span className="flex-1 min-w-0 text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
        Event
      </span>
      <div className="grid shrink-0" style={oddsStyle}>
        {columnLabels.map((label) => (
          <div key={label} className="w-full">
            <p className="text-center text-[10px] font-bold text-[#9ca3af] mb-1">{label}</p>
            <div className="grid grid-cols-2 gap-0.5">
              <span className="text-center text-[8px] font-medium text-[#72BBEF]">Back</span>
              <span className="text-center text-[8px] font-medium text-[#FAA9BA]">Lay</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchListHeader;
