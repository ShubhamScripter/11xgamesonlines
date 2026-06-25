import { applyMatchOddsToListMatch } from '../matchApi/providerDHelpers.js';
import { inferListMatchInplay } from '../sportsListCache/inplayInference.js';
import { sectionsToOddsArray } from '../../utils/matchListOdds.js';

const SPORT_ID_TO_NAME = {
  4: 'cricket',
  1: 'soccer',
  2: 'tennis',
};

export function sportIdToName(sportId) {
  return SPORT_ID_TO_NAME[Number(sportId)] || 'cricket';
}

function formatCricketOddsFromSections(sections, marketStatus) {
  const team1Odds =
    sections.length >= 1
      ? {
          home: sections[0].odds?.[0]?.odds?.toString() || '0',
          away: sections[0].odds?.[1]?.odds?.toString() || '0',
          backVolume: sections[0].odds?.[0]?.size?.toString() || '',
          layVolume: sections[0].odds?.[1]?.size?.toString() || '',
          gstatus:
            sections[0].gstatus != null
              ? String(sections[0].gstatus)
              : marketStatus,
        }
      : { home: '0', away: '0', gstatus: marketStatus };

  const team2Section = sections.length >= 3 ? sections[2] : sections[1];
  const team2Odds = team2Section
    ? {
        home: team2Section.odds?.[0]?.odds?.toString() || '0',
        away: team2Section.odds?.[1]?.odds?.toString() || '0',
        backVolume: team2Section.odds?.[0]?.size?.toString() || '',
        layVolume: team2Section.odds?.[1]?.size?.toString() || '',
        gstatus:
          team2Section.gstatus != null
            ? String(team2Section.gstatus)
            : marketStatus,
      }
    : { home: '0', away: '0', gstatus: marketStatus };

  return [
    team1Odds,
    { home: '0', away: '0', gstatus: marketStatus },
    team2Odds,
  ];
}

export function formatListOddsUpdate(row, book) {
  const sport = sportIdToName(row.sportId);
  const enriched = applyMatchOddsToListMatch(
    { gmid: row.eventId, status: book.status || 'OPEN' },
    book,
    row.runners || []
  );
  const sections = enriched.section || [];
  const marketStatus = enriched.status || '';

  const odds =
    sport === 'cricket'
      ? formatCricketOddsFromSections(sections, marketStatus)
      : sectionsToOddsArray(sections, marketStatus, true);

  const inferred = inferListMatchInplay(
    {
      id: row.eventId,
      gmid: row.eventId,
      date: row.openDate || '',
      stime: row.openDate || '',
      status: marketStatus || book.status || 'OPEN',
      inplay: Boolean(enriched.inplay),
      iplay: Boolean(enriched.iplay),
      odds,
    },
    sport
  );

  return {
    id: row.eventId,
    odds,
    status: inferred.status || marketStatus || book.status || 'OPEN',
    inplay: Boolean(inferred.inplay),
    iplay: Boolean(inferred.iplay),
  };
}
