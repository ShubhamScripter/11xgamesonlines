// routes/tennisRoutes.js
// import express from "express";
const express= require("express")
const { fetchTannisBettingData, fetchTennisData } =require('../../controllers/user/tennisController')
// import { fetchTannisBettingData, fetchTennisData } from "../../controllers/user/tennisController";

const router = express.Router();

router.get("/tennis", fetchTennisData); // GET /api/tennis
router.get("/tannis/betting", fetchTannisBettingData); // /api/betting?gameid=123


// export default router;
module.exports=router