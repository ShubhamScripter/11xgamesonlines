// Per-user currency helpers.
// A user chooses USDT or BDT at signup. USDT users see a "$" symbol and a
// "$" segment inside their account routes (e.g. /user/$/balance-overview);
// BDT users keep the plain routes and a "BDT" label.

export const SUPPORTED_CURRENCIES = ['BDT', 'USDT'];

export function normalizeCurrency(currency) {
  return String(currency || '').trim().toUpperCase() === 'USDT' ? 'USDT' : 'BDT';
}

export function currencySymbol(currency) {
  return normalizeCurrency(currency) === 'USDT' ? '$' : 'BDT';
}

// Format an amount with the user's currency.
// USDT -> "$1,234.56", BDT -> "BDT 1,234.56"
export function formatMoney(amount, currency) {
  const value = Number(amount || 0).toFixed(2);
  return normalizeCurrency(currency) === 'USDT' ? `$${value}` : `BDT ${value}`;
}

// Read the logged-in user's currency from localStorage (for non-React contexts).
export function getStoredCurrency() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined') return 'BDT';
    return normalizeCurrency(JSON.parse(raw)?.currency);
  } catch {
    return 'BDT';
  }
}

// Router basename for a currency: USDT browses under a global "/$" prefix.
export function basenameForCurrency(currency) {
  return normalizeCurrency(currency) === 'USDT' ? '/$' : '/';
}

// Absolute home URL (incl. the "$" prefix for USDT) used for full-page redirects
// on login/logout so the browser URL and the router basename stay in sync.
export function homeUrlForCurrency(currency) {
  return normalizeCurrency(currency) === 'USDT' ? '/$/' : '/';
}

// --- USDT <-> BDT conversion (rate is admin-configured: 1 USDT = `rate` BDT) ---

export function convertUsdtToBdt(amountUsdt, rate) {
  const r = Number(rate);
  if (!Number.isFinite(r) || r <= 0) return Number(amountUsdt) || 0;
  return (Number(amountUsdt) || 0) * r;
}

export function convertBdtToUsdt(amountBdt, rate) {
  const r = Number(rate);
  if (!Number.isFinite(r) || r <= 0) return Number(amountBdt) || 0;
  return (Number(amountBdt) || 0) / r;
}
