import BetfairCompetition from '../../models/betfairCompetitionModel.js';

const DEFAULT_STALE_MIN = Number(process.env.BETFAIR_COMPETITION_STALE_MIN) || 35;

/** Cricket, soccer, tennis — same as providerDHelpers BETFAIR_SPORT_IDS values. */
export const BETFAIR_CATALOG_SPORT_IDS = [4, 1, 2];

export function dbRowToProviderShape(row) {
  if (!row) return null;
  return {
    competition: {
      id: row.competitionId,
      name: row.name || '',
    },
  };
}

export async function getCompetitionsFromDb(sportId) {
  return BetfairCompetition.find({ sportId: Number(sportId) })
    .sort({ name: 1 })
    .lean();
}

/** Shape expected by fetchAllEventsForSport (competition.id / competition.name). */
export async function getCompetitionsForProvider(sportId) {
  const rows = await getCompetitionsFromDb(sportId);
  return rows.map(dbRowToProviderShape).filter(Boolean);
}

export async function getLatestCatalogSyncAt(sportId) {
  const latest = await BetfairCompetition.findOne({ sportId: Number(sportId) })
    .sort({ syncedAt: -1 })
    .select('syncedAt')
    .lean();
  return latest?.syncedAt ?? null;
}

export async function isCatalogFresh(sportId, maxAgeMin = DEFAULT_STALE_MIN) {
  const syncedAt = await getLatestCatalogSyncAt(sportId);
  if (!syncedAt) return false;
  const ageMs = Date.now() - new Date(syncedAt).getTime();
  return ageMs <= maxAgeMin * 60 * 1000;
}

export async function hasCatalogEntries(sportId) {
  const count = await BetfairCompetition.countDocuments({
    sportId: Number(sportId),
  });
  return count > 0;
}
