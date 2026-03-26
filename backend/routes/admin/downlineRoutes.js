// import express from "express";

// import { getBetHistory, getGraphBackupData, getGraphLiveData, getMyReportByDownline, getMyReportByEvents } from "../../controllers/admin/downlineController.js";

// import { adminAuthMiddleware } from "../../middleware/authMiddleware.js";

// const router = express.Router();


// router.get("/get/my-reports/by-events", adminAuthMiddleware, getMyReportByEvents);
// router.get("/get/my-reports/by-downline", adminAuthMiddleware, getMyReportByDownline);
// router.get("/get/user/bet-history", adminAuthMiddleware, getBetHistory);
// router.get("/get/graph-backup", adminAuthMiddleware, getGraphBackupData);
// router.get("/get/graph-live", adminAuthMiddleware, getGraphLiveData);

// export default router;

import express from "express";

import { getBetHistory, getGraphBackupData, getGraphLiveData, getprofitlossofdownlineofreportlist, getMyReportByEvents, getprofitlossofdownlineofreportlistUserData } from "../../controllers/admin/downlineController.js";

import { adminAuthMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();


router.get("/get/my-reports/by-events", adminAuthMiddleware, getMyReportByEvents);
router.get("/get/profit-loss-by-downline-reports", adminAuthMiddleware, getprofitlossofdownlineofreportlist);
router.get("/get/user/bet-history", adminAuthMiddleware, getBetHistory);
router.get("/get/graph-backup", adminAuthMiddleware, getGraphBackupData);
router.get("/get/graph-live", adminAuthMiddleware, getGraphLiveData);
router.get("/get/profit-loss-by-downline-reports-userData", adminAuthMiddleware, getprofitlossofdownlineofreportlistUserData);

export default router;