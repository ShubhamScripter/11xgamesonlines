import { toast } from 'react-hot-toast';

let lastPlacementToastAt = 0;
let lastPlacementToastMsg = '';

/** User-facing message when Winkaro / betting API has no data for this event. */
export function resolveBettingErrorMessage(error, gameid) {
  const id = String(gameid || '');
  if (!error) return `Event ${id} is not found`;

  if (typeof error === 'string') {
    return error.toLowerCase().includes('not found')
      ? error
      : `Event ${id} is not found`;
  }

  if (error.eventNotFound) {
    return error.message || `Event ${id} is not found`;
  }

  if (error.source === 'winkaro' && error.message) {
    return error.message;
  }

  return error.message || `Event ${id} is not found`;
}

export function showBettingEventErrorToast(error, gameid) {
  toast.error(resolveBettingErrorMessage(error, gameid));
}

/** Instant toast when place-bet / place-fancy-bet fails (403 lock, validation, etc.). */
export function resolveBetPlacementErrorMessage(error) {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (typeof data === 'string' && data.trim()) return data.trim();
  if (data?.message) return String(data.message);

  if (status === 403) return 'Betting is locked for this selection';
  if (status === 400) return 'Invalid bet — please check odds and stake';

  return error?.message || 'Failed to place bet';
}

export function showBetPlacementErrorToast(errorOrMessage) {
  const message =
    typeof errorOrMessage === 'string'
      ? errorOrMessage
      : resolveBetPlacementErrorMessage(errorOrMessage);

  if (!message) return;

  const now = Date.now();
  if (message === lastPlacementToastMsg && now - lastPlacementToastAt < 2000) {
    return;
  }

  lastPlacementToastMsg = message;
  lastPlacementToastAt = now;
  toast.error(message, { duration: 4500 });
}

export function normalizeBetPlacementRejectPayload(error) {
  return { message: resolveBetPlacementErrorMessage(error) };
}

export function normalizeBettingThunkError(error, gameid) {
  const data = error?.response?.data;
  if (data && typeof data === 'object') {
    return {
      message: data.message || `Event ${gameid} is not found`,
      source: data.source ?? null,
      eventNotFound: Boolean(data.eventNotFound),
      gameid: String(gameid),
      winkaro: data.winkaro ?? null,
    };
  }
  return {
    message:
      (typeof data === 'string' ? data : null) ||
      error?.message ||
      `Event ${gameid} is not found`,
    eventNotFound: error?.response?.status === 404,
    gameid: String(gameid),
  };
}
