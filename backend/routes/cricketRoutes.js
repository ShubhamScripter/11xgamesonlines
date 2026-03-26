// import express from "express";
// import {
//   fetchCrirketBettingData,
//   getCricketData,
// } from "../controllers/cricketController.js";
// // import { proxyLiveStream } from "../controllers/videoProxy.js";

// const router = express.Router();

// router.get("/cricket/matches", getCricketData);
// router.get("/cricket/betting", fetchCrirketBettingData); // /api/betting?gameid=123
// // router.get("/stream", proxyLiveStream);


// export default router;
import express from "express";
import {
  getCricketInplayData,
  fetchCricketBettingData,
  getCricketData,
  getCricketScoreV2,
} from "../controllers/cricketController.js";

const router = express.Router();

router.get("/cricket/inplay", getCricketInplayData);
router.get("/cricket/matches", getCricketData);
router.get("/cricket/betting", fetchCricketBettingData);
router.get("/check/cricket/score-v2", getCricketScoreV2);

export default router;
