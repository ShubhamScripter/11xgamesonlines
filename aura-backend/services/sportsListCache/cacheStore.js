import Redis from 'ioredis';

const REDIS_KEY_PREFIX = 'sports:list:v1:';
const memory = new Map();

let redis = null;
let redisReady = false;
let redisDisabled = false;

/** Upstash / Redis Cloud often need TLS — auto-fix common Upstash URL mistake. */
function normalizeRedisUrl(raw) {
  let url = (raw || '').trim();
  if (!url) return '';

  if (url.includes('upstash.io') && url.startsWith('redis://')) {
    url = url.replace('redis://', 'rediss://');
    console.log(
      '[SportsCache] Upstash detected — using rediss:// (TLS). Use rediss:// in REDIS_URL.'
    );
  }

  return url;
}

function disableRedis(reason) {
  if (redisDisabled) return;
  redisDisabled = true;
  redisReady = false;
  console.warn(
    `[SportsCache] Redis disabled — in-memory cache only. Reason: ${reason}`
  );
  try {
    redis?.disconnect();
  } catch {
    // ignore
  }
  redis = null;
}

export function isRedisConnected() {
  return redisReady && !redisDisabled;
}

export function initSportsCacheStore() {
  const url = normalizeRedisUrl(process.env.REDIS_URL);

  if (!url) {
    console.log(
      '[SportsCache] REDIS_URL not set — using in-memory cache (fine for single server / dev)'
    );
    return;
  }

  const useTls = url.startsWith('rediss://');

  redis = new Redis(url, {
    // null = don't throw "max retries per request" (cache can fall back to memory)
    maxRetriesPerRequest: null,
    connectTimeout: 15000,
    commandTimeout: 10000,
    lazyConnect: true,
    enableReadyCheck: true,
    family: 4,
    retryStrategy(times) {
      if (times > 8) {
        disableRedis('too many reconnect attempts');
        return null;
      }
      return Math.min(times * 400, 4000);
    },
    ...(useTls ? { tls: { rejectUnauthorized: true } } : {}),
  });

  redis.on('ready', () => {
    redisReady = true;
    redisDisabled = false;
    console.log('[SportsCache] Redis ready');
  });

  redis.on('error', (err) => {
    redisReady = false;
    const msg = err?.message || String(err);
    if (
      msg.includes('max retries per request') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('certificate')
    ) {
      disableRedis(msg);
      return;
    }
    console.warn('[SportsCache] Redis error:', msg);
  });

  redis.on('end', () => {
    redisReady = false;
  });

  redis.connect().catch((err) => {
    disableRedis(err.message || 'connect failed');
  });
}

export async function cacheSet(key, payload, ttlSeconds = 120) {
  const entry = { payload, updatedAt: Date.now() };
  memory.set(key, entry);

  if (!isRedisConnected() || !redis) return;

  try {
    const status = redis.status;
    if (status !== 'ready' && status !== 'connect') return;

    await redis.setex(
      REDIS_KEY_PREFIX + key,
      ttlSeconds,
      JSON.stringify(entry)
    );
  } catch (err) {
    const msg = err?.message || String(err);
    if (msg.includes('max retries')) {
      disableRedis(msg);
    } else {
      console.warn('[SportsCache] Redis set failed:', msg);
    }
  }
}

export async function cacheDelete(key) {
  memory.delete(key);

  if (!isRedisConnected() || !redis) return;

  try {
    await redis.del(REDIS_KEY_PREFIX + key);
  } catch (err) {
    const msg = err?.message || String(err);
    if (msg.includes('max retries')) {
      disableRedis(msg);
    } else {
      console.warn('[SportsCache] Redis del failed:', msg);
    }
  }
}

export async function cacheGet(key) {
  if (isRedisConnected() && redis) {
    try {
      const raw = await redis.get(REDIS_KEY_PREFIX + key);
      if (raw) {
        const entry = JSON.parse(raw);
        memory.set(key, entry);
        return entry;
      }
    } catch (err) {
      const msg = err?.message || String(err);
      if (msg.includes('max retries')) {
        disableRedis(msg);
      } else {
        console.warn('[SportsCache] Redis get failed:', msg);
      }
    }
  }

  return memory.get(key) || null;
}

/** Prevent duplicate cron runs across PM2 instances (when Redis is available). */
export async function tryAcquireCronLock(ttlSeconds = 28) {
  if (!isRedisConnected() || !redis) return true;

  try {
    const token = `${process.pid}-${Date.now()}`;
    const result = await redis.set(
      `${REDIS_KEY_PREFIX}cron:lock`,
      token,
      'EX',
      ttlSeconds,
      'NX'
    );
    return result === 'OK';
  } catch {
    return true;
  }
}
