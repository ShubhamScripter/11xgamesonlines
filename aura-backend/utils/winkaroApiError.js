/**
 * Structured error when Winkaro (Provider D) HTTP API fails.
 * Serialized in API responses so the browser network tab shows the real upstream error.
 */
export class WinkaroApiError extends Error {
  constructor({
    message,
    statusCode = 502,
    path = '',
    method = 'GET',
    winkaroMessage = '',
    winkaroData = null,
  }) {
    super(message);
    this.name = 'WinkaroApiError';
    this.source = 'winkaro';
    this.statusCode = statusCode;
    this.path = path;
    this.method = method;
    this.winkaroMessage = winkaroMessage || message;
    this.winkaroData = winkaroData;
  }

  toJSON() {
    return {
      success: false,
      source: 'winkaro',
      message: this.message,
      winkaro: {
        httpStatus: this.statusCode,
        method: this.method,
        path: this.path,
        detail: this.winkaroMessage,
        ...(this.winkaroData != null ? { response: this.winkaroData } : {}),
      },
    };
  }
}

function extractWinkaroMessage(data) {
  if (data == null) return '';
  if (typeof data === 'string') return data;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

function buildUserMessage(status, path, winkaroMessage) {
  const detail = winkaroMessage || 'Unknown error';
  if (status === 429) {
    return `Winkaro API rate limit: Too Many Attempts (${path})`;
  }
  if (status === 404) {
    return `Winkaro API not found (404) — ${path}: ${detail}`;
  }
  if (status === 401 || status === 403) {
    return `Winkaro API auth error (${status}) — ${detail}`;
  }
  if (status >= 500) {
    return `Winkaro API server error (${status}) — ${path}: ${detail}`;
  }
  if (status >= 400) {
    return `Winkaro API client error (${status}) — ${path}: ${detail}`;
  }
  return `Winkaro API error — ${path}: ${detail}`;
}

export function winkaroErrorFromResponse(response, { path, method = 'GET' }) {
  const status = response?.status ?? 502;
  const winkaroMessage = extractWinkaroMessage(response?.data);
  return new WinkaroApiError({
    message: buildUserMessage(status, path, winkaroMessage),
    statusCode: status,
    path,
    method,
    winkaroMessage,
    winkaroData: response?.data ?? null,
  });
}

export function winkaroErrorFromAxios(err, { path, method = 'GET' }) {
  if (err?.response) {
    return winkaroErrorFromResponse(err.response, { path, method });
  }
  return new WinkaroApiError({
    message: `Winkaro API network error — ${path}: ${err.message}`,
    statusCode: 502,
    path,
    method,
    winkaroMessage: err.message,
  });
}

export function isWinkaroApiError(error) {
  return (
    error instanceof WinkaroApiError ||
    error?.name === 'WinkaroApiError' ||
    error?.source === 'winkaro'
  );
}

/** HTTP status to return to the frontend (mirror 404/429 when safe). */
export function clientHttpStatusForWinkaro(statusCode) {
  if (statusCode === 404 || statusCode === 429) return statusCode;
  if (statusCode === 401 || statusCode === 403) return 502;
  if (statusCode >= 400 && statusCode < 500) return 502;
  if (statusCode >= 500) return 502;
  return 502;
}
