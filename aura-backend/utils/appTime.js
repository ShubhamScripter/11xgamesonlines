/** Application timezone: GMT+6 (Bangladesh). */
export const APP_TIMEZONE = 'Asia/Dhaka';

const baseOptions = (overrides = {}) => ({
  timeZone: APP_TIMEZONE,
  ...overrides,
});

export function formatAppDateTime(value, fallback = '-') {
  if (value == null || value === '') return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;

  return new Intl.DateTimeFormat(
    'en-GB',
    baseOptions({
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  ).format(d);
}

/** Login history / activity log (24h, no comma). */
export function formatLoginDateTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat(
    'en-GB',
    baseOptions({
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  )
    .format(d)
    .replace(',', '');
}

export function formatAppDate(value, fallback = '-') {
  if (value == null || value === '') return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;

  return new Intl.DateTimeFormat(
    'en-GB',
    baseOptions({
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  ).format(d);
}
