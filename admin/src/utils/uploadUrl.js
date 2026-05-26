/** Same as user app — use API full URLs when present. */
export function resolveUploadUrl(value) {
  let src = String(value ?? '').trim();
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const fallbackBase =
    import.meta.env.VITE_UPLOADS_BASE_URL ||
    import.meta.env.VITE_ADMIN_UPLOADS_BASE_URL ||
    apiBase.replace(/\/api\/?$/i, '');

  const path = src.startsWith('/') ? src : `/${src}`;
  return `${String(fallbackBase).replace(/\/$/, '')}${path}`;
}
