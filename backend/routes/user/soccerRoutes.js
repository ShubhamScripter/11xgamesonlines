// routes/soccerRoutes.js
// import express from "express";
const express=require('express')
const {fetchsoccerBettingData,fetchSoccerData,} =require('../../controllers/user/soccerController')
// import {
//   fetchsoccerBettingData,
//   fetchSoccerData,
// } from "../../controllers/user/soccerController.js";

const router = express.Router();

router.get("/soccer", fetchSoccerData);
router.get("/soccer/betting", fetchsoccerBettingData); // /api/betting?gameid=123

// export default router;
module.exports=router