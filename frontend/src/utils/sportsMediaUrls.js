export const SPORTS_MEDIA_TYPE = {
  CRICKET: "cricket",
  TENNIS: "tennis",
  FOOTBALL: "football",
};

const BASE_URL =
  import.meta.env.VITE_PROVIDER_D_API_URL || "https://winkaro.online/api/v1";

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

/**
 * betfair-tv endpoint returns an array of events:
 * [{ eventId, eventName, sportName, tv, ... }]
 * Returns tv URL for current eventId, if available.
 */
export async function getBetfairTvLinkByEventId({ gameid, key }) {
  if (!gameid || !key) return null;
  try {
    const encodedKey = encodeURIComponent(key);
    const response = await fetch(`${BASE_URL}/betfair-tv?key=${encodedKey}`);
    if (!response.ok) return null;

    const payload = await response.json();
    if (!Array.isArray(payload)) return null;

    const row = payload.find(
      (item) => String(item?.eventId) === String(gameid)
    );
    const tv = row?.tv;
    return tv && String(tv).trim() !== "" ? String(tv) : null;
  } catch {
    return null;
  }
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

  const scorecardUrl = `${BASE_URL}/betfair-score?key=${encodedKey}&gmid=${encodedGameId}`;

  return {
    liveStreamUrl,
    scorecardUrl,
  };
}
