import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCricketBatingData } from '../../features/sports/cricketSlice';
import { fetchSoccerBatingData } from '../../features/sports/soccerSlice';
import { fetchTannisBatingData } from '../../features/sports/tennisSlice';
import { SPORT_ICONS } from './sportSidebarAssets';
import {
  buildOddsColumns,
  formatMatchSchedule,
  getOddsBlockStyle,
  isMatchLive,
} from './matchListUtils';

function OddsCell({ price, volume, type, suspended }) {
  const isEmpty = price === '-';
  const bgClass = suspended
    ? 'bg-[#3a4048]'
    : type === 'back'
      ? 'bg-[#72BBEF]'
      : 'bg-[#FAA9BA]';
  const textClass =
    suspended || isEmpty ? 'text-[#9ca3af]' : 'text-[#111827]';
  const volClass =
    suspended || isEmpty ? 'text-[#6b7280]' : 'text-[#374151]';

  return (
    <div
      className={`w-full rounded-[4px] ${bgClass} py-1 px-0.5 flex flex-col items-center justify-center min-h-[34px]`}
    >
      <span className={`text-[10px] font-bold leading-tight ${textClass}`}>
        {isEmpty ? '—' : price}
      </span>
      {volume && !isEmpty && (
        <span className={`text-[7px] font-medium leading-none mt-0.5 ${volClass}`}>
          {volume}
        </span>
      )}
    </div>
  );
}

function OddsColumn({ column }) {
  return (
    <div className="w-full grid grid-cols-2 gap-0.5">
      <OddsCell
        price={column.back}
        volume={column.backVol}
        type="back"
        suspended={column.suspended}
      />
      <OddsCell
        price={column.lay}
        volume={column.layVol}
        type="lay"
        suspended={column.suspended}
      />
    </div>
  );
}

const MatchRow = ({ match, sportType, hideOdds = false, columnLabels }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => {
    const route = sportType === 'cricket' ? 'fullmarket' : sportType;
    if (sportType === 'cricket') {
      dispatch(fetchCricketBatingData(match.id));
    } else if (sportType === 'soccer') {
      dispatch(fetchSoccerBatingData(match.id));
    } else if (sportType === 'tennis') {
      dispatch(fetchTannisBatingData(match.id));
    }
    navigate(`/sports/${route}/${encodeURIComponent(match.match)}/${match.id}`);
  };

  const { date, time } = formatMatchSchedule(match);
  const live = isMatchLive(match, sportType);
  const columns = buildOddsColumns(match, sportType);
  const colCount = columnLabels?.length || columns.length;
  const oddsStyle = getOddsBlockStyle(colCount);

  if (hideOdds) {
    const sportIcon = SPORT_ICONS[sportType] || SPORT_ICONS.cricket;

    return (
      <div
        className="flex items-start gap-3 py-3 px-2 sm:px-3 border-b border-[#2a313a] bg-[#1b1f23] hover:bg-[#252a30] active:bg-[#2d3339] transition-colors cursor-pointer"
        onClick={handleClick}
      >
        <img
          src={sportIcon}
          alt=""
          className="w-6 h-6 shrink-0 object-contain mt-0.5 opacity-90"
          aria-hidden
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-white text-[13px] font-semibold leading-snug break-words">
              {match.match}
            </p>
            {live && (
              <span className="bg-red-600 text-white text-[9px] leading-none px-1.5 py-1 rounded-sm font-bold shrink-0 uppercase tracking-wide">
                In Play
              </span>
            )}
          </div>
          <div className="text-[#8b949e] text-[11px] mt-1.5 leading-tight flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>{date}</span>
            <span className="text-[#5c6570]" aria-hidden>
              ·
            </span>
            <span>{time}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-2 sm:px-3 py-2.5 border-b border-[#2a313a] bg-[#1b1f23] hover:bg-[#22272d] active:bg-[#282e35] transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5">
          <p className="flex-1 min-w-0 text-white text-[12px] sm:text-[13px] font-semibold leading-snug line-clamp-2">
            {match.match}
          </p>
          {live && (
            <span className="shrink-0 inline-flex items-center gap-0.5 rounded px-1 py-0.5 bg-red-600/90 text-white text-[7px] font-bold uppercase">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              In Play
            </span>
          )}
        </div>
        <p className="mt-1 text-[10px] sm:text-[11px] text-[#8b949e] leading-tight truncate">
          {date} · {time}
        </p>
      </div>

      <div className="grid shrink-0" style={oddsStyle}>
        {columns.slice(0, colCount).map((col) => (
          <OddsColumn key={col.label} column={col} />
        ))}
      </div>
    </div>
  );
};

export default MatchRow;
