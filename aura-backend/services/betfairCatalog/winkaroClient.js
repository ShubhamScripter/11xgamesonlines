import axios from 'axios';

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
  const { API_URL, API_KEY } = getWinkaroConfig();
  const response = await axios.get(`${API_URL}${path}`, {
    params: { key: API_KEY },
  });
  return response.data;
}
