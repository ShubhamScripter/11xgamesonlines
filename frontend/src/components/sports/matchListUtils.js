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

export const getMatchDateRaw = (match) =>
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

export function formatMatchSchedule(match) {
  const raw = getMatchDateRaw(match);
  if (raw == null || raw === '') return { date: '—', time: '—', combined: '—' };

  const parsed = parseMatchDateValue(raw);
  if (parsed) {
    const date = formatAppDate(parsed, '—');
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(parsed);
    return { date, time, combined: formatAppDateTime(parsed, '—') };
  }

  const fallback = String(raw).trim() || '—';
  return { date: fallback, time: fallback, combined: fallback };
}

import { isMatchInPlay } from '../../utils/sportMatchFilters';

export const isMatchLive = (match, sportType) =>
  isMatchInPlay(match, sportType);

export const formatOddsPrice = (v) => {
  if (v === null || v === undefined) return '-';
  const s = String(v).trim();
  if (s === '' || s === '0' || s === '0.0' || s === '0.00') return '-';
  const n = Number(s);
  if (!Number.isNaN(n) && n === 0) return '-';
  return s;
};

export const formatVolume = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || s === '0' || s === '-') return null;
  const n = Number(s);
  if (Number.isNaN(n) || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
};

const COLUMN_LABELS = ['1', 'X', '2'];

const isColumnEmpty = (col) => col.back === '-' && col.lay === '-';

export function buildOddsColumns(match, sportType) {
  const odds = Array.isArray(match?.odds) ? match.odds : [];
  const fallback = [
    { label: '1', back: '-', lay: '-', backVol: null, layVol: null, suspended: false },
    { label: 'X', back: '-', lay: '-', backVol: null, layVol: null, suspended: false },
    { label: '2', back: '-', lay: '-', backVol: null, layVol: null, suspended: false },
  ];

  if (odds.length === 0) {
    return sportType === 'cricket' ? fallback : fallback.filter((c) => c.label !== 'X');
  }

  const columns = odds.map((entry, index) => ({
    label: COLUMN_LABELS[index] || String(index + 1),
    back: formatOddsPrice(entry?.home),
    lay: formatOddsPrice(entry?.away),
    backVol: formatVolume(entry?.backVolume),
    layVol: formatVolume(entry?.layVolume),
    suspended:
      entry?.gstatus === 'SUSPENDED' ||
      entry?.status === 'SUSPENDED' ||
      match?.status === 'SUSPENDED',
  }));

  const withoutEmptyMiddle = columns.filter((col, index) => {
    if (sportType === 'cricket') return true;
    if (index === 1 && col.label === 'X' && isColumnEmpty(col)) return false;
    return true;
  });

  return withoutEmptyMiddle.length > 0 ? withoutEmptyMiddle : columns.slice(0, 2);
}

export function getListColumnLabels(sportType, sampleMatch) {
  const cols = sampleMatch ? buildOddsColumns(sampleMatch, sportType) : [];
  if (cols.length > 0) return cols.map((c) => c.label);
  return sportType === 'cricket' ? ['1', 'X', '2'] : ['1', '2'];
}

/** Fixed width per 1/X/2 column so header + rows stay aligned */
export const ODDS_COL_WIDTH = 64;
export const ODDS_COL_GAP = 4;

export function getOddsBlockStyle(columnCount) {
  const count = Math.max(columnCount, 1);
  const width = count * ODDS_COL_WIDTH + (count - 1) * ODDS_COL_GAP;
  return {
    width: `${width}px`,
    gridTemplateColumns: `repeat(${count}, ${ODDS_COL_WIDTH}px)`,
    gap: `${ODDS_COL_GAP}px`,
  };
}
