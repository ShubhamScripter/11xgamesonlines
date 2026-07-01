import { fetchMatchList } from '../matchApi/index.js';
import { sectionsToOddsArray } from '../../utils/matchListOdds.js';

/** Cricket leagues hidden from listing (case-insensitive cname). */
const BLOCKED_CRICKET_CNAMES = new Set([
  'dim cricket league (1 over)',
  't5 xi',
  't10 xi',
]);

const isBlockedCricketLeague = (cname) => {
  const key = (cname || '').toString().trim().toLowerCase();
  return BLOCKED_CRICKET_CNAMES.has(key);
};

const SPORT_IDS = {
  cricket: 4,
  soccer: 1,
  tennis: 2,
};

const transformSoccerMatch = (match, withOdds) => {
  const marketStatus = match.status != null ? String(match.status) : '';
  const sections = Array.isArray(match.section) ? match.section : [];
  return {
    id: match.gmid,
    beventId: match.beventId || match.bevent_id || null,
    match: match.ename,
    date: match.stime,
    cname: match.cname,
    iplay: match.iplay,
    inplay: Boolean(match.iplay ?? match.inplay),
    status: marketStatus,
    channels: match.f ? ['F'] : [],
    odds:
      withOdds && sections.length
        ? sectionsToOddsArray(sections, marketStatus, true)
        : [],
  };
};

const transformTennisMatch = (match, withOdds) => {
  const marketStatus = match.status != null ? String(match.status) : '';
  const sections = Array.isArray(match.section) ? match.section : [];
  return {
    id: match.gmid,
    beventId: match.beventId || match.bevent_id || null,
    match: match.ename,
    date: match.stime,
    cname: match.cname,
    iplay: match.iplay,
    inplay: Boolean(match.iplay ?? match.inplay),
    status: marketStatus,
    channels: match.f ? ['F'] : [],
    odds:
      withOdds && sections.length
        ? sectionsToOddsArray(sections, marketStatus, true)
        : [],
  };
};

export async function buildCricketPayload(withOdds, oddsScope) {
  const data = await fetchMatchList(SPORT_IDS.cricket, {
    includeOdds: withOdds,
    oddsScope,
  });
  if (!data.success) {
    throw new Error('Failed to fetch cricket matches');
  }

  const allMatches = [...(data.data.t1 || []), ...(data.data.t2 || [])];

  const transformed = allMatches
    .map((match) => {
      const marketStatus = match.status != null ? String(match.status) : '';

      const team1Odds =
        match.section && match.section.length >= 1
          ? {
              home: match.section[0].odds[0]?.odds?.toString() || '0',
              away: match.section[0].odds[1]?.odds?.toString() || '0',
              backVolume: match.section[0].odds[0]?.size?.toString() || '',
              layVolume: match.section[0].odds[1]?.size?.toString() || '',
              gstatus:
                match.section[0].gstatus != null
                  ? String(match.section[0].gstatus)
                  : marketStatus,
            }
          : { home: '0', away: '0', gstatus: marketStatus };

      const team2Section =
        match.section && match.section.length >= 3
          ? match.section[2]
          : match.section?.[1];
      const team2Odds = team2Section
        ? {
            home: team2Section.odds[0]?.odds?.toString() || '0',
            away: team2Section.odds[1]?.odds?.toString() || '0',
            backVolume: team2Section.odds[0]?.size?.toString() || '',
            layVolume: team2Section.odds[1]?.size?.toString() || '',
            gstatus:
              team2Section.gstatus != null
                ? String(team2Section.gstatus)
                : marketStatus,
          }
        : { home: '0', away: '0', gstatus: marketStatus };

      const oddsArr = withOdds
        ? [team1Odds, { home: '0', away: '0', gstatus: marketStatus }, team2Odds]
        : [];

      return {
        id: match.beventId || match.oldgmid || match.gmid,
        beventId: match.beventId || null,
        match: match.ename,
        date: match.stime,
        cname: match.cname,
        channels: [],
        odds: oddsArr,
        inplay: Boolean(match.iplay ?? match.inplay),
        status: marketStatus,
      };
    })
    .filter((m) => {
      if (isBlockedCricketLeague(m.cname)) return false;
      const matchName = (m.match || '').toString().trim().toLowerCase();
      const categoryName = (m.cname || '').toString().trim().toLowerCase();
      if (!matchName) return false;
      if (!categoryName) return true;
      return matchName !== categoryName;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return { success: true, matches: transformed };
}

export async function buildSoccerPayload(withOdds, oddsScope) {
  const data = await fetchMatchList(SPORT_IDS.soccer, {
    includeOdds: withOdds,
    oddsScope,
  });
  if (!data?.success) {
    throw new Error(data?.message || 'Failed to fetch soccer data');
  }

  const combinedData = [...(data.data?.t1 || []), ...(data.data?.t2 || [])]
    .map((match) => transformSoccerMatch(match, withOdds))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return { success: true, matches: combinedData, data: combinedData };
}

export async function buildTennisPayload(withOdds, oddsScope) {
  const data = await fetchMatchList(SPORT_IDS.tennis, {
    includeOdds: withOdds,
    oddsScope,
  });
  if (!data?.success) {
    throw new Error(data?.message || 'Failed to fetch tennis data');
  }

  const combinedData = [...(data.data?.t1 || []), ...(data.data?.t2 || [])]
    .map((match) => transformTennisMatch(match, withOdds))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return { success: true, matches: combinedData, data: combinedData };
}

export async function buildSportPayload(sport, withOdds, oddsScope) {
  if (sport === 'cricket') return buildCricketPayload(withOdds, oddsScope);
  if (sport === 'soccer') return buildSoccerPayload(withOdds, oddsScope);
  if (sport === 'tennis') return buildTennisPayload(withOdds, oddsScope);
  throw new Error(`Unknown sport: ${sport}`);
}

export const SPORTS_CACHE_SPORTS = ['cricket', 'soccer', 'tennis'];
