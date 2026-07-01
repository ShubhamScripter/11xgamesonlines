export const BET_LOCK_SPORTS = [
  { id: 'cricket', label: 'Cricket', gameName: 'Cricket', sportId: 4 },
  { id: 'soccer', label: 'Soccer', gameName: 'Soccer', sportId: 1 },
  { id: 'tennis', label: 'Tennis', gameName: 'Tennis', sportId: 2 },
];

/** Mirrors frontend sports markets: Match Odds, Bookmaker, Fancy, Premium Fancy */
export const BET_LOCK_BET_TYPES = [
  { id: 'all_odds', label: 'Match Odds' },
  { id: 'all_bookmaker', label: 'Bookmaker' },
  { id: 'fancy', label: 'Fancy' },
  { id: 'betfair_fancy', label: 'Premium Fancy' },
];

const SPORT_BY_GAME_NAME = new Map(
  BET_LOCK_SPORTS.map((s) => [s.gameName.toLowerCase(), s.id])
);

export function normalizeSportKey(gameName) {
  const key = String(gameName || '').trim().toLowerCase();
  if (!key) return null;
  if (SPORT_BY_GAME_NAME.has(key)) return SPORT_BY_GAME_NAME.get(key);
  if (key.includes('cricket')) return 'cricket';
  if (key.includes('soccer') || key.includes('football')) return 'soccer';
  if (key.includes('tennis')) return 'tennis';
  if (key.includes('kabaddi')) return 'kabaddi';
  if (key.includes('horse')) return 'horse';
  if (key.includes('grey')) return 'greyhound';
  if (key.includes('election')) return 'election';
  return key;
}

/** Map placement gameType + marketName → bet category lock id */
export function resolveBetTypeLockId({ gameType, marketName, isFancy, isPremium }) {
  const gt = String(gameType || '').trim();
  const mn = String(marketName || '').trim().toLowerCase();

  if (isFancy || isPremium) {
    if (isPremium) return 'betfair_fancy';
    return 'fancy';
  }

  if (gt === 'MATCH_ODDS_SB' || mn.includes('odd even')) return 'sportbook';

  if (gt === 'Bookmaker' || gt.includes('Bookmaker') || mn.includes('bookmaker')) {
    return 'all_bookmaker';
  }

  if (
    gt === 'Match Odds' ||
    gt === 'Tied Match' ||
    gt === 'Winner' ||
    gt.startsWith('OVER_UNDER')
  ) {
    return 'all_odds';
  }

  return null;
}

/** Supports new ids and legacy lock keys saved before the admin UI cleanup */
export function isBetTypeLocked(betTypesMap, betTypeId) {
  if (!betTypeId || !betTypesMap) return false;
  if (betTypesMap[betTypeId] === true) return true;

  if (betTypeId === 'fancy') {
    return betTypesMap.exch_fancy === true || betTypesMap.other_fancy === true;
  }
  if (betTypeId === 'exch_fancy' || betTypeId === 'other_fancy') {
    return betTypesMap.fancy === true;
  }
  if (betTypeId === 'exch_bookmaker') {
    return betTypesMap.all_bookmaker === true;
  }

  return false;
}
