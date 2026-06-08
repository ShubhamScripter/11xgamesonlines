/** Wallet currency for display in admin tables (USDT | BDT). */
export function displayUserCurrency(currency) {
  return String(currency || 'BDT').toUpperCase();
}
