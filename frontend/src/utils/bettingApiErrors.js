import { toast } from 'react-hot-toast';

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
