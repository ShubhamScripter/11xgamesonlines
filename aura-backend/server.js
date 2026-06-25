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
import manualDepositRoutes from './routes/manualDepositRoutes.js';
import subRouteRoutes from './routes/admin/subAdminRoutes.js';
import betRoute from './routes/betRoute.js';
import casinoRoutes from './routes/casinoRoutes.js';
import crickeRoute from './routes/cricketRoutes.js';
import horseRacingRoutes from './routes/horseRacingRoutes.js';
import soccerRoutes from './routes/soccerRoutes.js';
import tennisRoutes from './routes/tennisRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cashoutRoute from './routes/cashoutRoute.js';
import { setupWebSocket } from './socket/bettingSocket.js';
import casinoRoutesNew from './routes/casinoRoutesNew.js';

connectDB();

const app = express();
const server = http.createServer(app);

const APP_TYPE = process.env.APP_TYPE || 'dashboard';

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://selfbaaji.ngrok.dev',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://172.30.208.1:5173',
      'https://diamond-admin-tau.vercel.app/',
      'https://diamondbook-client.vercel.app/',
      'https://aura444.org/',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
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
app.use('/api', crickeRoute);
app.use('/api', soccerRoutes);
app.use('/api', tennisRoutes);
app.use('/api', horseRacingRoutes);
app.use('/api', casinoRoutes);
app.use('/api', marketAnalizeRoutes);
app.use('/api', matchSettingsRoutes);
app.use('/api', manualResultRoutes);
app.use('/api', cashoutRoute);
app.use('/api', manualDepositRoutes);
app.use("/api/casino", casinoRoutesNew);
// Static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (APP_TYPE === 'dashboard') {
  app.use(express.static(path.join(__dirname, '../dashboard/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../dashboard/dist/index.html'))
  );
} else {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
  );
}

setupWebSocket(server);

initSportsCacheStore();

// Only run settlement crons on the client backend process.
// In production, TWO PM2 processes (agaura444 + aura444) run the same server.js.
// If both run crons, bets get settled twice → bettingProfitLoss doubles.
if (APP_TYPE !== 'dashboard') {
  cronJobGame1p();
  startCompetitionCatalogCron();
  startEventCatalogCron();
  startMarketCatalogCron();
  startOddsSyncCron();
  startSportsListCacheCron();
} else {
  // dashboard process — settlement/caches crons skipped
}

const isLocal = process.env.NODE_ENV !== 'production';

const PORT = isLocal
  ? process.env.PORT || (APP_TYPE === 'dashboard' ? 8001 : 8000)
  : APP_TYPE === 'dashboard'
    ? process.env.DASHBOARD_PORT
    : process.env.CLIENT_PORT;

server.listen(PORT, () => {
  console.log(
    `${APP_TYPE} server running on port ${PORT} (${isLocal ? 'local' : 'prod'})`
  );
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

