import crypto from 'crypto';

/**
 * Verify SkyHigh seamless-wallet HMAC.
 * Signature = HMAC_SHA256(secret, `${X-Timestamp}.${rawBody}`)
 */
export function verifySkyhighSignature(req) {
  const secret = process.env.SKYHIGH_SECRET_KEY || '';
  if (!secret) return false;

  const timestamp = parseInt(req.headers['x-timestamp'] || '0', 10);
  const signature = String(req.headers['x-signature'] || '');
  const raw = req.rawBody || '';

  if (!Number.isFinite(timestamp) || !signature) return false;
  if (Math.abs(Date.now() - timestamp) > 60_000) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${raw}`)
    .digest('hex');

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function requireSkyhighSignature(req, res, next) {
  if (!verifySkyhighSignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  return next();
}
