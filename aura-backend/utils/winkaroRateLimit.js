/**
 * Shared spacing between Winkaro HTTP calls to stay under 600 req/min quota.
 */
const MIN_GAP_MS = Number(process.env.WINKARO_MIN_GAP_MS) || 200;
let nextSlotAt = 0;
let chain = Promise.resolve();

export function awaitWinkaroSlot() {
  chain = chain.then(async () => {
    const now = Date.now();
    const wait = Math.max(0, nextSlotAt - now);
    if (wait > 0) {
      await new Promise((r) => setTimeout(r, wait));
    }
    nextSlotAt = Date.now() + MIN_GAP_MS;
  });
  return chain;
}

/** After 429, pause all Winkaro calls until retry-after elapses. */
export function pauseWinkaroAfter429(retryAfterSec = 16) {
  const sec = Number(retryAfterSec);
  const pauseMs = (Number.isFinite(sec) && sec > 0 ? sec : 16) * 1000;
  nextSlotAt = Math.max(nextSlotAt, Date.now() + pauseMs);
}
