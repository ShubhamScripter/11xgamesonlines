import BetfairEvent from '../../models/betfairEventModel.js';

const DEFAULT_STALE_MIN = Number(process.env.BETFAIR_EVENT_STALE_MIN) || 18;

export function dbEventRowToProviderShape(row) {
  if (!row) return null;

  const baseEvent = row.raw?.event || row.raw || {};
  return {
    event: {
      ...baseEvent,
      id: row.eventId,
      name: row.name || baseEvent.name || '',
      openDate: row.openDate || baseEvent.openDate || '',
    },
    competitionName: row.competitionName || '',
  };
}

export async function getEventsFromDb(sportId) {
  return BetfairEvent.find({ sportId: Number(sportId) })
    .sort({ openDate: 1 })
    .lean();
}

/** Shape expected by fetchAllEventsForSport. */
export async function getEventsForProvider(sportId) {
  const rows = await getEventsFromDb(sportId);
  return rows.map(dbEventRowToProviderShape).filter(Boolean);
}

export async function getLatestEventSyncAt(sportId) {
  const latest = await BetfairEvent.findOne({ sportId: Number(sportId) })
    .sort({ syncedAt: -1 })
    .select('syncedAt')
    .lean();
  return latest?.syncedAt ?? null;
}

export async function isEventCatalogFresh(
  sportId,
  maxAgeMin = DEFAULT_STALE_MIN
) {
  const syncedAt = await getLatestEventSyncAt(sportId);
  if (!syncedAt) return false;
  const ageMs = Date.now() - new Date(syncedAt).getTime();
  return ageMs <= maxAgeMin * 60 * 1000;
}

export async function hasEventCatalogEntries(sportId) {
  const count = await BetfairEvent.countDocuments({
    sportId: Number(sportId),
  });
  return count > 0;
}
