/** Application timezone: GMT+6 (Asia/Dhaka). */
export const APP_TIMEZONE = 'Asia/Dhaka';

const tzOptions = (overrides = {}) => ({
  timeZone: APP_TIMEZONE,
  ...overrides,
});

export function formatAppDateTime(value, fallback = '-') {
  if (value == null || value === '') return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;

  return new Intl.DateTimeFormat(
    'en-GB',
    tzOptions({
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

export function formatAppDateTime24(value, fallback = '-') {
  if (value == null || value === '') return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;

  return new Intl.DateTimeFormat(
    'en-GB',
    tzOptions({
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

/** YYYY-MM-DD in GMT+6 (for API query params). */
export function formatAppDateISO(value, fallback = '') {
  if (value == null || value === '') return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-CA', tzOptions()).format(d);
}

export function formatAppDate(value, fallback = '-') {
  if (value == null || value === '') return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;

  return new Intl.DateTimeFormat(
    'en-GB',
    tzOptions({
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  ).format(d);
}

/** @deprecated use formatAppDateTime */
export const formatIST = formatAppDateTime;
