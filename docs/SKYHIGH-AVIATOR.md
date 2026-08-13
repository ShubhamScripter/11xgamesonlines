# SkyHigh Aviator on BaajiLive

BaajiLive is wired as a SkyHigh **operator**: Popular / Exclusive **Aviator** tiles launch SkyHigh (not BulkAPI Spribe).

## What was added

| Piece | Path |
|-------|------|
| Wallet callbacks | `POST /wallet/{authenticate,balance,bet,win,rollback}` |
| Launch (logged-in) | `POST /api/skyhigh/launch` |
| Frontend service | `frontend/src/services/skyhighService.js` |
| Home tiles | Popular + Exclusive Aviator → SkyHigh |

Balance uses BaajiLive `avbalance` (+ `balance` / `baseBalance`). `playerId` = Mongo `_id`.

## Setup (local)

### 1. SkyHigh running

```bash
# skyhigh-crash repo
npm run dev
# API :3001  game :3000  admin :3002
```

### 2. Seed BaajiLive operator + write keys

```bash
cd skyhigh-crash---provably-fair-aviator/server
npx ts-node --project tsconfig.json scripts/seed-baajilive-operator.ts
```

Creates/updates operator `baajilive` with:

- Callback: `http://localhost:5000/wallet`
- Currencies: `BDT,USDT`
- Game URL: `http://localhost:3000`

Writes into `baajilive/aura-backend/.env`:

```env
SKYHIGH_API_URL=http://localhost:3001
SKYHIGH_API_KEY=op_…
SKYHIGH_SECRET_KEY=…
```

### 3. Restart BaajiLive backend

```bash
cd baajilive/aura-backend
npm run dev
```

### 4. Play

1. Login on BaajiLive (`http://localhost:5173`)
2. Home → Popular / Exclusive → **Aviator**
3. Full-page redirect → SkyHigh game with your `avbalance`

## Production

1. SkyHigh Admin → Operators → create/edit `baajilive`
2. **Callback URL** = `https://baajilive.com/wallet` (public HTTPS to this backend)
3. **Currencies** = `BDT,USDT`
4. **Game URL** = branded domain or leave default
5. Set on BaajiLive server:

```env
SKYHIGH_API_URL=https://api.your-skyhigh.com
SKYHIGH_API_KEY=op_…
SKYHIGH_SECRET_KEY=…
```

Full provider contract: SkyHigh repo `docs/OPERATOR-INTEGRATION.md`.
