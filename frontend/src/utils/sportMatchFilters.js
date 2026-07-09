export const SPORT_DATE_TABS = [
  { id: 'Today', label: 'Today' },
  { id: 'All', label: 'All' },
];

const SPORT_INPLAY_MAX_MS = {
  cricket: 10 * 60 * 60 * 1000,
  soccer: 3 * 60 * 60 * 1000,
  tennis: 5 * 60 * 60 * 1000,
};

export const isValidListMatch = (match) => {
  const name = (match?.match || '').toLowerCase();
  return (
    name.includes(' v ') ||
    name.includes(' vs ') ||
    String(match?.match || '').includes(' - ')
  );
};

export const getMatchStartMs = (match) => {
  const raw =
    match?.date ?? match?.stime ?? match?.startTime ?? match?.start_date;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
};

/** Normalize API inplay / iplay (bool, 1, "true", etc.). */
export const parseInPlayFlag = (match) => {
  const v = match?.inplay ?? match?.iplay;
  if (v === true || v === 1) return true;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'yes') return true;
  }
  return false;
};

const hasActiveOdds = (match, sport) => {
  const odds = match?.odds;
  if (!Array.isArray(odds) || odds.length === 0) return false;

  const startMs = getMatchStartMs(match);
  const now = Date.now();

  return odds.some((o) => {
    const status = String(o?.gstatus ?? o?.status ?? '').toUpperCase();
    if (status === 'CLOSED' || status === 'COMPLETE' || status === 'SUSPENDED') {
      return false;
    }
    const h = parseFloat(o?.home);
    const a = parseFloat(o?.away);
    if (!((Number.isFinite(h) && h > 1.01) || (Number.isFinite(a) && a > 1.01))) {
      return false;
    }
    // Tennis/soccer: must have started; cricket can show live inference wider
    if (sport === 'tennis' || sport === 'soccer') {
      if (startMs == null || startMs > now) return false;
    }
    return true;
  });
};

const getInPlayMaxMs = (sport) =>
  SPORT_INPLAY_MAX_MS[sport] ?? 6 * 60 * 60 * 1000;

const isOpenLiveStatus = (match) => {
  const status = String(match?.status ?? '').toUpperCase();
  return (
    status === 'OPEN' ||
    status === 'ACTIVE' ||
    status === 'IN_PLAY' ||
    status === 'IN PLAY'
  );
};

/** API flag + OPEN market + started window + live odds (stale inplay flags ignored). */
export const isMatchInPlay = (match, sport) => {
  const status = String(match?.status ?? '').toUpperCase();
  if (status === 'CLOSED' || status === 'COMPLETE' || status === 'SUSPENDED') {
    return false;
  }

  const startMs = getMatchStartMs(match);
  const now = Date.now();

  if (startMs != null) {
    if (startMs > now) return false;
    const elapsed = now - startMs;
    const maxMs = getInPlayMaxMs(sport);
    if (elapsed > maxMs) return false;
  } else if (!parseInPlayFlag(match)) {
    return false;
  }

  if (parseInPlayFlag(match)) {
    return startMs != null || hasActiveOdds(match, sport) || isOpenLiveStatus(match);
  }

  if (startMs == null) return false;

  if (isOpenLiveStatus(match)) return true;
  if (hasActiveOdds(match, sport)) return true;

  const elapsed = now - startMs;
  const recentMs =
    sport === 'cricket' || sport === 'tennis'
      ? 4 * 60 * 60 * 1000
      : 2 * 60 * 60 * 1000;
  return elapsed <= recentMs;
};

export const sortMatchesByInPlayPriority = (matches, sport) =>
  [...(matches || [])].sort((a, b) => {
    const aLive = isMatchInPlay(a, sport) ? 1 : 0;
    const bLive = isMatchInPlay(b, sport) ? 1 : 0;
    if (bLive !== aLive) return bLive - aLive;
    return getMatchStartMs(a) - getMatchStartMs(b);
  });

export const filterMatchesByDateTab = (matches, activeTab, sport) => {
  const list = Array.isArray(matches) ? matches : [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return list.filter((match) => {
    if (!isValidListMatch(match)) return false;

    if (activeTab === 'All') return true;

    const matchDate = new Date(match.date);
    if (Number.isNaN(matchDate.getTime())) {
      return activeTab === 'Today' && isMatchInPlay(match, sport);
    }

    if (activeTab === 'Today') {
      if (isMatchInPlay(match, sport)) return true;
      return matchDate.toDateString() === today.toDateString();
    }

    return true;
  });
};

export const resolveInitialDateTab = (locationState) => {
  const tab = locationState?.active;
  // Legacy: In Play / Tomorrow → All (in-play pinned at top of All)
  if (tab === 'InPlay' || tab === 'Tomorrow') return 'All';
  return SPORT_DATE_TABS.some((t) => t.id === tab) ? tab : 'All';
};

/**
 * Group for sport list pages — in-play pinned first on Today & All.
 */
export function buildSportListSections(matches, { activeTab, sport }) {
  const sorted = sortMatchesByInPlayPriority(matches, sport);
  const live = sorted.filter((m) => isMatchInPlay(m, sport));
  const rest = sorted.filter((m) => !isMatchInPlay(m, sport));

  const sections = [];

  if (live.length > 0) {
    sections.push({
      title: 'In Play',
      matches: live,
      isLiveSection: true,
    });
  }

  sections.push(...groupByLeague(rest, sport, { liveFirst: false }));
  return sections;
}

function groupByLeague(matches, sport, { liveFirst }) {
  const grouped = matches.reduce((acc, match) => {
    const title = match.title || match.cname || 'Matches';
    if (!acc[title]) acc[title] = [];
    acc[title].push(match);
    return acc;
  }, {});

  return Object.keys(grouped)
    .map((title) => ({
      title,
      matches: sortMatchesByInPlayPriority(grouped[title], sport),
      isLiveSection: false,
    }))
    .sort((a, b) => {
      if (liveFirst) {
        const aHasLive = a.matches.some((m) => isMatchInPlay(m, sport)) ? 1 : 0;
        const bHasLive = b.matches.some((m) => isMatchInPlay(m, sport)) ? 1 : 0;
        if (bHasLive !== aHasLive) return bHasLive - aHasLive;
      }
      return (a.title || '').localeCompare(b.title || '');
    });
}
