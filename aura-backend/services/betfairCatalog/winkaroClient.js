import axios from 'axios';

import {
  awaitWinkaroSlot,
  pauseWinkaroAfter429,
} from '../../utils/winkaroRateLimit.js';

export function getWinkaroConfig() {
  const API_URL =
    process.env.PROVIDER_D_API_URL || 'https://winkaro.online/api/v1';
  const API_KEY = process.env.PROVIDER_D_API_KEY || process.env.API_KEY;

  if (!API_KEY) {
    throw new Error(
      '[BetfairCatalog] PROVIDER_D_API_KEY (or API_KEY) must be set in .env'
    );
  }

  return { API_URL, API_KEY };
}

export async function winkaroGet(path) {
  await awaitWinkaroSlot();
  const { API_URL, API_KEY } = getWinkaroConfig();
  try {
    const response = await axios.get(`${API_URL}${path}`, {
      params: { key: API_KEY },
      validateStatus: () => true,
      timeout: 20000,
    });
    if (response.status === 429) {
      const retryAfter = Number(response.headers?.['retry-after']) || 16;
      pauseWinkaroAfter429(retryAfter);
    }
    if (response.status >= 400) {
      const err = new Error(`Winkaro GET ${path} failed: ${response.status}`);
      err.status = response.status;
      err.response = response;
      throw err;
    }
    return response.data;
  } catch (err) {
    if (err?.response?.status === 429) {
      const retryAfter = Number(err.response.headers?.['retry-after']) || 16;
      pauseWinkaroAfter429(retryAfter);
    }
    throw err;
  }
}
