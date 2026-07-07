/**
 * Public user-site base URL (registration, referral links, etc.).
 *
 * Priority:
 *   1. USER_FRONTEND_URL / FRONTEND_URL (explicit)
 *   2. PUBLIC_UPLOADS_BASE_URL (same host as user site in production)
 *   3. Derive from request (ag.* admin host → strip ag. prefix)
 *   4. Local dev fallback → http://localhost:5173
 */

const trimBase = (base) => (base ? String(base).trim().replace(/\/$/, '') : '');

const isLocalHost = (hostname) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

export function getUserFrontendBaseUrl(req) {
  const fromEnv = trimBase(
    process.env.USER_FRONTEND_URL || process.env.FRONTEND_URL
  );
  if (fromEnv) return fromEnv;

  const fromPublic = trimBase(process.env.PUBLIC_UPLOADS_BASE_URL);
  if (fromPublic) return fromPublic;

  return deriveUserFrontendFromRequest(req);
}

function deriveUserFrontendFromRequest(req) {
  if (!req) {
    return trimBase(process.env.FRONTEND_DEV_URL) || 'http://localhost:5173';
  }

  const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http')
    .split(',')[0]
    .trim();
  const rawHost = String(req.headers['x-forwarded-host'] || req.get?.('host') || '')
    .split(',')[0]
    .trim()
    .toLowerCase();

  if (!rawHost) {
    return trimBase(process.env.FRONTEND_DEV_URL) || 'http://localhost:5173';
  }

  const [hostname, port = ''] = rawHost.split(':');

  // Admin panel host → user site on same domain (ag.baajilive.com → baajilive.com)
  if (hostname.startsWith('ag.') || hostname.startsWith('admin.')) {
    const userHost = hostname.replace(/^(ag|admin)\./, '');
    return `${proto}://${userHost}`;
  }

  // Local dev: API on :5000 or admin vite → user frontend on :5173
  if (isLocalHost(hostname)) {
    const devPort = trimBase(process.env.FRONTEND_DEV_PORT) || '5173';
    if (!port || port === '5000' || port === '5174' || port === '5175') {
      return `${proto}://${hostname}:${devPort}`;
    }
    return `${proto}://${hostname}${port ? `:${port}` : ''}`;
  }

  // Already on the user-site host (e.g. baajilive.com)
  if (port && port !== '80' && port !== '443') {
    return `${proto}://${hostname}:${port}`;
  }
  return `${proto}://${hostname}`;
}

/** Build /register?ref=CODE on the public user frontend. */
export function buildUserRegisterReferralLink(agentCode, req) {
  const base = getUserFrontendBaseUrl(req);
  const code = String(agentCode || '').trim().toUpperCase();
  if (!base || !code) return '';
  return `${base}/register?ref=${encodeURIComponent(code)}`;
}
