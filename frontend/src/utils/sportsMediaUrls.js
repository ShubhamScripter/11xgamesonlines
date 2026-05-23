export const SPORTS_MEDIA_TYPE = {
  CRICKET: "cricket",
  TENNIS: "tennis",
  FOOTBALL: "football",
};

const BASE_URL =
  import.meta.env.VITE_PROVIDER_B_API_URL ||
  import.meta.env.PROVIDER_B_API_URL ||
  "https://81habibi.com/api/v1";

export function getSportsMediaUrls({ sport, gameid, key }) {
  const encodedGameId = encodeURIComponent(gameid ?? "");
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
