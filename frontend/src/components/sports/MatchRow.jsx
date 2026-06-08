import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SPORT_ICONS } from './sportSidebarAssets';
import { formatAppDate, formatAppDateTime } from '../../utils/time';

const MONTH_ABBR = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const getMatchDateRaw = (match) =>
  match?.date ?? match?.stime ?? match?.startTime ?? match?.start_date ?? null;

function parseMatchDateValue(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const cleaned = String(value).replace(/\s*\(IST\)\s*/gi, '').trim();
  if (!cleaned) return null;

  let d = new Date(cleaned);
  if (!Number.isNaN(d.getTime())) return d;

  const m = cleaned.match(
    /^([A-Za-z]{3,9})\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );
  if (m) {
    const monthIdx = MONTH_ABBR[m[1].slice(0, 3).toLowerCase()];
    if (monthIdx !== undefined) {
      let hours = parseInt(m[4], 10);
      const minutes = parseInt(m[5], 10);
      const ampm = m[6].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      d = new Date(parseInt(m[3], 10), monthIdx, parseInt(m[2], 10), hours, minutes);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }

  return null;
}

function formatMatchSchedule(match) {
  const raw = getMatchDateRaw(match);
  if (raw == null || raw === '') return { date: '—', time: '—', combined: '—' };

  const parsed = parseMatchDateValue(raw);
  if (parsed) {
    const date = formatAppDate(parsed, '—');
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(parsed);
    return { date, time, combined: formatAppDateTime(parsed, '—') };
  }

  const fallback = String(raw).trim() || '—';
  return { date: fallback, time: fallback, combined: fallback };
}

const isMatchLive = (match) => match?.inplay === true || match?.iplay === true;

const formatOddsPrice = (v) => {
  if (v === null || v === undefined) return '-';
  const s = String(v).trim();
  if (s === '' || s === '0' || s === '0.0' || s === '0.00') return '-';
  const n = Number(s);
  if (!Number.isNaN(n) && n === 0) return '-';
  return s;
};

const MatchRow = ({ match, sportType, hideOdds = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const route = sportType === 'cricket' ? 'fullmarket' : sportType;
    navigate(`/sports/${route}/${encodeURIComponent(match.match)}/${match.id}`);
  };

  const odds = match.odds || [
    { home: '0', away: '0' },
    { home: '0', away: '0' },
    { home: '0', away: '0' },
  ];

  if (hideOdds) {
    const { date, time } = formatMatchSchedule(match);
    const sportIcon = SPORT_ICONS[sportType] || SPORT_ICONS.cricket;

    return (
      <div
        className="flex items-start gap-3 py-3 px-3 border-b border-[#2a313a] bg-[#1b1f23] hover:bg-[#252a30] active:bg-[#2d3339] transition-colors cursor-pointer"
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
            {isMatchLive(match) && (
              <span className="bg-red-600 text-white text-[9px] leading-none px-1.5 py-1 rounded-sm font-bold shrink-0 uppercase tracking-wide">
                Live
              </span>
            )}
          </div>
          <div className="text-[#8b949e] text-[11px] mt-1 leading-tight flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>{date}</span>
            <span className="text-[#5c6570]" aria-hidden>
              |
            </span>
            <span>{time}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-12 gap-1 py-1 border-b border-[#2a313a] items-center bg-[#1b1f23] hover:bg-[#252a30] transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="col-span-10 md:col-span-6 flex items-start gap-2 px-2">
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium leading-tight">{match.match}</span>
          <span className="text-gray-400 text-[10px]">{match.date}</span>
        </div>
      </div>

      <div className="col-span-2 md:col-span-1 flex justify-center">
        {match.inplay && (
          <span className="bg-red-600 text-white text-[10px] px-1 rounded font-bold mt-1">
            LIVE
          </span>
        )}
      </div>

      <div className="col-span-12 md:col-span-5 grid grid-cols-3 gap-1 px-2">
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
