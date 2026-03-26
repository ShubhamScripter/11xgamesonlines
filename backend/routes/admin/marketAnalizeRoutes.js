import express from "express";

import { adminAuthMiddleware } from "../../middleware/authMiddleware.js";
import { getDownlinePendingBetsByGame, getMasterBook, getMasterBookDownline, getPendingMarketAmounts, parentsDetails } from "../../controllers/admin/marketAnalyze.js";

const router = express.Router();

router.get("/market-analyze", adminAuthMiddleware, getDownlinePendingBetsByGame);
router.get("/market/pending-amount", adminAuthMiddleware, getPendingMarketAmounts);
router.get("/get/market-bet-perents/:id", adminAuthMiddleware, parentsDetails);
router.get("/get/master-book", adminAuthMiddleware, getMasterBook);
router.get("/get/master-book-downline", adminAuthMiddleware, getMasterBookDownline);

export default router;