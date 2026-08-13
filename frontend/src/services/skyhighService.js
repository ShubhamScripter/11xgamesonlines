import api from '../utils/axiosConfig.js';

/**
 * Launch SkyHigh Aviator for the logged-in BaajiLive user.
 * Backend mints a launch token and returns the provider launch URL.
 */
export async function launchSkyhighAviator(opts = {}) {
  try {
    const response = await api.post('/skyhigh/launch', {
      lang: opts.lang || 'EN',
      return_url: opts.return_url,
    });
    const data = response.data;
    if (!data?.success) {
      throw new Error(data?.message || 'Aviator launch failed');
    }
    const url = data.launchUrl || data.gameUrl;
    if (!url) {
      throw new Error('No launch URL returned from server');
    }
    return { ...data, launchUrl: url, gameUrl: url };
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    if (error instanceof Error && !error.response) {
      throw error;
    }
    const msg =
      error.response?.data?.message ||
      error.message ||
      'Aviator launch failed';
    const err = new Error(msg);
    err.response = error.response;
    throw err;
  }
}

/** True when a casino tile should open SkyHigh instead of BulkAPI. */
export function isSkyhighGame(game) {
  if (!game) return false;
  if (game.launch === 'skyhigh') return true;
  if (String(game.provider || '').toUpperCase() === 'SKYHIGH') return true;
  return false;
}
