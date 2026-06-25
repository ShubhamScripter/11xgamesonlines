import crypto from 'crypto';

import BetfairCompetition from '../../models/betfairCompetitionModel.js';
import { extractBetfairArray } from '../matchApi/providerDHelpers.js';
import { BETFAIR_CATALOG_SPORT_IDS } from './competitionStore.js';
import { winkaroGet } from './winkaroClient.js';

export { BETFAIR_CATALOG_SPORT_IDS };

function makeContentHash(competitionId, name) {
  const payload = JSON.stringify({
    id: String(competitionId),
    name: String(name || ''),
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function normalizeCompetitionItem(comp) {
  const competitionId = String(
    comp?.competition?.id ?? comp?.competitionId ?? ''
  ).trim();
  if (!competitionId) return null;

  const name = String(comp?.competition?.name ?? comp?.name ?? '').trim();
  return {
    competitionId,
    name,
    raw: comp?.competition ? comp : { competition: { id: competitionId, name } },
  };
}

async function fetchCompetitionsFromApi(sportId) {
  const data = await winkaroGet(`/betfair/competition-list/${sportId}`);

  return extractBetfairArray(data)
    .map(normalizeCompetitionItem)
    .filter(Boolean);
}

/**
 * Sync competition-list for a sport: delete stale, upsert new/changed, skip unchanged.
 * @param {number} sportId
 * @param {{ preloaded?: Array }} [options] — skip API when list already fetched live
 */
export async function syncCompetitionsForSport(sportId, options = {}) {
  const sid = Number(sportId);
  const freshList = Array.isArray(options.preloaded)
    ? options.preloaded.map(normalizeCompetitionItem).filter(Boolean)
    : await fetchCompetitionsFromApi(sid);

  const freshIds = freshList.map((c) => c.competitionId);
  const now = new Date();

  let deleted = 0;
  if (freshIds.length > 0) {
    const deleteResult = await BetfairCompetition.deleteMany({
      sportId: sid,
      competitionId: { $nin: freshIds },
    });
    deleted = deleteResult.deletedCount ?? 0;
  } else {
    console.warn(
      `[BetfairCatalog] sport ${sid}: empty competition list — skipping stale delete`
    );
  }

  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const comp of freshList) {
    const hash = makeContentHash(comp.competitionId, comp.name);
    const existing = await BetfairCompetition.findOne({
      sportId: sid,
      competitionId: comp.competitionId,
    })
      .select('contentHash')
      .lean();

    if (existing?.contentHash === hash) {
      unchanged += 1;
      continue;
    }

    await BetfairCompetition.updateOne(
      { sportId: sid, competitionId: comp.competitionId },
      {
        $set: {
          name: comp.name,
          contentHash: hash,
          raw: comp.raw,
          syncedAt: now,
        },
      },
      { upsert: true }
    );

    if (existing) updated += 1;
    else inserted += 1;
  }

  const summary = {
    sportId: sid,
    total: freshList.length,
    inserted,
    updated,
    unchanged,
    deleted: deleted,
  };

  console.log(
    `[BetfairCatalog] synced sport ${sid}: ${summary.total} competitions ` +
      `(${summary.inserted} new, ${summary.updated} updated, ` +
      `${summary.unchanged} unchanged, ${summary.deleted} deleted)`
  );

  return summary;
}

export async function syncAllCompetitionCatalogs() {
  const results = [];
  for (const sportId of BETFAIR_CATALOG_SPORT_IDS) {
    try {
      results.push(await syncCompetitionsForSport(sportId));
    } catch (err) {
      console.error(
        `[BetfairCatalog] sync failed for sport ${sportId}:`,
        err.message
      );
    }
  }
  return results;
}
