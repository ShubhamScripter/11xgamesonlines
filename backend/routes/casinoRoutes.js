import express from "express";
import{
    getCasinoData,
    getCasinoBettingData,
    getCasinoResultData,
    getCasinoResultDetailData,
    getCasinoVideo
}
from "../controllers/casinoController.js";
 
const router = express.Router();
 
router.get("/casino-data",getCasinoData);
router.get("/casino-betting-data",getCasinoBettingData);
router.get("/casino-betting-result",getCasinoResultData);
router.get("/casino-betting-result-detail",getCasinoResultDetailData);
router.get("/casino-video",getCasinoVideo)
 
export default router;
 
