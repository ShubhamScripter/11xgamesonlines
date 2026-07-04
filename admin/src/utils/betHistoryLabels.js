const FANCY_GAME_TYPES = new Set([
  'normal',
  'fancy1',
  'meter',
  'line',
  'ball',
  'khado',
]);

export function getSportsBetTypeLabel(item = {}) {
  const source = String(item.betSource || '').trim().toLowerCase();
  if (source === 'providerc') return 'Premium';

  const gameType = String(item.gameType || '').trim();
  const gtLower = gameType.toLowerCase();
  const marketName = String(item.marketName || '').toLowerCase();

  if (gameType === 'Match Odds' || gtLower === 'match odds') return 'Match Odds';
  if (gtLower.includes('bookmaker') || marketName.includes('bookmaker')) {
    return 'Bookmaker';
  }
  if (FANCY_GAME_TYPES.has(gtLower)) return 'Fancy';

  const fancyScore = item.fancyScore;
  const fancyStr =
    fancyScore === undefined || fancyScore === null
      ? ''
      : String(fancyScore).trim();
  if (fancyStr && fancyStr !== '0') return 'Fancy';

  if (marketName.includes('match odds')) return 'Match Odds';
  return gameType || 'Sports';
}

export function getBetStatusLabel(status) {
  const s = Number(status);
  if (s === 0) return 'Pending';
  if (s === 1) return 'Won';
  if (s === 2) return 'Lost';
  if (s === 3) return 'Void';
  return '—';
}

export function getBetResultDisplay(item = {}) {
  const status = Number(item.status);
  const betResult =
    item.betResult != null && String(item.betResult).trim() !== ''
      ? String(item.betResult).trim()
      : '';

  if (status === 0) return '—';
  if (status === 3) return betResult || 'Void';
  if (betResult) return betResult;
  return getBetStatusLabel(status);
}
