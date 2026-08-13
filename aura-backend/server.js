import './config/loadEnv.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { cronJobGame1p } from './controllers/cronJobs.js';
import { startCompetitionCatalogCron } from './services/betfairCatalog/competitionCatalogCron.js';
import { startEventCatalogCron } from './services/betfairCatalog/eventCatalogCron.js';
import { startMarketCatalogCron } from './services/betfairCatalog/marketCatalogCron.js';
import { startOddsSyncCron } from './services/betfairCatalog/oddsSyncCron.js';
import { initSportsCacheStore } from './services/sportsListCache/cacheStore.js';
import { startSportsListCacheCron } from './services/sportsListCache/sportsListCacheCron.js';
import downlineRoutes from './routes/admin/downlineRoutes.js';
import manualResultRoutes from './routes/admin/manualResultRoutes.js';
import marketAnalizeRoutes from './routes/admin/marketAnalizeRoutes.js';
import matchSettingsRoutes from './routes/admin/matchSettingsRoute.js';
import betApplicationLockRoutes from './routes/admin/betApplicationLockRoute.js';
import manualDepositRoutes from './routes/manualDepositRoutes.js';
import subRouteRoutes from './routes/admin/subAdminRoutes.js';
import betRoute from './routes/betRoute.js';
import luckySpinAdminRoutes from './routes/admin/luckySpinAdminRoutes.js';
import luckySpinRoutes from './routes/luckySpinRoutes.js';
import casinoRoutes from './routes/casinoRoutes.js';
import crickeRoute from './routes/cricketRoutes.js';
import horseRacingRoutes from './routes/horseRacingRoutes.js';
import soccerRoutes from './routes/soccerRoutes.js';
import tennisRoutes from './routes/tennisRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cashoutRoute from './routes/cashoutRoute.js';
import { setupWebSocket } from './socket/bettingSocket.js';
import casinoRoutesNew from './routes/casinoRoutesNew.js';
import tvRoutes from './routes/tvRoutes.js';
import skyhighWalletRoutes from './routes/skyhighWalletRoutes.js';
import skyhighLaunchRoutes from './routes/skyhighLaunchRoutes.js';
import { startGetAllTvCron } from './services/tvApi/getAllTvCron.js';
import { bootLog } from './config/silenceConsole.js';

connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
// Extra allowed origins can be added via CORS_ORIGINS (comma-separated) in .env.
// Note: the user + admin sites are served by THIS same backend (same origin),
// so CORS is only relevant for tools/other origins like ngrok / Vite --host LAN.
const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const staticOrigins = new Set([
  'http://localhost:5173',
  'https://selfbaaji.ngrok.dev',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://172.30.208.1:5173',
  'https://diamond-admin-tau.vercel.app/',
  'https://diamondbook-client.vercel.app/',
  'https://aura444.org/',
  ...envOrigins,
]);

/** Allow Vite --host LAN origins (192.168.x / 10.x / 172.16-31.x) in local/dev. */
function isLocalDevOrigin(origin) {
  if (!origin) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || staticOrigins.has(origin) || isLocalDevOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-device-id',
      'X-Operator-Id',
      'X-Timestamp',
      'X-Signature',
    ],
  })
);

// SkyHigh wallet callbacks need raw body for HMAC verification
app.use(
  '/wallet',
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  }),
  skyhighWalletRoutes
);

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', true);

// Additional settlement tracking middleware
app.use((req, res, next) => {
  const url = req.url;
  const method = req.method;

  next();
});

// Routes
app.use('/api', subRouteRoutes);
app.use('/api', downlineRoutes);
app.use('/api', userRoutes);
app.use('/api', betRoute);
app.use('/api/admin', luckySpinAdminRoutes);
app.use('/api', luckySpinRoutes);
app.use('/api', crickeRoute);
app.use('/api', soccerRoutes);
app.use('/api', tennisRoutes);
app.use('/api', horseRacingRoutes);
app.use('/api', casinoRoutes);
app.use('/api', marketAnalizeRoutes);
app.use('/api', matchSettingsRoutes);
app.use('/api', betApplicationLockRoutes);
app.use('/api', manualResultRoutes);
app.use('/api', cashoutRoute);
app.use('/api', manualDepositRoutes);
app.use("/api/casino", casinoRoutesNew);
app.use('/api', skyhighLaunchRoutes);
app.use('/api', tvRoutes);
// Static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Single backend serves BOTH sites based on the request hostname:
//   ag.<domain>      → admin panel   (admin/dist)
//   everything else  → user frontend (frontend/dist)
// The /api routes above are registered first, so they work on either hostname.
const frontendDist = path.join(__dirname, '../frontend/dist');
const adminDist = path.join(__dirname, '../admin/dist');

const isAdminHost = (req) => {
  const hostHeader = (req.hostname || req.headers.host || '').toLowerCase();
  return hostHeader.startsWith('ag.') || hostHeader.startsWith('admin.');
};

app.use((req, res, next) =>
  express.static(isAdminHost(req) ? adminDist : frontendDist)(req, res, next)
);

app.get('*', (req, res) =>
  res.sendFile(
    path.join(isAdminHost(req) ? adminDist : frontendDist, 'index.html')
  )
);

setupWebSocket(server);

initSportsCacheStore();

// Single backend process → run all settlement/catalog crons here exactly once.
// (With one process there is no risk of double-settlement.)
cronJobGame1p();
startCompetitionCatalogCron();
startEventCatalogCron();
startMarketCatalogCron();
startOddsSyncCron();
startSportsListCacheCron();
startGetAllTvCron();

const isLocal = process.env.NODE_ENV !== 'production';

// One port for the whole app (both user + admin are served from here).
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  bootLog(`server running on port ${PORT} (${isLocal ? 'local' : 'prod'})`);
});

server.on('error', (err) => {
  bootLog(`Server failed to start on port ${PORT}:`, err.message);
  process.exit(1);
});


// import express from "express";
// import http from "http";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";
// import cookieParser from "cookie-parser";
// import bodyParser from "body-parser";
// import { fileURLToPath } from "url";
// import morgan from 'morgan'
// // import { updateAdmin } from "./controllers/admin/adminController.js";
// // import { updateAdmin } from "./controllers/cronJobs.js";
// import connectDB from "./config/db.js";
// import userRoutes from "./routes/userRoutes.js";
// import subRouteRoutes from "./routes/admin/subAdminRoutes.js";
// import downlineRoutes from "./routes/admin/downlineRoutes.js";
// import marketAnalizeRoutes from "./routes/admin/marketAnalizeRoutes.js";
// import crickeRoute from "./routes/cricketRoutes.js";
// import soccerRoutes from "./routes/soccerRoutes.js";
// import tennisRoutes from "./routes/tennisRoutes.js";
// import casinoRoutes from './routes/casinoRoutes.js'
// import betRoute from "./routes/betRoute.js";
// import matchOverrideRoutes from './routes/matchOverrideRoutes.js';

// import casinoRoutesNew from './routes/casinoRoutesNew.js'

// import streamingRoutes from "./routes/streamingRoutes.js";

// //For dev mode only
// import devRoutes from './routes/devRoutes.js'

// import { cronJobGame1p } from "./controllers/cronJobs.js";
// import { setupWebSocket } from "./socket/bettingSocket.js"; // ✅ New file for WebSocket

// dotenv.config();
// connectDB();
// cronJobGame1p();

// // updateAdmin()

// const app = express();
// const server = http.createServer(app);

// // Middleware
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "http://localhost:5174","http://localhost:5175","https://baajilive.com/","https://decision-least-hour-metres.trycloudflare.com/"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cookieParser());
// app.set("trust proxy", true);
// app.use(morgan('dev'))

// // Routes
// app.use("/api/stream", streamingRoutes);
// app.use("/api/casino", casinoRoutesNew);
// app.use("/api", subRouteRoutes);
// app.use("/api", downlineRoutes);
// app.use("/api", userRoutes);
// app.use("/api", betRoute);
// app.use("/api", crickeRoute);
// app.use("/api", soccerRoutes);
// app.use("/api", tennisRoutes);
// app.use("/api",casinoRoutes);
// app.use("/api",matchOverrideRoutes);

// app.use("/api", marketAnalizeRoutes); // Ensure this import is defined
// if (process.env.DEV_TEST_GAMES_ENABLED === "1") {
//   app.use("/api/dev", devRoutes);
// }

// // Static file serving
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use(express.static(path.join(__dirname, "../frontend/dist")));
// app.get("*", (req, res) =>
//   res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
// );
// // app.use(express.static(path.join(__dirname, "../client/dist")));
// // app.get("*", (req, res) =>
// //   res.sendFile(path.join(__dirname, "../client/dist/index.html"))
// // );

// //  Setup WebSocket
// setupWebSocket(server); // 🧠 Pass server to WebSocket file

// const PORT = process.env.PORT || 8000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

