/** Application timezone: GMT+6 (Asia/Dhaka). */
export const APP_TIMEZONE = 'Asia/Dhaka';

const tzOptions = (overrides = {}) => ({
  timeZone: APP_TIMEZONE,
  ...overrides,
});

/** Date + time (12h). Alias kept for existing imports. */
export function formatIST(value, fallback = '-') {
  return formatAppDateTime(value, fallback);
}

export function formatAppDateTime(value, fallback = '-') {
  if (value == null || value === '') return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;

  return new Intl.DateTimeFormat(
    'en-IN',
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

export function formatActivityLogTime(log) {
  if (!log) return '-';
  if (log.createdAt) return formatAppDateTime24(log.createdAt);
  return log.dateTime || log.loginDateTime || '-';
}
