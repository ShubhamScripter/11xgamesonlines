import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { 
  getBetHistory, 
  getPendingBets, 
  getPendingBetsAmounts, 
  getProfitlossHistory, 
  getTransactionHistoryByUserAndDate, 


 
  placeFancyBet, 
  updateResultOfBets,
  // updateResultOfCasinoBets,
  updateResultOfBetsHistory,
 
  placeBetUnified


  // manualSettleBet,
  // getPTIAndExposure,
  // resetUserBets,
  // getBetDetails
} from "../controllers/betController.js";

const router = express.Router();

// Existing routes

// router.post("/user/place-bet", authMiddleware, placeBet);
// router.post("/user/place-bet-casino",authMiddleware,placeCasinoBet);


router.post('/user/place-bet', authMiddleware, placeBetUnified);
router.get("/user/pending-bet", authMiddleware, getPendingBets);
router.get("/user/pending-bet/amounts", authMiddleware, getPendingBetsAmounts);
router.get("/win-loss/all-bet", updateResultOfBets);
// router.get("/win-loss/all-casino-bet",updateResultOfCasinoBets)

router.get("/win-loss/all-bet-history",updateResultOfBetsHistory)
router.get('/user/bet/history', authMiddleware, getBetHistory);
router.get('/user/profit-loss/history', authMiddleware, getProfitlossHistory);
router.get("/user/transactions-hisrtory", authMiddleware, getTransactionHistoryByUserAndDate);
router.post("/user/place-fancy-bet", authMiddleware, placeFancyBet);

// New testing routes
// router.post("/user/manual-settle-bet", authMiddleware, manualSettleBet);
// router.get("/user/pti-exposure", authMiddleware, getPTIAndExposure);
// router.post("/user/reset-bets", authMiddleware, resetUserBets);
// router.get("/user/bet/:betId", authMiddleware, getBetDetails);

export default router;
