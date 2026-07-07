/** Per-match market sections (admin + user visibility). */
export const MATCH_SECTIONS = ['match_odds', 'bookmaker', 'fancy', 'premium'];

export const MATCH_SECTION_LABELS = {
  match_odds: 'Match Odds',
  bookmaker: 'Bookmaker',
  fancy: 'Fancy',
  premium: 'Premium',
};

/** Maps section id → bet lock type id used in betController */
export const SECTION_TO_BET_LOCK_ID = {
  match_odds: 'all_odds',
  bookmaker: 'all_bookmaker',
  fancy: 'fancy',
  premium: 'betfair_fancy',
};

export function normalizeMatchSectionList(sections) {
  if (!Array.isArray(sections)) return [];
  const allowed = new Set(MATCH_SECTIONS);
  return [...new Set(sections.map((s) => String(s).trim()).filter((s) => allowed.has(s)))];
}
