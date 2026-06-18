import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_URL = process.env.PROVIDER_D_API_URL || 'https://winkaro.online/api/v1';
const API_KEY = process.env.PROVIDER_D_API_KEY || process.env.API_KEY;
const SPORT = 4;

const get = (path) =>
  axios.get(`${API_URL}${path}`, { params: { key: API_KEY } });

const post = (path, body) =>
  axios.post(`${API_URL}${path}`, body, {
    params: { key: API_KEY },
    headers: { 'Content-Type': 'application/json' },
  });

try {
  const comps = await get(`/betfair/competition-list/${SPORT}`);
  const compArr = Array.isArray(comps.data) ? comps.data : comps.data?.body || [];
  console.log('competitions:', compArr.length);
  const comp = compArr.find((c) =>
    String(c.competition?.name || '').toLowerCase().includes('one day')
  ) || compArr[0];
  console.log('using comp:', comp?.competition?.id, comp?.competition?.name);

  const events = await get(
    `/betfair/event-list/${SPORT}/${comp.competition.id}`
  );
  const evArr = Array.isArray(events.data) ? events.data : events.data?.body || [];
  const event = evArr.find((e) =>
    String(e.event?.name || '').toLowerCase().includes('sri lanka')
  ) || evArr[0];
  const eventId = event?.event?.id;
  console.log('using event:', eventId, event?.event?.name);

  const markets = await get(`/betfair/market-all-list/${eventId}`);
  console.log('\nmarket-all-list sample:');
  console.log(JSON.stringify(markets.data, null, 2).slice(0, 3000));

  const mArr = Array.isArray(markets.data)
    ? markets.data
    : markets.data?.body || markets.data?.data || [];
  const mo = mArr[0];
  if (mo) {
    const mid = mo.marketId || mo.id;
    const odds = await get(`/betfair/market-odds/${eventId}/${mid}`);
    console.log('\nmarket-odds sample:');
    console.log(JSON.stringify(odds.data, null, 2).slice(0, 2500));
    const bulk = await post('/betfair/listMarketBook', {
      marketIds: [String(mid)],
    });
    console.log('\nlistMarketBook sample:');
    console.log(JSON.stringify(bulk.data, null, 2).slice(0, 2500));
  }

  try {
    const fancy = await get(`/betfair/fancy-all-bookmaker-odds-v3/${eventId}`);
    console.log('\nfancy-v3 sample:');
    console.log(JSON.stringify(fancy.data, null, 2).slice(0, 3000));
  } catch (e) {
    console.log('fancy-v3 fail', e.response?.status);
    const fancy2 = await get(`/betfair/fancy-bookmaker-odds/${eventId}`);
    console.log('\nfancy-bookmaker sample:');
    console.log(JSON.stringify(fancy2.data, null, 2).slice(0, 3000));
  }
} catch (e) {
  console.error(e.response?.status, e.response?.data || e.message);
}
