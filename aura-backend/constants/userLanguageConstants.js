export const USER_LANGUAGES = ['en', 'bn', 'hn'];

export const DEFAULT_USER_LANGUAGE = 'en';

export function normalizeUserLanguage(value) {
  const lang = String(value || '').trim().toLowerCase();
  return USER_LANGUAGES.includes(lang) ? lang : DEFAULT_USER_LANGUAGE;
}
