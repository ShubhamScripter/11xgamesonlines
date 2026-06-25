import crypto from 'crypto';

import BetfairEvent from '../../models/betfairEventModel.js';
import { extractBetfairArray, mapPool } from '../matchApi/providerDHelpers.js';
import {
  BETFAIR_CATALOG_SPORT_IDS,
  getCompetitionsFromDb,
} from './competitionStore.js';
import { syncCompetitionsForSport } from './competitionSync.js';
import { winkaroGet } from './winkaroClient.js';

const EVENT_FETCH_CONCURRENCY = 4;

function makeEventContentHash(event) {
  const payload = JSON.stringify({
    eventId: String(event.eventId),
    name: String(event.name || ''),
    openDate: String(event.openDate || ''),
    competitionId: String(event.competitionId),
    competitionName: String(event.competitionName || ''),
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export function normalizeEventItem(ev, competitionId, competitionName) {
  const event = ev?.event || ev;
  const eventId = String(event?.id ?? ev?.id ?? '').trim();
  if (!eventId) return null;

  const name = String(event?.name ?? ev?.name ?? '').trim();
  const openDate = String(event?.openDate ?? ev?.openDate ?? '').trim();

  return {
    eventId,
    name,
    openDate,
    competitionId: String(competitionId),
    competitionName: String(competitionName || ''),
    raw: ev?.event ? ev : { event },
  };
}

async function fetchEventsForCompetition(sportId, competitionId) {
  const data = await winkaroGet(
    `/betfair/event-list/${sportId}/${competitionId}`
  );
  return extractBetfairArray(data);
}

/**
 * Sync all events for a sport from stored competitions.
 * @param {number} sportId
 * @param {{ preloadedCompetitions?: Array }} [options]
 */
export async function syncEventsForSport(sportId, options = {}) {
  const sid = Number(sportId);
  let competitions = Array.isArray(options.preloadedCompetitions)
    ? options.preloadedCompetitions
    : await getCompetitionsFromDb(sid);

  if (!competitions.length) {
    await syncCompetitionsForSport(sid);
    competitions = await getCompetitionsFromDb(sid);
  }

  if (!competitions.length) {
    console.warn(`[BetfairCatalog] sport ${sid}: no competitions — skip event sync`);
    return {
      sportId: sid,
      total: 0,
      inserted: 0,
      updated: 0,
      unchanged: 0,
      deleted: 0,
      competitions: 0,
    };
  }

  const now = new Date();
  const freshEventIds = new Set();
  const competitionIds = competitions.map((c) => String(c.competitionId));

  let inserted = 0;
  let updated = 0;
  let unchanged = 0;
  let total = 0;

  await mapPool(
    competitions,
    async (comp) => {
      const competitionId = String(comp.competitionId);
      const competitionName = comp.name || '';

      let apiEvents = [];
      try {
        apiEvents = await fetchEventsForCompetition(sid, competitionId);
      } catch (err) {
        console.warn(
          `[BetfairCatalog] event-list failed sport=${sid} comp=${competitionId}:`,
          err.message
        );
        return;
      }

      const freshForCompetition = new Set();

      for (const ev of apiEvents) {
        const normalized = normalizeEventItem(ev, competitionId, competitionName);
        if (!normalized) continue;

        total += 1;
        freshEventIds.add(normalized.eventId);
        freshForCompetition.add(normalized.eventId);

        const hash = makeEventContentHash(normalized);
        const existing = await BetfairEvent.findOne({
          sportId: sid,
          eventId: normalized.eventId,
        })
          .select('contentHash')
          .lean();

        if (existing?.contentHash === hash) {
          unchanged += 1;
          continue;
        }

        await BetfairEvent.updateOne(
          { sportId: sid, eventId: normalized.eventId },
          {
            $set: {
              competitionId: normalized.competitionId,
              name: normalized.name,
              openDate: normalized.openDate,
              competitionName: normalized.competitionName,
              contentHash: hash,
              raw: normalized.raw,
              syncedAt: now,
            },
          },
          { upsert: true }
        );

        if (existing) updated += 1;
        else inserted += 1;
      }

      if (freshForCompetition.size > 0) {
        await BetfairEvent.deleteMany({
          sportId: sid,
          competitionId,
          eventId: { $nin: [...freshForCompetition] },
        });
      }
    },
    EVENT_FETCH_CONCURRENCY
  );

  let deleted = 0;

  if (freshEventIds.size > 0) {
    const deleteResult = await BetfairEvent.deleteMany({
      sportId: sid,
      eventId: { $nin: [...freshEventIds] },
    });
    deleted += deleteResult.deletedCount ?? 0;
  }

  if (competitionIds.length > 0) {
    const orphanResult = await BetfairEvent.deleteMany({
      sportId: sid,
      competitionId: { $nin: competitionIds },
    });
    deleted += orphanResult.deletedCount ?? 0;
  }

  const summary = {
    sportId: sid,
    competitions: competitions.length,
    total,
    inserted,
    updated,
    unchanged,
    deleted,
  };

  console.log(
    `[BetfairCatalog] synced events sport ${sid}: ${summary.total} events ` +
      `from ${summary.competitions} competitions ` +
      `(${summary.inserted} new, ${summary.updated} updated, ` +
      `${summary.unchanged} unchanged, ${summary.deleted} deleted)`
  );

  return summary;
}

export async function syncAllEventCatalogs() {
  const results = [];
  for (const sportId of BETFAIR_CATALOG_SPORT_IDS) {
    try {
      results.push(await syncEventsForSport(sportId));
    } catch (err) {
      console.error(
        `[BetfairCatalog] event sync failed for sport ${sportId}:`,
        err.message
      );
    }
  }
  return results;
}
