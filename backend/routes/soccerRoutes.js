// routes/soccerRoutes.js
import express from "express";
import {
  getSoccerInplayData,
  fetchsoccerBettingData,
  fetchSoccerData,
  getfootballScoreV2,
} from "../controllers/soccerController.js";

const router = express.Router();
router.get("/soccer/inplay", getSoccerInplayData);
router.get("/soccer", fetchSoccerData);
router.get("/soccer/betting", fetchsoccerBettingData); // /api/betting?gameid=123
router.get("/check/soccer/score-v2", getfootballScoreV2);
export default router;
