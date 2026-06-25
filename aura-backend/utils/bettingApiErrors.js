import {
  clientHttpStatusForWinkaro,
  isWinkaroApiError,
} from './winkaroApiError.js';

/**
 * Send betting payload when provider returned success:false (no thrown error).
 */
export function sendBettingProviderFailure(res, json, gameid) {
  const eventId = String(gameid);
  const winkaro = json.winkaro || {
    httpStatus: json.status === 404 ? 404 : 200,
    method: 'GET',
    path: json.winkaroPath || `/betfair/market-all-list/${eventId}`,
    detail:
      json.msg ||
      json.message ||
      'Winkaro API returned no betting markets for this event',
  };

  const httpStatus =
    json.status === 404 ? 404 : clientHttpStatusForWinkaro(winkaro.httpStatus);

  return res.status(httpStatus).json({
    success: false,
    source: json.source || 'winkaro',
    message:
      json.msg ||
      json.message ||
      'Winkaro API returned no betting markets for this event',
    gameid: eventId,
    winkaro,
  });
}

/** Send caught error from fetchMatchData / provider layer. */
export function sendBettingApiError(res, error, gameid) {
  if (isWinkaroApiError(error)) {
    const body = typeof error.toJSON === 'function' ? error.toJSON() : error;
    body.gameid = String(gameid);
    return res
      .status(clientHttpStatusForWinkaro(error.statusCode))
      .json(body);
  }

  console.error('Betting API error:', error?.message || error);
  return res.status(500).json({
    success: false,
    source: 'server',
    message: error?.message || 'Internal server error',
    gameid: String(gameid),
  });
}
