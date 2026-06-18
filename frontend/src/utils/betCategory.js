import { formatAppDateTime } from './time';

/** @typedef {'all'|'casino'|'match_odds'|'bookmaker'|'fancy'} BetFilterKey */

export const BET_FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'casino', label: 'Casino' },
  { key: 'match_odds', label: 'Match Odds' },
  { key: 'bookmaker', label: 'Bookmaker' },
  { key: 'fancy', label: 'Fancy' },
];

const FANCY_GAME_TYPES = new Set(['normal', 'meter', 'line', 'ball', 'khado']);

export const BET_CATEGORY_LABELS = {
  casino: 'Casino',
  match_odds: 'Match Odds',
  bookmaker: 'Bookmaker',
  fancy: 'Fancy',
  other: 'Sports',
};

/**
 * Classify a sports bet row from API (betHistory model).
 * @returns {Exclude<BetFilterKey, 'all'|'casino'>}
 */
export function getSportsBetCategory(bet) {
  const gameType = String(bet?.gameType || '').trim();
  const gtLower = gameType.toLowerCase();

  if (gameType === 'Match Odds' || gtLower === 'match odds') return 'match_odds';
  if (gameType === 'Tied Match' || gtLower === 'tied match') return 'other';
  if (gtLower.includes('bookmaker')) return 'bookmaker';
  if (FANCY_GAME_TYPES.has(gtLower)) return 'fancy';

  const fancy = bet?.fancyScore ?? bet?.fancy_score;
  const fancyStr =
    fancy === undefined || fancy === null ? '' : String(fancy).trim();
  if (fancyStr && fancyStr !== '0') return 'fancy';

  const market = String(bet?.marketName || '').toLowerCase();
  if (market.includes('match odds')) return 'match_odds';
  if (market.includes('tied')) return 'other';
  if (market.includes('bookmaker')) return 'bookmaker';

  return 'other';
}

export function mapSportsBetForCard(bet, { unsettledOnly = false } = {}) {
  if (!bet) return null;
  const status = Number(bet.status);
  if (unsettledOnly && status !== 0) return null;

  const created = bet.createdAt ? new Date(bet.createdAt) : new Date();
  const isUnsettled = status === 0;
  const category = getSportsBetCategory(bet);

  return {
    betKind: 'sports',
    betCategory: category,
    categoryLabel: BET_CATEGORY_LABELS[category] || BET_CATEGORY_LABELS.other,
    gameType: bet.gameType || '',
    id: bet._id || bet.id || `sports-${created.getTime()}`,
    marketName: bet.marketName || '—',
    gameName: bet.gameName || '—',
    eventName: bet.eventName || '—',
    odd:
      bet.xValue != null && bet.xValue !== ''
        ? Number(bet.xValue)
        : Number(bet.price ?? 0),
    stake: Number(bet.betAmount ?? 0),
    profitLoss: Number(bet.profitLossChange ?? bet.resultAmount ?? 0),
    possibleProfit: isUnsettled ? Number(bet.betAmount ?? 0) : undefined,
    possibleLoss: isUnsettled ? Number(bet.price ?? 0) : undefined,
    time: formatAppDateTime(created),
    placedTs: created.getTime(),
    selection: bet.teamName || '',
    otype: bet.otype === 'back' ? 'Back' : 'Lay',
    betResult: bet.betResult || '—',
    fancyScore: bet.fancyScore ?? bet.fancy_score ?? null,
  };
}

export function mapCasinoBetForCard(bet, idx = 0, { unsettledOnly = false } = {}) {
  if (!bet) return null;
  if (unsettledOnly) return null;

  const created = bet.createdAt ? new Date(bet.createdAt) : null;
  const ts = created ? created.getTime() : 0;

  return {
    betKind: 'casino',
    betCategory: 'casino',
    categoryLabel: BET_CATEGORY_LABELS.casino,
    id: bet._id || bet.game_round || `casino-${idx}`,
    gameName:
      (bet.game_name && String(bet.game_name).trim()) ||
      bet.game_uid ||
      'Casino',
    betAmount: Number(bet.bet_amount ?? 0),
    profitLoss:
      bet?.change >= 0
        ? Number(bet.change) - Number(bet.bet_amount ?? 0)
        : Number(bet.change ?? 0),
    time: created ? formatAppDateTime(created) : '',
    placedTs: ts,
  };
}

/** @param {string|string[]} filterKey single key or multi-select keys */
export function filterBetsByCategory(bets, filterKey) {
  const keys = Array.isArray(filterKey) ? filterKey : [filterKey];
  if (!keys.length || keys.includes('all')) return bets;

  return bets.filter((b) => {
    if (keys.includes('casino') && b.betKind === 'casino') return true;
    if (b.betKind === 'casino') return false;
    return keys.includes(b.betCategory);
  });
}

export function sortBetsByTimeDesc(bets) {
  return [...bets].sort((a, b) => (b.placedTs || 0) - (a.placedTs || 0));
}
