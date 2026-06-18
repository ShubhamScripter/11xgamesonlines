import dotenv from 'dotenv';

import { createProviderA } from './providerA.js';
import { createProviderB } from './providerB.js';
import { createProviderC } from './providerC.js';
import { createProviderD } from './providerD.js';

dotenv.config();

const PROVIDER = (process.env.API_PROVIDER || 'providerA').toLowerCase();

let activeProvider;

switch (PROVIDER) {
  case 'providerd':
  case 'provider_d':
    activeProvider = createProviderD();
    break;
  case 'providerc':
  case 'provider_c':
    activeProvider = createProviderC();
    break;
  case 'providerb':
  case 'provider_b':
    activeProvider = createProviderB();
    break;
  case 'providera':
  case 'provider_a':
  default:
    activeProvider = createProviderA();
    break;
}

console.log(`[API PROVIDER] Active provider: ${PROVIDER}`);

export const fetchCompetitionList = (sportId) => {
  if (!activeProvider.fetchCompetitionList) {
    return Promise.reject(
      new Error(`fetchCompetitionList not supported by ${PROVIDER}`)
    );
  }
  return activeProvider.fetchCompetitionList(sportId);
};

export const fetchEventList = (sportId, competitionId) => {
  if (!activeProvider.fetchEventList) {
    return Promise.reject(
      new Error(`fetchEventList not supported by ${PROVIDER}`)
    );
  }
  return activeProvider.fetchEventList(sportId, competitionId);
};

export const fetchMarketList = (eventId) => {
  if (!activeProvider.fetchMarketList) {
    return Promise.reject(
      new Error(`fetchMarketList not supported by ${PROVIDER}`)
    );
  }
  return activeProvider.fetchMarketList(eventId);
};

export const fetchMarketOdds = (eventId, marketId) => {
  if (!activeProvider.fetchMarketOdds) {
    return Promise.reject(
      new Error(`fetchMarketOdds not supported by ${PROVIDER}`)
    );
  }
  return activeProvider.fetchMarketOdds(eventId, marketId);
};

export const fetchMarketBookBulk = (marketIds) => {
  if (!activeProvider.fetchMarketBookBulk) {
    return Promise.reject(
      new Error(`fetchMarketBookBulk not supported by ${PROVIDER}`)
    );
  }
  return activeProvider.fetchMarketBookBulk(marketIds);
};

export const fetchFancyBookmakerOdds = (eventId) => {
  if (!activeProvider.fetchFancyBookmakerOdds) {
    return Promise.reject(
      new Error(`fetchFancyBookmakerOdds not supported by ${PROVIDER}`)
    );
  }
  return activeProvider.fetchFancyBookmakerOdds(eventId);
};

export const fetchFancyAllBookmakerOddsV3 = (eventId) => {
  if (!activeProvider.fetchFancyAllBookmakerOddsV3) {
    return Promise.reject(
      new Error(`fetchFancyAllBookmakerOddsV3 not supported by ${PROVIDER}`)
    );
  }
  return activeProvider.fetchFancyAllBookmakerOddsV3(eventId);
};

export const fetchMatchList = (sportId) =>
  activeProvider.fetchMatchList(sportId);
export const fetchMatchData = (gameId, sportId) =>
  activeProvider.fetchMatchData(gameId, sportId);

export const fetchFancyMarketsForEvent = (gameId, sportId) => {
  if (activeProvider.fetchFancyMarketsForEvent) {
    return activeProvider.fetchFancyMarketsForEvent(gameId, sportId);
  }
  return activeProvider.fetchMatchData(gameId, sportId);
};

export const getResult = (payload) => activeProvider.getResult(payload);
export const sendBetIncoming = (payload) =>
  activeProvider.sendBetIncoming(payload);

export const fetchCasinoTables = () => activeProvider.fetchCasinoTables();
export const fetchCasinoData = (gameId) =>
  activeProvider.fetchCasinoData(gameId);
export const fetchCasinoResult = (gameId) =>
  activeProvider.fetchCasinoResult(gameId);
export const fetchCasinoDetailResult = (gameId, mid) =>
  activeProvider.fetchCasinoDetailResult(gameId, mid);

export const fetchCricketFancyResult = (eventId, fancyId) =>
  activeProvider.fetchCricketFancyResult(eventId, fancyId);
export const fetchCricketFancyByEvent = (eventId) =>
  activeProvider.fetchCricketFancyByEvent(eventId);
export const fetchStFancyByEvent = (eventId) =>
  activeProvider.fetchStFancyByEvent(eventId);

export const fetchScore = (gmid, sid) => activeProvider.fetchScore(gmid, sid);
export const fetchAllIframes = (gmid) => activeProvider.fetchAllIframes(gmid);

export const getProviderName = () => PROVIDER;

export default activeProvider;