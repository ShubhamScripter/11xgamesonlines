export const SPORTS_MEDIA_TYPE = {
  CRICKET: "cricket",
  TENNIS: "tennis",
  FOOTBALL: "football",
};

const BASE_URL ="https://81club.fun/api/v1";  
//   import.meta.env.VITE_PROVIDER_B_API_URL ||
//   import.meta.env.PROVIDER_B_API_URL ||
//   "https://81habibi.com/api/v1";

/** Resolve beventId from navigation state or match list (soccer/tennis). */
export function resolveBeventId({ locationState, matches, gameid }) {
  const fromState =
    locationState?.match?.beventId ?? locationState?.match?.bevent_id;
  if (fromState != null && String(fromState).trim() !== "") {
    return String(fromState);
  }
  const found = (matches || []).find((m) => String(m?.id) === String(gameid));
  const fromList = found?.beventId ?? found?.bevent_id;
  return fromList != null && String(fromList).trim() !== ""
    ? String(fromList)
    : null;
}

export function getSportsMediaUrls({ sport, gameid, key, beventId }) {
  const useBeventForGmid =
    sport === SPORTS_MEDIA_TYPE.TENNIS ||
    sport === SPORTS_MEDIA_TYPE.FOOTBALL;
  const gmid =
    useBeventForGmid && beventId != null && String(beventId).trim() !== ""
      ? beventId
      : gameid;

  const encodedGameId = encodeURIComponent(gmid ?? "");
  const encodedKey = encodeURIComponent(key ?? "");

  const liveStreamUrl = `${BASE_URL}/live-stream?gmid=${encodedGameId}&key=${encodedKey}`;

  let scorecardUrl = `${BASE_URL}/live-score?key=${encodedKey}&gmid=${encodedGameId}`;
  if (sport === SPORTS_MEDIA_TYPE.TENNIS) {
    scorecardUrl = `${BASE_URL}/live-scorecard?key=${encodedKey}&gmid=${encodedGameId}&sportid=2`;
  } else if (sport === SPORTS_MEDIA_TYPE.FOOTBALL) {
    scorecardUrl = `${BASE_URL}/live-scorecard?key=${encodedKey}&gmid=${encodedGameId}&sportid=1`;
  }

  return {
    liveStreamUrl,
    scorecardUrl,
  };
}
