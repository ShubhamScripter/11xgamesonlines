/**
 * Cricket provider uses `section.gstatus` (e.g. ACTIVE, SUSPENDED, "Starting Soon.").
 * Empty string usually means the row is fine to price; non-empty values other than ACTIVE
 * should be shown and the selection treated as non-bettable.
 */

export function normalizeGstatus(gstatus) {
  if (gstatus == null) return '';
  const s = String(gstatus).trim();
  if (s === '' || s === '0') return '';
  return s;
}

export function isMarketOpenForBet(marketStatus) {
  if (marketStatus == null || String(marketStatus).trim() === "") return true;
  return String(marketStatus).trim().toUpperCase() === "OPEN";
}

const PLAYABLE_GSTATUS = new Set(["ACTIVE", "OPEN"]);

export function isGstatusBlockingSelection(gstatus) {
  const s = normalizeGstatus(gstatus);
  if (!s) return false;
  return !PLAYABLE_GSTATUS.has(s.toUpperCase());
}

export function isSelectionBetBlocked(section, marketStatus) {
  if (!isMarketOpenForBet(marketStatus)) return true;
  return isGstatusBlockingSelection(section?.gstatus);
}

export function blockingStatusLabel(section, marketStatus) {
  if (!isMarketOpenForBet(marketStatus)) {
    return String(marketStatus ?? '').trim() || 'CLOSED';
  }
  if (isGstatusBlockingSelection(section?.gstatus)) {
    return normalizeGstatus(section?.gstatus);
  }
  return '';
}
