// import express from "express";
// import { getLiveStream } from "../controllers/streamingController.js";

// const router = express.Router();

// // GET /api/stream/live?event_type_id=4&event_id=34734325
// router.get("/live", getLiveStream);

// export default router;


import express from "express";
import { getLiveStream } from "../controllers/streamingController.js";

const router = express.Router();

// POST /api/stream/live
// Body: { match_id, sportsName, match_name }
router.post("/live", getLiveStream);

export default router;
