// routes/tennisRoutes.js
import express from "express";
import {getTennisInplayData, fetchTannisBettingData, fetchTennisData,gettennisScoreV2 } from "../controllers/tennisController.js";

const router = express.Router();
router.get("/tennis/inplay", getTennisInplayData);
router.get("/tennis", fetchTennisData); // GET /api/tennis
router.get("/tannis/betting", fetchTannisBettingData); // /api/betting?gameid=123
router.get("/check/tennis/score-v2", gettennisScoreV2);

export default router;
