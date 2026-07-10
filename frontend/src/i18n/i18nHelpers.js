import { BET_FILTER_OPTIONS } from '../utils/betCategory';

/** Bet filter chips with translated labels */
export function getBetFilterOptions(t) {
  return BET_FILTER_OPTIONS.map((opt) => ({
    ...opt,
    label: t(`bet.filter.${opt.key}`),
  }));
}

export function getBetCategoryLabel(t, category) {
  const key = category === 'other' ? 'sports' : category;
  return t(`bet.filter.${key}`, {}) || t('bet.filter.sports');
}

export function getSportDateTabs(t) {
  return [
    { id: 'Today', label: t('common.today') },
    { id: 'All', label: t('common.all') },
  ];
}

export function translateBlockStatus(t, label) {
  if (!label) return t('bet.suspended');
  if (label === 'Ball Running') return t('bet.ballRunning');
  if (String(label).toUpperCase() === 'SUSPENDED') return t('bet.suspended');
  return label;
}

export function translateBetType(t, type) {
  const key = String(type || '').toLowerCase();
  if (key === 'back') return t('bet.back');
  if (key === 'lay') return t('bet.lay');
  if (key === 'no') return t('bet.no');
  if (key === 'yes') return t('bet.yes');
  return type;
}

export function getSportListMeta(t) {
  return {
    cricket: {
      title: t('menu.cricket'),
      emptyMessage: t('sports.emptyCricket'),
    },
    soccer: {
      title: t('menu.football'),
      emptyMessage: t('sports.emptySoccer'),
    },
    tennis: {
      title: t('menu.tennis'),
      emptyMessage: t('sports.emptyTennis'),
    },
  };
}
