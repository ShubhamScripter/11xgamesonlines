import axios from 'axios';
import dotenv from 'dotenv';
import { extractBsettleResultRow } from './matchApi/providerDHelpers.js';

dotenv.config();

const BASE_URL =
  process.env.BSETTLE_API_URL ||
  process.env.PROVIDER_D_API_URL ||
  'https://winkaro.online/api/v1';
const API_KEY = String(
  process.env.PROVIDER_D_API_KEY || process.env.API_KEY || ''
).trim();

const FANCY_GAME_TYPES = new Set([
  'normal',
  'fancy1',
  'meter',
  'line',
  'ball',
  'khado',
]);

export function isBsettleConfigured() {
  return Boolean(API_KEY);
}

export function buildFancyBsettleMarketId(eventId, fancyId) {
  return `${String(eventId)}_${String(fancyId)}`;
}

async function postBsettleResult(path, eventId, marketId) {
  if (!API_KEY) {
    throw new Error('[Bsettle] PROVIDER_D_API_KEY (or API_KEY) must be set');
  }

  const url = `${BASE_URL}/result/${path}`;
  const body = {
    data: [
      {
        eventId: String(eventId),
        marketId: String(marketId),
      },
    ],
  };

  console.log('[RESULT-API] ── third-party result request ──');
  console.log('[RESULT-API] route:', `POST /result/${path}`);
  console.log('[RESULT-API] full URL:', url);
  console.log('[RESULT-API] eventId:', String(eventId));
  console.log('[RESULT-API] marketIds:', [String(marketId)]);
  console.log('[RESULT-API] request body:', JSON.stringify(body));

  const response = await axios.post(url, body, {
    params: { key: API_KEY },
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
  });

  console.log(
    '[RESULT-API] response (first 500 chars):',
    JSON.stringify(response.data).slice(0, 500)
  );

  return response.data;
}

export async function fetchBsettleMatchOddsResult(eventId, marketId) {
  return postBsettleResult('match-odds', eventId, marketId);
}

export async function fetchBsettleBookmakerResult(eventId, marketId) {
  return postBsettleResult('bookmaker', eventId, marketId);
}

export async function fetchBsettleFancyResult(eventId, fancyId) {
  const marketId = buildFancyBsettleMarketId(eventId, fancyId);
  return postBsettleResult('fancy', eventId, marketId);
}

/** Sports / bookmaker winner name for settleSportsBet */
export function normalizeBsettleSportsResult(raw, marketId) {
  const row = extractBsettleResultRow(raw);
  if (!row) return {};

  if (row.isRefund === 1 || row.isRefund === '1') {
    return {
      final_result: 'void',
      marketId: row.marketId || row.market_id || marketId,
      raw: row,
    };
  }

  const winner =
    row.winnerName ??
    row.winner ??
    row.result ??
    row.winnerRunnerName ??
    row.runnerName ??
    row.selectionName ??
    row.winningSelection ??
    row.final_result;

  if (winner == null || String(winner).trim() === '') return {};

  return {
    final_result: String(winner).trim(),
    marketId: row.marketId || row.market_id || marketId,
    raw: row,
  };
}

/** Fancy numeric score for settleFancyBet — matches Provider B/C { result } shape */
export function normalizeBsettleFancyResult(raw) {
  const row = extractBsettleResultRow(raw);
  if (!row) return { success: false, result: null };

  if (row.isRefund === 1 || row.isRefund === '1') {
    return { success: true, result: 'void', raw: row };
  }

  const score =
    row.result ??
    row.finalResult ??
    row.final_result ??
    row.score ??
    row.runs ??
    row.value;

  if (score == null || score === '') {
    return { success: true, result: null, raw: row };
  }

  const parsed = parseFloat(score);
  if (Number.isNaN(parsed)) {
    return { success: true, result: null, raw: row };
  }

  return { success: true, result: parsed, raw: row };
}

export function isBookmakerResultPayload(payload = {}) {
  const label = String(
    payload.market_name || payload.gameType || payload.game_type || ''
  ).toLowerCase();
  return label.includes('bookmaker');
}

export function isFancyResultPayload(payload = {}) {
  if (payload.fancyId) return true;
  const marketId = String(payload.market_id || '');
  if (/^\d+_\d+$/.test(marketId)) return true;
  const gameType = String(payload.gameType || payload.game_type || '').toLowerCase();
  return FANCY_GAME_TYPES.has(gameType);
}
