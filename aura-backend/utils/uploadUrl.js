/**
 * Upload paths are stored in DB as `/uploads/...` only.
 * Clients may run on different hosts than the server that saved the file.
 *
 * PUBLIC_UPLOADS_BASE_URL  — this API instance (user payment screenshots, etc.)
 * ADMIN_UPLOADS_BASE_URL   — server where admin uploads account QR/images
 *                            (defaults to PUBLIC_UPLOADS_BASE_URL if unset)
 */

const isCloudinaryUrl = (url) =>
  /res\.cloudinary\.com/i.test(url) || /cloudinary\.com/i.test(url);

/** Store Cloudinary URLs as-is; keep local uploads as `/uploads/...` paths only. */
export const toUploadPathOnly = (value) => {
  if (value == null || value === '') return value;
  const s = String(value).trim();
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) {
    if (isCloudinaryUrl(s)) return s;
    try {
      const u = new URL(s);
      const p = u.pathname || '';
      return p.startsWith('/') ? p : `/${p}`;
    } catch {
      return s;
    }
  }
  return s.startsWith('/') ? s : `/${s}`;
};

const trimBase = (base) => (base ? String(base).trim().replace(/\/$/, '') : '');

export const getPublicUploadsBase = (req) => {
  const fromEnv = trimBase(process.env.PUBLIC_UPLOADS_BASE_URL);
  if (fromEnv) return fromEnv;
  return deriveBaseFromRequest(req);
};

/** Base URL for admin-created deposit account images (often a different host). */
export const getAdminUploadsBase = (req) => {
  const fromEnv = trimBase(process.env.ADMIN_UPLOADS_BASE_URL);
  if (fromEnv) return fromEnv;
  return getPublicUploadsBase(req);
};

const deriveBaseFromRequest = (req) => {
  if (!req) return '';
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get?.('host');
  if (!host) return '';
  return `${proto}://${host}`.replace(/\/$/, '');
};

export const resolvePublicUploadUrl = (value, baseOrReq) => {
  if (value == null || value === '') return value;
  const raw = String(value).trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (isCloudinaryUrl(raw)) return raw.startsWith('http') ? raw : `https://${raw}`;

  const pathOnly = toUploadPathOnly(value);
  if (!pathOnly) return pathOnly;

  const base =
    typeof baseOrReq === 'string'
      ? trimBase(baseOrReq)
      : getPublicUploadsBase(baseOrReq);

  if (!base) return pathOnly;
  return `${base}${pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`}`;
};

export const resolveAdminUploadUrl = (value, req) =>
  resolvePublicUploadUrl(value, getAdminUploadsBase(req));
