# Sports list cache (Cricket / Soccer / Tennis)

Background cron har **15 sec** (default) par teeno sports ke liye provider se data fetch karke cache karta hai. User API calls seedha cache se respond hoti hain (~200ms).

## `.env` variables

```env
# Cron (optional — defaults shown)
SPORTS_CACHE_CRON_ENABLED=true
SPORTS_CACHE_CRON_SEC=15
SPORTS_CACHE_TTL_SEC=120

# Odds repair — Redis mein matches hain par odds khali hon to dubara fetch
SPORTS_CACHE_REPAIR_ENABLED=true
SPORTS_CACHE_REPAIR_SEC=20

# Redis (optional — agar na ho to in-memory cache use hoga)
REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_HOST:6379
```

## Redis credentials kahan se lein?

### Option 1: **Upstash** (recommended — free tier, no server manage)
1. https://upstash.com par sign up
2. **Create Database** → region choose karo (Singapore / Mumbai closest)
3. Dashboard → **Redis** → apni DB → **Connect**
4. **Redis URL** copy karo — format:
   ```
   rediss://default:xxxxx@xxxxx.upstash.io:6379
   ```
5. `.env` mein paste (**Upstash par `rediss://` use karo, `redis://` nahi**):
   ```env
   REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379
   ```

### Option 2: **Redis Cloud** (redis.com)
1. https://redis.io/cloud par free account
2. **New subscription** → free 30MB plan
3. **Create database** → **Public endpoint** + password
4. Connection string:
   ```env
   REDIS_URL=redis://default:PASSWORD@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
   ```

### Option 3: **Local Redis** (dev / VPS par khud install)
- **Docker:**
  ```bash
  docker run -d --name redis -p 6379:6379 redis:7-alpine
  ```
  ```env
  REDIS_URL=redis://127.0.0.1:6379
  ```
- **Windows:** [Memurai](https://www.memurai.com/) ya WSL2 + Redis

### Option 4: **Bina Redis ke** (sirf memory)
`REDIS_URL` mat set karo — cache process ke andar memory mein rahega.  
Single server / dev ke liye theek hai. PM2 multiple instances par har process ka alag cache hoga.

## Kya cache hota hai?

| Key | Cron refresh |
|-----|----------------|
| `cricket:list` | ✅ |
| `cricket:odds:eligible` | ✅ |
| `cricket:odds:all` | ✅ (cricket page ke liye) |
| `soccer:list` | ✅ |
| `soccer:odds:eligible` | ✅ |
| `soccer:odds:all` | ✅ |
| `tennis:list` | ✅ |
| `tennis:odds:eligible` | ✅ |
| `tennis:odds:all` | ✅ |

**Odds repair cron** (har 20s): agar Redis mein matches hain lekin odds khali / incomplete hain, key delete karke provider se dubara fetch karta hai. Incomplete odds cache API par serve nahi hoti.

## PM2 / production

- Cron sirf **client** process par chalega (`APP_TYPE !== dashboard`).
- Redis set ho to **cron lock** se duplicate PM2 instances par double refresh kam hota hai.
- Production par **Upstash / Redis Cloud** use karo taaki sab PM2 workers same cache share karein.

## Logs

```
[SportsCache] Redis connected
[SportsCache] Cron every 15s — list + odds (eligible + all) for cricket / soccer / tennis
[SportsCache] Odds repair cron every 20s — refreshes Redis when odds missing
[SportsCache] repair soccer:odds:all — incomplete odds 0/120 (featured 0/8)
[SportsCache] refreshed cricket:list (42 matches, 8500ms)
[SportsCache] batch done in 45000ms
```

Pehli baar server start par cache warm hone mein 1–2 min lag sakta hai; uske baad user requests fast hongi.
