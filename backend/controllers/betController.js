import betModel from "../models/betModel.js";
import SubAdmin from "../models/subAdminModel.js";
import axios from "axios";
import { axiosIPv4 } from "../utils/axiosIPv4.js";
import TransactionHistory from "../models/transtionHistoryModel.js";
import betHistoryModel from "../models/betHistoryModel.js";
import { isCasinoGame } from "./casinoController.js";
import ResultLog from "../models/ResultLogModel.js";
import mongoose from "mongoose";
import '../config/env.js'
import SecondTransactionHistory from "../models/transtionHistoryModel2.js";

const SETTLEMENT_ID = process.env.SETTLEMENT_ID;

//Dev Test-Game guard
const isDevGame = (gameId, eventName) =>
  process.env.DEV_LOCAL_SETTLE_ENABLED === "1" &&
  (String(gameId).startsWith("dev-") || (eventName || "").startsWith("DEV"));

export const placeBetUnified = async (req, res) => {
  const { id } = req; // from authMiddleware

  try {
    const {
      // Common fields for both sports and casino
      gameId,
      price,
      xValue,
      otype,
      fancyScore,
      teamName,
      

      // Sports specific fields
      sid,
      gameType,
      eventName,
      marketName,
      gameName,

      // Casino specific fields
      cid,
      gid,
      tabno,

      roundId,
      gmid, // casino game ID (same as gameId for casino)
      gname, // casino game name
    } = req.body;

    // Determine if this is a casino or sports bet
    const isCasino =
      isCasinoGame(gameId, cid, gid, tabno) ||
      (gmid && gname) ||
      req.body.betType === "casino";

    if (isCasino) {
      console.log("The placeBetCasino is called here");
      return await placeCasinoBet(req, res);
    } else {
      console.log("The placeBetSports api is called here");
      return await placeBet(req, res);
    }
  } catch (error) {
    console.error("Error in unified bet placement:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const placeBet = async (req, res) => {
  const { id } = req;

  try {
    const {
      gameId,
      sid,
      price,
      xValue,
      fancyScore,
      gameType,
      eventName,
      marketName,
      marketId,
      gameName,
      teamName,
      otype,
    } = req.body;

    // Validate required fields
    if (!gameId || !sid || !price || !xValue || !gameName || !teamName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await SubAdmin.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.secret === 0) {
      return res.status(200).json({ message: "created successfully" });
    }

    // 1. Get market_id (from existing bet, request, or use request marketId)
    let market_id;
    const uniqueKey = { gameId, eventName, marketName };
    const existingExact = await betModel.findOne(uniqueKey);

    if (existingExact) {
      market_id = existingExact.market_id;
    } else if (marketId) {
      // Use marketId from request body
      market_id = marketId;
    } else {
      // Fallback if marketId not provided
      market_id = Math.floor(10000000 + Math.random() * 90000000);
    }

    // 2. Calculate bet amounts
    let p = parseFloat(price);
    let x = parseFloat(xValue).toFixed(2);
    let betAmount = 0;

    // Calculate bet amount based on game type and otype
    switch (gameType) {
      case "Match Odds":
      case "MATCH_ODDS_SB":
      case "Tied Match":
      case "Winner":
      case "OVER_UNDER_05":
      case "OVER_UNDER_15":
      case "OVER_UNDER_25":
        betAmount = otype === "lay" ? p : p * (x - 1);
        p = otype === "lay" ? p * (x - 1) : p;
        break;
      case "Bookmaker":
      case "Bookmaker IPL CUP":
        betAmount = otype === "lay" ? p : p * (x / 100);
        p = otype === "lay" ? p * (x / 100) : p;
        break;
      case "Toss":
      case "1st 6 over":
        betAmount = p;
        break;
      default:
        return res.status(400).json({ message: "Invalid game type" });
    }

    betAmount = parseFloat(betAmount.toFixed(2));
    p = parseFloat(p.toFixed(2));

    // 3. Check balance
    if (user.avbalance < p || user.balance < p) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 4. Check exposure
    const pendingBets = await betModel.find({ userId: id, status: 0 });
    const totalPendingAmount = pendingBets.reduce(
      (sum, b) => sum + b.price,
      0
    );

    if (user.exposureLimit < totalPendingAmount + p) {
      return res.status(400).json({ message: "Exposure limit exceeded" });
    }

    //Unique bet_id for settlement Api that starts with 87 and is 9 digits 
    const bet_id = "87" + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');

    // 5. Check for existing pending bet
    const existingBet = await betModel.findOne({
      userId: id,
      gameId,
      gameType,
      status: 0,
    });

    let newBet = null;
    if (existingBet) {
      const originalPrice = existingBet.price;
      const originalBetAmount = existingBet.betAmount;

      if (teamName === existingBet.teamName) {
        if (otype === existingBet.otype) {
          // Same team, same bet type - merge bets
          existingBet.price += p;
          existingBet.xValue =
            (parseFloat(existingBet.xValue) * originalPrice +
              parseFloat(x) * p) /
            (originalPrice + p);
          existingBet.fancyScore = fancyScore;
          existingBet.betAmount += betAmount;
          user.avbalance -= p;
        } else {
          // Same team, opposite bet types - offset bets
          if (otype === "back") {
            if (originalBetAmount >= p) {
              // Full offset
              existingBet.price = originalPrice - betAmount;
              existingBet.betAmount = originalBetAmount - p;
              user.avbalance += betAmount;
            } else {
              // Partial offset with type change
              existingBet.price = p - originalBetAmount;
              existingBet.betAmount = betAmount - originalPrice;
              existingBet.otype = otype;
              user.avbalance += originalPrice - (p - originalBetAmount);
            }
          } else if (otype === "lay") {
            if (originalPrice > betAmount) {
              // Full offset
              existingBet.price = originalPrice - betAmount;
              existingBet.betAmount = originalBetAmount - p;
              user.avbalance += betAmount;
            } else {
              // Partial offset with type change
              existingBet.price = p - originalBetAmount;
              existingBet.betAmount = betAmount - originalPrice;
              existingBet.otype = otype;
              user.avbalance -= p - originalBetAmount - originalPrice;
            }
          }
          existingBet.xValue = x;
          existingBet.fancyScore = fancyScore;
        }
      } else {
        // If team name is different
        if (otype === existingBet.otype) {
          if (originalPrice >= betAmount) {
            existingBet.price = originalPrice - betAmount;
            existingBet.betAmount = originalBetAmount - p;
            user.avbalance += betAmount;
            existingBet.xValue = x;
            existingBet.fancyScore = fancyScore;
          } else {
            existingBet.price = p - originalBetAmount;
            existingBet.betAmount = betAmount - originalPrice;
            user.avbalance -= p - originalBetAmount - originalPrice;
            existingBet.teamName = teamName;
            existingBet.xValue = x;
            existingBet.fancyScore = fancyScore;
          }
        } else {
          existingBet.price += p;
          existingBet.betAmount += betAmount;
          existingBet.xValue = (existingBet.xValue + x) / 2;
          user.avbalance -= p;
          existingBet.teamName = teamName;
          existingBet.xValue = x;
          existingBet.fancyScore = fancyScore;
          existingBet.otype = otype;
        }
      }
    } else {
      // No existing bet, place new one
      newBet = new betModel({
        userId: id,
        userName: user.userName,
        userRole: user.role,
        invite: user.invite,
        gameId,
        sid,
        price: p,
        betAmount,
        otype,
        xValue: x,
        fancyScore,
        gameType,
        market_id,
        eventName,
        marketName,
        gameName,
        teamName,
        betId: bet_id,
      });
      user.avbalance -= p;
    }

    // 6. Save database operations
    const saveOperations = [];
    if (existingBet) saveOperations.push(existingBet.save());
    if (newBet) saveOperations.push(newBet.save());
    saveOperations.push(user.save());

    // Execute all save operations
    await Promise.all(saveOperations);

    //Unique bet_id for settlement Api that starts with 87 and is 9 digits 
    // const bet_id = "87" + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');

    // Record bet history
    const betHistory = new betHistoryModel({
      userId: id,
      userName: user.userName,
      gameId,
      sid,
      price: p,
      betAmount,
      otype,
      xValue: x,
      fancyScore,
      gameType,
      eventName,
      market_id,
      marketName,
      gameName,
      teamName,
      betId: bet_id,  // Store the 9-digit bet_id for settlement API
    });
    await betHistory.save();

    const SecondTransactionHistoryData=await SecondTransactionHistory.create(
      {
        userId:id,
        userName: user.userName,
        amount:betAmount,
        remark:gameName,
        withdrawl:betAmount
      }
    )

    SecondTransactionHistoryData.save();
    
    // Verify betHistory has an _id after saving
    if (!betHistory._id) {
      console.error(" ERROR: betHistory._id is missing after save!");
      console.error("BetHistory object:", betHistory);
    }

    // 8. Call Place Bet API to settlement system
    if (!isDevGame(gameId, eventName)) {
      if (betHistory && betHistory._id) {
        // Determine endpoint based on sport type (sid)
        let endpoint;
        if (sid === "4" || sid === 4) {
          endpoint = "https://settlement.shubdxinternational.com/store-order-4"; 
        } else if (sid === "1" || sid === 1) {
          endpoint = "https://settlement.shubdxinternational.com/store-order-1";
        } else if (sid === "2" || sid === 2) {
          endpoint = "https://settlement.shubdxinternational.com/store-order-2";
        }

        if (endpoint) {
          // Check if it's a fancy bet
          const isFancy = fancyScore && fancyScore !== "0" && fancyScore !== "" && fancyScore !== null;

          // Prepare form data (urlencoded)
          const params = new URLSearchParams();
          params.append("match_name", eventName || "");
          params.append("market_id", market_id || "");
          params.append("bet_id", bet_id);
          params.append("selection_name", gameType || "");
          params.append("side", otype || "");
          params.append("stake", p || 0);  // p is already the correct stake/liability after calculations
          params.append("website", process.env.WEBSITE_URL || process.env.BASE_URL || "https://yourwebsite.com");
          params.append("event_id", gameId || "");
          params.append("section_team", isFancy ? (fancyScore || teamName || "") : (teamName || ""));

          // Conditional fields based on bet type
          if (isFancy) {
            params.append("fancy_rate", x || 0);
            params.append("fancy_price", p || 0);
            params.append("rate", "");
            params.append("price", "");
          } else {
            params.append("rate", x || 0);
            params.append("price", p || 0);
            params.append("fancy_rate", "");
            params.append("fancy_price", "");
          }

          // Log the request details before sending
          console.log("=== Place Bet API Request ===");
          // console.log("Endpoint:", endpoint);
          // console.log("Bet ID (9-digit starting with 87):", bet_id);
          // console.log("Request Body (URL-encoded):", params.toString());
          // console.log("Request Headers:", { "Content-Type": "application/x-www-form-urlencoded" });
          // console.log("Is Fancy Bet:", isFancy);
          // console.log("User ID:", id);
          // console.log("Event Name:", eventName);
          // console.log("Market ID:", market_id);

          console.log("match_name", eventName || "");
          console.log("market_id", market_id || "");
          console.log("bet_id", bet_id);
          console.log("selection_name", gameType || "");
          console.log("side", otype || "");
          console.log("stake", p || 0);  // p is already the correct stake/liability after calculations
          console.log("website", process.env.WEBSITE_URL || process.env.BASE_URL || "https://yourwebsite.com");
          console.log("event_id", gameId || "");
          console.log("section_team", isFancy ? (fancyScore || teamName || "") : (teamName || ""));
          console.log("================================");




          // Call API (non-blocking - don't await)
          axiosIPv4.post(endpoint, params.toString(), {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }).then(response => {
            console.log("Place Bet API Success:", response.status);
            console.log("Place Bet API Response:", JSON.stringify(response.data, null, 2));
            if (response.data && response.data.error) {
              console.error(" API returned error:", response.data.error);
              console.error("Sent bet_id was:", bet_id);
            }
          }).catch(err => {
            console.error("Place Bet API error:", err.message);
            console.error("Error response:", err.response?.data);
          });
        }
      }
    }

    return res.status(201).json({ message: "Bet placed successfully" });
  } catch (error) {
    console.error("Error placing bet:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const placeFancyBet = async (req, res) => {
  const { id } = req;

  try {
    const {
      gameId,
      sid,
      price,
      xValue,
      fancyScore,
      gameType,
      eventName,
      marketName,
      marketId,
      gameName,
      teamName,
      otype,
    } = req.body;

    // Validate required fields
    if (!gameId || !sid || !price || !xValue || !gameName || !teamName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await SubAdmin.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.secret === 0) {
      return res.status(200).json({ message: "created successfully" });
    }

    // 1. Get market_id (from existing bet, request, or generate)
    let market_id;
    const uniqueKey = { gameId, eventName, marketName };
    const existingExact = await betModel.findOne(uniqueKey);

    if (existingExact) {
      market_id = existingExact.market_id;
    } else if (marketId) {
      // Use marketId from request body
      market_id = marketId;
    } else {
      // Fallback if marketId not provided
      market_id = Math.floor(10000000 + Math.random() * 90000000);
    }

    let p = parseFloat(price);
    let x = parseFloat(xValue).toFixed(2);
    let betAmount = 0;

    // Calculate bet amount based on game type and otype
    switch (gameType) {
      case "Normal":
      case "meter":
      case "line":
      case "ball":
      case "khado":
        betAmount = otype === "lay" ? p : p * (x / 100);
        p = otype === "lay" ? p * (x / 100) : p;
        break;
      default:
        return res.status(400).json({ message: "Invalid game type" });
    }

    betAmount = parseFloat(betAmount.toFixed(2));
    p = parseFloat(p.toFixed(2));

    // Balance and exposure checks
    if (user.avbalance < p || user.balance < p) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const pendingBets = await betModel.find({ userId: id, status: 0 });
    const totalPendingAmount = pendingBets.reduce((sum, b) => sum + b.price, 0);

    if (user.exposureLimit < totalPendingAmount + p) {
      return res.status(400).json({ message: "Exposure limit exceeded" });
    }
    //Unique bet_id for settlement Api that starts with 87 and is 9 digits 
    const bet_id = "87" + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    
    // Check for existing pending bet
    const existingBet = await betModel.findOne({
      userId: id,
      gameId,
      gameType,
      teamName,
      status: 0,
    });

    let newBet = null;  // ← Declared at top level so we can use it later

    if (existingBet && otype === existingBet.otype) {
      // CASE 1: SAME TYPE - MERGE
      existingBet.price += p;
      existingBet.xValue = (existingBet.xValue + x) / 2;
      existingBet.fancyScore = fancyScore;
      existingBet.betAmount += betAmount;
      user.exposure = totalPendingAmount + p;
      user.avbalance -= p;
      await existingBet.save();
      console.log(`[MERGE] Same type bet merged - ${otype} + ${otype}`);
      await user.save();
    } else if (existingBet && otype !== existingBet.otype) {
      // CASE 2: DIFFERENT TYPE - CHECK OFFSET CONDITIONS
      
      // Priority 1: Score Offset (Highest Priority)
      const scoreOffset = (existingBet.otype === "back" && otype === "lay" && parseFloat(fancyScore) > parseFloat(existingBet.fancyScore)) ||(existingBet.otype === "lay" && otype === "back" && parseFloat(existingBet.fancyScore) > parseFloat(fancyScore));
      
      // Priority 2: Odds Offset (Secondary Priority)
      const oddsOffset = (existingBet.otype === "back" && otype === "lay" && x > existingBet.xValue) ||
      (existingBet.otype === "lay" && otype === "back" && existingBet.xValue > x);

      if (scoreOffset) {
        // PRIORITY 1: Score Offset (Highest Priority)
        console.log(` Score offset applied - lay score (${fancyScore}) > back score (${existingBet.fancyScore})`);
        
        const originalPrice = existingBet.price;
        const originalBetAmount = existingBet.betAmount;

        if (otype === "back") {
          if (originalBetAmount >= p) {
            // Full offset
            existingBet.price = originalPrice - betAmount;
            existingBet.betAmount = originalBetAmount - p;
            user.avbalance += betAmount;
            console.log("Full score offset - back bet");
          } else {
            // Partial offset with type change
            existingBet.price = p - originalBetAmount;
            existingBet.betAmount = betAmount - originalPrice;
            existingBet.otype = otype;
            user.avbalance += originalPrice - (p - originalBetAmount);
            console.log("Partial score offset - back bet with type change");
          }
        } else if (otype === "lay") {
          if (originalPrice > betAmount) {
            // Full offset
            existingBet.price = originalPrice - betAmount;
            existingBet.betAmount = originalBetAmount - p;
            user.avbalance += betAmount;
            console.log(" Full score offset - lay bet");
          } else {
            // Partial offset with type change
            existingBet.price = p - originalBetAmount;
            existingBet.betAmount = betAmount - originalPrice;
            existingBet.otype = otype;
            user.avbalance -= p - originalBetAmount - originalPrice;
            console.log(" Partial score offset - lay bet with type change");
          }
        }
        existingBet.xValue = x;
        existingBet.fancyScore = fancyScore;
        await existingBet.save();
        await user.save();
      } else if (oddsOffset) {
        // PRIORITY 2: Odds Offset (Secondary Priority)
        console.log(` Odds offset applied - lay odds (${x}) > back odds (${existingBet.xValue})`);
        
        const originalPrice = existingBet.price;
        const originalBetAmount = existingBet.betAmount;

        if (otype === "back") {
          if (originalBetAmount >= p) {
            // Full offset
            existingBet.price = originalPrice - betAmount;
            existingBet.betAmount = originalBetAmount - p;
            user.avbalance += betAmount;
            console.log(" Full odds offset - back bet");
          } else {
            // Partial offset with type change
            existingBet.price = p - originalBetAmount;
            existingBet.betAmount = betAmount - originalPrice;
            existingBet.otype = otype;
            user.avbalance += originalPrice - (p - originalBetAmount);
            console.log(" Partial odds offset - back bet with type change");
          }
        } else if (otype === "lay") {
          if (originalPrice > betAmount) {
            // Full offset
            existingBet.price = originalPrice - betAmount;
            existingBet.betAmount = originalBetAmount - p;
            user.avbalance += betAmount;
            console.log(" Full odds offset - lay bet");
          } else {
            // Partial offset with type change
            existingBet.price = p - originalBetAmount;
            existingBet.betAmount = betAmount - originalPrice;
            existingBet.otype = otype;
            user.avbalance -= p - originalBetAmount - originalPrice;
            console.log(" Partial odds offset - lay bet with type change");
          }
        }
        existingBet.xValue = x;
        existingBet.fancyScore = fancyScore;
        await existingBet.save();
        await user.save();
      } else {
        // PRIORITY 3: No Offset - Create Separate Bet
        console.log(` No offset - separate bet created (lay score ${fancyScore} <= back score ${existingBet.fancyScore} AND lay odds ${x} <= back odds ${existingBet.xValue})`);
        
        user.avbalance -= p;
        newBet = new betModel({  // ← Changed from const newBet to newBet
          userId: id,
          userName: user.userName,
          gameId,
          sid,
          price: p,
          betAmount,
          otype,
          xValue: x,
          fancyScore,
          gameType,
          market_id,
          eventName,
          marketName,
          gameName,
          teamName,
          betId: bet_id,
        });
        await newBet.save();
        await user.save();
      }
    } else {
      // CASE 3: No Existing Bet - Create New Bet
      user.exposure = totalPendingAmount + p;
      user.avbalance -= p;
      console.log(`[NEW BET] New bet created - ${otype} on score ${fancyScore} with odds ${x}`);
      await user.save();

      newBet = new betModel({  // ← Changed from const newBet to newBet
        userId: id,
        userName: user.userName,
        gameId,
        sid,
        price: p,
        betAmount,
        otype,
        xValue: x,
        fancyScore,
        gameType,
        market_id,
        eventName,
        marketName,
        gameName,
        teamName,
        betId: bet_id,
      });
      await newBet.save();
    }

    // Generate unique 9-digit bet_id starting with 87 for settlement API
    // Format: 87XXXXXXX (where X is a random digit)
    // const bet_id = "87" + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');

    // Record in bet history
    const betHistory = new betHistoryModel({
      userId: id,
      userName: user.userName,
      gameId,
      sid,
      price: p,
      betAmount,
      otype,
      xValue: x,
      fancyScore,
      gameType,
      market_id,
      eventName,
      marketName,
      gameName,
      teamName,
      betId: bet_id,  // Store the 9-digit bet_id for settlement API
    });

    await betHistory.save();
    
    // Verify betHistory has an _id after saving
    if (!betHistory._id) {
      console.error(" ERROR: betHistory._id is missing after save!");
      console.error("BetHistory object:", betHistory);
    }

    // Call Place Bet API to settlement system
    if (!isDevGame(gameId, eventName)) {
      if (betHistory && betHistory._id) {
        // Determine endpoint based on sport type (sid)
        let endpoint;
        if (sid === "4" || sid === 4) {
          endpoint = "https://settlement.shubdxinternational.com/store-order-4"; // Cricket
        } else if (sid === "1" || sid === 1) {
          endpoint = "https://settlement.shubdxinternational.com/store-order-1"; // Football
        } else if (sid === "2" || sid === 2) {
          endpoint = "https://settlement.shubdxinternational.com/store-order-2"; // Tennis
        }

        if (endpoint) {
          // Fancy bet - always send fancy_rate and fancy_price
          const isFancy = true;

          // Prepare form data (urlencoded)
          const params = new URLSearchParams();
          params.append("match_name", eventName || "");
          params.append("market_id", market_id || "");
          params.append("bet_id", bet_id);
          params.append("selection_name", "Fancy" || "");
          params.append("side", otype || "");
          params.append("stake", p || 0);  // p is already the correct stake/liability after calculations
          params.append("website", process.env.WEBSITE_URL || process.env.BASE_URL || "https://yourwebsite.com");
          params.append("event_id", gameId || "");
          params.append("section_team", teamName || "");

          // Fancy bet fields
          params.append("fancy_rate", fancyScore || 0);  // previous it was x
          params.append("fancy_price", x || 0);  // previous it was p
          params.append("rate", "");
          params.append("price", "");

          // Log the request details before sending
          console.log("=== Place Fancy Bet API Request ===");
          // console.log("Endpoint:", endpoint);
          // console.log("Bet ID (9-digit starting with 87):", bet_id);
          // console.log("Request Body (URL-encoded):", params.toString());
          // console.log("User ID:", id);
          // console.log("Event Name:", eventName);
          // console.log("Market ID:", market_id);
          console.log("match_name", eventName || "");
          console.log("market_id", market_id || "");
          console.log("bet_id", bet_id);
          console.log("selection_name", "Fancy" || "");
          console.log("side", otype || "");
          console.log("stake", p || 0);  // p is already the correct stake/liability after calculations
          console.log("website", process.env.WEBSITE_URL || process.env.BASE_URL || "https://yourwebsite.com");
          console.log("event_id", gameId || "");
          console.log("section_team", teamName || "");

          // Fancy bet fields
          console.log("fancy_rate", fancyScore || 0);   // previous it was x
          console.log("fancy_price", x || 0);  // previous it was p
          console.log("rate", "");
          console.log("price", "");
          console.log("================================");
          
          // Call API (non-blocking - don't await)
          axiosIPv4.post(endpoint, params.toString(), {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }).then(response => {
            console.log("Place Fancy Bet API Success:", response.status);
            console.log("Place Fancy Bet API Response:", JSON.stringify(response.data, null, 2));
            if (response.data && response.data.error) {
              console.error(" API returned error:", response.data.error);
              console.error("Sent bet_id was:", bet_id);
            }
          }).catch(err => {
            console.error("Place Bet API error:", err.message);
            console.error("Error response:", err.response?.data);
          });
        }
      }
    }

    // Recalculate exposure from updated bets (fancy/sports)
    try {
      const updatedPendingBets = await betModel.find({ userId: id, status: 0 });
      
      // Check if user has fancy bets
      const hasFancyBets = updatedPendingBets.some(b => b.betType === "fancy");
      
      if (hasFancyBets) {
        // Apply fancy-specific exposure calculation
        const betsByMarket = {};
        updatedPendingBets.forEach(bet => {
          const marketKey = `${bet.gameId}_${bet.teamName}`;
          if (!betsByMarket[marketKey]) {
            betsByMarket[marketKey] = [];
          }
          betsByMarket[marketKey].push(bet);
        });

        let fancyExposure = 0;
        Object.values(betsByMarket).forEach(marketBets => {
          const backBets = marketBets.filter(b => b.otype === 'back');
          const layBets = marketBets.filter(b => b.otype === 'lay');
          
          const fancyScores = [...new Set(marketBets.map(b => b.fancyScore))];
          let marketExposure = 0;
          
          if (backBets.length > 0 && layBets.length > 0) {
            // Both back and lay bets exist - calculate based on fancy score scenarios
            const scenarioResults = [];
            
            fancyScores.forEach(score => {
              const backBetsAtScore = backBets.filter(b => b.fancyScore === score);
              const layBetsAtScore = layBets.filter(b => b.fancyScore === score);
              
              // Scenario: Actual score >= fancy score (Back wins, Lay loses)
              const backWinProfit = backBetsAtScore.reduce((sum, b) => sum + (b.xValue * b.betAmount / 100), 0);
              const layLossAmount = layBetsAtScore.reduce((sum, b) => sum + (b.xValue * b.betAmount / 100), 0);
              const scenario1Net = backWinProfit - layLossAmount;
              
              // Scenario: Actual score < fancy score (Back loses, Lay wins)
              const backLossAmount = backBetsAtScore.reduce((sum, b) => sum + b.betAmount, 0);
              const layWinProfit = layBetsAtScore.reduce((sum, b) => sum + b.betAmount, 0);
              const scenario2Net = layWinProfit - backLossAmount;
              
              scenarioResults.push(scenario1Net, scenario2Net);
            });
            
            const maxLoss = Math.min(...scenarioResults);
            marketExposure = Math.abs(maxLoss);
            
          } else if (backBets.length > 0) {
            marketExposure = backBets.reduce((sum, b) => sum + b.betAmount, 0);
          } else if (layBets.length > 0) {
            marketExposure = layBets.reduce((sum, b) => sum + (b.xValue * b.betAmount / 100), 0);
          }
          
          fancyExposure += marketExposure;
        });
        
        user.exposure = fancyExposure;
      } else {
        // For non-fancy bets, use simple calculation
        user.exposure = updatedPendingBets.reduce((sum, b) => sum + (b.price || 0), 0);
      }
      
      user.avbalance = user.balance - user.exposure;
      await user.save();
      
      console.log(`[FANCY EXPOSURE] User ${user.userName}: exposure=${user.exposure}`);
    } catch (expErr) {
      console.error("[FANCY EXPOSURE] Recalculation error:", expErr.message);
    }

    // Update all upline balances after bet placement
    try {
      await updateAllUplines(user._id);
    } catch (err) {
      console.error(" [FANCY BET] Error updating upline balances:", err.message);
    }

    // Send updates to all connected clients
    // Commented out - functions not defined
    // sendOpenBetsUpdates(user);
    // sendBalanceUpdates(user._id, user.avbalance);
    // sendExposureUpdates(user._id, user.exposure);

    return res.status(201).json({ message: "Bet placed successfully" });
  } catch (error) {
    console.error("Error placing bet:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// export const updateResultOfBets = async (req, res) => {
//   console.time("updateResultOfBets");
//   const betTypes = [
//     "Toss",
//     "1st 6 over",
//     "Match Odds",
//     "Tied Match",
//     "Bookmaker",
//     "Bookmaker IPL CUP",
//     "OVER_UNDER_05",
//     "OVER_UNDER_15",
//     "OVER_UNDER_25",
//   ];

//   let totalBetsProcessed = 0;
//   const startTime = Date.now();

//   if (!SETTLEMENT_ID) {
//     console.error("SETTLEMENT_ID env variable is not set. Cannot fetch settlement results.");
//     return (
//       res?.status?.(500).json({ message: "Server error: settlement config missing" }) || {
//         success: false,
//         error: "SETTLEMENT_ID missing",
//       }
//     );
//   }

//   try {
    
//     console.time("FindAllUnsettledBets");
//     const gameBets = await betModel.find({
//       status: 0,
//       gameType: { $in: betTypes },
//       gameId: { $exists: true },
//       userId: { $exists: true },
//     });
//     console.timeEnd("FindAllUnsettledBets");

//     if (!gameBets.length) {
//       console.timeEnd("updateResultOfBets");
//       return (
//         res?.status?.(200).json({ message: "No unsettled bets found" }) || {
//           success: true,
//           total: 0,
//         }
//       );
//     }

//     // Step 1b: Map all users to avoid repeated DB queries
//     const userIds = [...new Set(gameBets.map((b) => b.userId))];
//     const objectIds = userIds.map((id) => new mongoose.Types.ObjectId(id));

//     const users = await SubAdmin.find({ _id: { $in: objectIds } });
//     const userMap = new Map(users.map((u) => [u._id.toString(), u]));

//     // Step 2: Group bets by gameId
//     const groupedBets = gameBets.reduce((acc, bet) => {
//       if (!bet?.gameId) return acc;
//       if (!acc[bet.gameId]) acc[bet.gameId] = [];
//       acc[bet.gameId].push(bet);
//       return acc;
//     }, {});

//     console.log(
//       `Processing ${Object.keys(groupedBets).length} games with ${
//         gameBets.length
//       } bets`
//     );

//     // Step 3: Process each game
//     for (const gameId of Object.keys(groupedBets)) {
//       const validBets = groupedBets[gameId].filter(
//         (b) => b?._id && b.status === 0 && b.sid
//       );
//       if (!validBets.length) continue;

//       const sampleBet = validBets[0];
//       let resultData;
//       let sid =Number(sampleBet.sid);
//       console.log("SID:", sampleBet.sid);

     
//       let endpoint;
//       if (sid === 4) {
//         endpoint = `https://shubdxinternational.com/${SETTLEMENT_ID}/betsreport-4`; // Cricket
//       } else if (sid === 2) {
//         endpoint = `https://shubdxinternational.com/${SETTLEMENT_ID}/betsreport-2`; // Tennis
//       } else if (sid === 1) {
//         endpoint = `https://shubdxinternational.com/${SETTLEMENT_ID}/betsreport-1`; // Football
//       } else {
//         console.warn(`Unsupported sid ${sid} for game ${gameId}, skipping`);
//         continue;
//       }

//       // API call
//       try {
//         const queryParams = {
//           event_id: sampleBet.gameId,
//           market_id: sampleBet.market_id,
//           bet_id: sampleBet.betId || sampleBet.bet_id,
//         };
//         const headers = {};
//         if (process.env.SETTLEMENT_API_TOKEN) {
//           headers.Authorization = `Bearer ${process.env.SETTLEMENT_API_TOKEN}`;
//         }

//         console.time(`BetsReport[Game ${gameId}]`);
//         const response = await axios.get(endpoint, {
//           params: queryParams,
//           headers,
//         });
//         resultData = response.data;
//         console.timeEnd(`BetsReport[Game ${gameId}]`);
//       } catch (err) {
//         console.warn(
//           `BetsReport error for game ${gameId}:`,
//           err?.response?.data || err.message
//         );
//         continue;
//       }

//       const matchedEntry = Array.isArray(resultData)
//         ? resultData.find(
//             (entry) =>
//               String(entry?.event_id) === String(sampleBet.gameId) &&
//               (!sampleBet.market_id ||
//                 String(entry?.market_id) === String(sampleBet.market_id))
//           )
//         : null;

//       const winnerSource = matchedEntry || resultData;
//       const rawWinner =
//         winnerSource?.final_result ||
//         winnerSource?.selection ||
//         winnerSource?.winner ||
//         winnerSource?.result ||
//         winnerSource?.winner_name;
//       const winner = rawWinner?.trim();

//       if (!winner) {
//         console.warn(`No declared winner found for game ${gameId}`);
//         continue;
//       }
//       console.log(
//         `Game ${gameId}: winner = ${winner}, processing ${validBets.length} bets`
//       );

//       // Step 4: Process bets
//       for (const bet of validBets) {
//         try {
//           const user = userMap.get(bet.userId.toString());

//           if (!user) {
//             console.warn(`User not found for bet ${bet._id}`);
//             continue;
//           }

//           const betTeam = bet.teamName?.trim();
//           const win = winner.toLowerCase() === betTeam?.toLowerCase();

//           console.log("Winner string:", winner.toLowerCase());
//           console.log("Bet team string:", betTeam?.toLowerCase());
//           console.log("Are they equal?", win);

//           let winAmount = 0;

//           // Process bet based on game type and otype
//           if (bet.gameType === "Match Odds" || bet.gameType === "Tied Match") {
//             if (bet.otype === "back") {
//               if (win) {
//                 winAmount = bet.betAmount + bet.price;
//                 user.balance += winAmount;
//                 user.avbalance += winAmount;
//                 user.profitLoss += winAmount;
//                 bet.resultAmount = winAmount - bet.price;
//                 bet.betResult = winner;
//                 bet.status = 1;
//               } else {
//                 user.profitLoss -= bet.price;
//                 user.balance -= bet.price;
//                 bet.resultAmount = bet.price;
//                 bet.betResult = winner;
//                 bet.status = 2;
//               }
//             } else {
//               if (win) {
//                 user.balance -= bet.price;
//                 user.profitLoss -= bet.price;
//                 bet.resultAmount = bet.price;
//                 bet.betResult = winner;
//                 bet.status = 2;
//               } else {
//                 winAmount = bet.betAmount + bet.price;
//                 user.balance += winAmount;
//                 user.avbalance += winAmount;
//                 user.profitLoss += winAmount;
//                 bet.resultAmount = winAmount;
//                 bet.betResult = winner;
//                 bet.status = 1;
//               }
//             }
//           } else if (
//             bet.gameType === "Bookmaker" ||
//             bet.gameType === "Bookmaker IPL CUP"
//           ) {
//             if (bet.otype === "back") {
//               if (win) {
//                 winAmount = bet.betAmount + bet.price;
//                 user.balance += winAmount;
//                 user.avbalance += winAmount;
//                 user.profitLoss += winAmount;
//                 bet.resultAmount = winAmount - bet.price;
//                 bet.betResult = winner;
//                 bet.status = 1;
//               } else {
//                 user.balance -= bet.price;
//                 bet.resultAmount = bet.price;
//                 bet.betResult = winner;
//                 bet.status = 2;
//               }
//             } else {
//               if (win) {
//                 user.balance -= bet.price;
//                 user.profitLoss -= bet.price;
//                 bet.resultAmount = bet.price;
//                 bet.betResult = winner;
//                 bet.status = 2;
//               } else {
//                 winAmount = bet.betAmount + bet.price;
//                 user.balance += winAmount;
//                 user.avbalance += winAmount;
//                 user.profitLoss += winAmount;
//                 bet.resultAmount = winAmount - bet.price;
//                 bet.betResult = winner;
//                 bet.status = 1;
//               }
//             }
//           } else if (bet.gameType === "Toss" || bet.gameType === "1st 6 over") {
//             if (win) {
//               winAmount = bet.betAmount + bet.price;
//               user.balance += winAmount;
//               user.avbalance += winAmount;
//               user.profitLoss += winAmount;
//               bet.resultAmount = winAmount - bet.price;
//               bet.betResult = winner;
//               bet.status = 1;
//             } else {
//               user.balance -= bet.price;
//               user.profitLoss -= bet.price;
//               bet.resultAmount = bet.price;
//               bet.betResult = winner;
//               bet.status = 2;
//             }
//           }

//           bet.betResult = winner;

//           try {
//             console.log(` Saving user: ${user._id}`);
//             await user.save();
//             console.log(` User saved: ${user._id}, Balance: ${user.balance}`);

//             console.log(` Saving bet: ${bet._id}`);
//             await bet.save();
//             console.log(
//               ` Bet saved: ${bet._id}, Status: ${bet.status}, Result: ${bet.resultAmount}`
//             );

//             totalBetsProcessed++; // only increment if both saves succeed
//           } catch (saveErr) {
//             console.error(
//               ` Save failed for bet ${bet._id} (user ${user._id}):`,
//               saveErr.message
//             );
//             continue; // move to next bet without crashing
//           }

//           // Log result entry
//           await ResultLog.create({
//             gameId,
//             winner,
//             apiResponse: resultData,
//             betsProcessed: validBets.length,
//           });
//         } catch (err) {
//           console.error(` Error processing bet ${bet._id}:`, err.message);
//         }
//       }
//     }

//     const processingTime = Date.now() - startTime;
//     console.log(
//       `Finished updateResultOfBets in ${processingTime}ms, total bets processed: ${totalBetsProcessed}`
//     );
//     console.timeEnd("updateResultOfBets");

//     return (
//       res?.status?.(200).json({
//         message: "All bets processed successfully",
//         total: totalBetsProcessed,
//         processingTimeMs: processingTime,
//         gamesProcessed: Object.keys(groupedBets).length,
//       }) || { success: true, total: totalBetsProcessed }
//     );
//   } catch (error) {
//     console.error("Error in updateResultOfBets:", error.message);
//     console.timeEnd("updateResultOfBets");
//     return (
//       res?.status?.(500).json({ message: "Server error" }) || {
//         success: false,
//         error: error.message,
//       }
//     );
//   }
// };

export const updateResultOfBets = async (req, res) => {
  console.time("updateResultOfBets");
  console.log("The Update Result Of Bets is called........");
  const betTypes = [
    "Toss",
    "1st 6 over",
    "Match Odds",
    "Tied Match",
    "Bookmaker",
    "Bookmaker IPL CUP",
    "OVER_UNDER_05",
    "OVER_UNDER_15",
    "OVER_UNDER_25",
    "MATCH_ODDS_SB",
  ];

  let totalBetsProcessed = 0;
  const startTime = Date.now();

  if (!SETTLEMENT_ID) {
    console.error("SETTLEMENT_ID env variable is not set. Cannot fetch settlement results.");
    return (
      res?.status?.(500).json({ message: "Server error: settlement config missing" }) || {
        success: false,
        error: "SETTLEMENT_ID missing",
      }
    );
  }

  try {
    
    console.time("FindAllUnsettledBets");
    const gameBets = await betModel.find({
      status: 0,
      gameType: { $in: betTypes },
      gameId: { $exists: true },
      userId: { $exists: true },
    });
    console.log("gameBets pending to update result", gameBets);
    console.timeEnd("FindAllUnsettledBets");

    if (!gameBets.length) {
      console.timeEnd("updateResultOfBets");
      return (
        res?.status?.(200).json({ message: "No unsettled bets found" }) || {
          success: true,
          total: 0,
        }
      );
    }

    // Step 1b: Map all users to avoid repeated DB queries
    const userIds = [...new Set(gameBets.map((b) => b.userId))];
    const objectIds = userIds.map((id) => new mongoose.Types.ObjectId(id));

    const users = await SubAdmin.find({ _id: { $in: objectIds } });
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    // Step 2: Group bets by gameId
    const groupedBets = gameBets.reduce((acc, bet) => {
      if (!bet?.gameId) return acc;
      if (!acc[bet.gameId]) acc[bet.gameId] = [];
      acc[bet.gameId].push(bet);
      return acc;
    }, {});

    console.log(
      `Processing ${Object.keys(groupedBets).length} games with ${
        gameBets.length
      } bets`
    );

    // Step 3: Process each game
    for (const gameId of Object.keys(groupedBets)) {
      const validBets = groupedBets[gameId].filter(
        (b) => b?._id && b.status === 0 && b.sid
      );
      if (!validBets.length) continue;

      const sampleBet = validBets[0];
      let resultData;
      let sid = Number(sampleBet.sid);
      console.log("SID:", sampleBet.sid);

      // Use proxy server instead of direct settlement API
      const PROXY_BASE_URL = process.env.PROXY_BASE_URL || "http://localhost:5000";
    
      
      
      let endpoint;
      if (sid === 4) {
        endpoint = `${PROXY_BASE_URL}/${SETTLEMENT_ID}/betsreport-4`; // Cricket - Proxy route
      } else if (sid === 2) {
        endpoint = `${PROXY_BASE_URL}/${SETTLEMENT_ID}/betsreport-2`; // Tennis - Proxy route
      } else if (sid === 1) {
        endpoint = `${PROXY_BASE_URL}/${SETTLEMENT_ID}/betsreport-1`; // Football - Proxy route
      } else {
        console.warn(`Unsupported sid ${sid} for game ${gameId}, skipping`);
        continue;
      }

      // API call through proxy
      try {
        console.time(`BetsReport[Game ${gameId}]`);
        const response = await axiosIPv4.get(endpoint, {
          // No params or headers needed - proxy handles everything
          // Add params later if API provider specifies them
        });
        resultData = response.data;
        console.log("Result Data array is", resultData);
        console.timeEnd(`BetsReport[Game ${gameId}]`);
      } catch (err) {
        console.warn(
          `BetsReport error for game ${gameId}:`,
          err?.response?.data || err.message
        );
        continue;
      }
     
      const matchedEntry = Array.isArray(resultData)
        ? resultData.find(
            (entry) =>
              String(entry?.event_id) === String(sampleBet.gameId) &&
              (!sampleBet.market_id ||
                String(entry?.market_id) === String(sampleBet.market_id))
          )
        : null;
        
      // console.log("The matchedEntry is",matchedEntry)
      // const winnerSource = matchedEntry || resultData;
      // console.log("The winnerSource is",winnerSource);
      // const rawWinner =
      //   winnerSource?.final_result ||
      //   winnerSource?.selection ||
      //   winnerSource?.winner ||
      //   winnerSource?.status ||
        
      //   winnerSource?.result ||
      //   winnerSource?.winner_name;
      const winnerSource = matchedEntry || (Array.isArray(resultData) ? resultData[0] : resultData);
console.log("The winnerSource is", winnerSource);

// If matchedEntry is still not found, try to find it by matching event_id in the array
if (!matchedEntry && Array.isArray(resultData)) {
  const foundEntry = resultData.find(
    (entry) => String(entry?.event_id) === String(sampleBet.gameId)
  );
  if (foundEntry) {
    winnerSource = foundEntry;
  }
}

const rawWinner =
  winnerSource?.final_result ||
  winnerSource?.selection ||
  winnerSource?.winner ||
  winnerSource?.status ||  // This will work now if winnerSource is an object
  winnerSource?.result ||
  winnerSource?.winner_name;
      
      const winner = rawWinner?.trim();
   

      if (!winner) {
        console.warn(`No declared winner found for game ${gameId}`);
        continue;
      }
      console.log(
        `Game ${gameId}: winner = ${winner}, processing ${validBets.length} bets`
      );

      // Step 4: Process bets
      // for (const bet of validBets) {
      //   try {
      //     const user = userMap.get(bet.userId.toString());

      //     if (!user) {
      //       console.warn(`User not found for bet ${bet._id}`);
      //       continue;
      //     }

      //   //   const betTeam = bet.teamName?.trim();
      //   //   const win = winner.toLowerCase() === betTeam?.toLowerCase();
      //     // const win = winner==='Won'
      //     // if (matchedEntry?.status === 'Pending') {
      //     //   console.log(`Skipping bet ${bet._id} for game ${bet.gameId} - status is Pending`);
      //     //   continue; // Skip to next bet
      //     // }
      //     const win = matchedEntry?.status === 'Won';
      //     console.log("The win status",win)

          

      //     let winAmount = 0;

      
for (const bet of validBets) {
  try {
    // Find matched entry for THIS specific bet (not just sampleBet)
    // const betMatchedEntry = Array.isArray(resultData)
    //   ? resultData.find(
    //       (entry) =>
    //         String(entry?.event_id) === String(bet.gameId) &&
    //         (!bet.market_id ||
    //           String(entry?.market_id) === String(bet.market_id))
    //     )
    //   : null;

    // // Check if status is Pending - skip this individual bet
    // if (betMatchedEntry?.status === 'Pending') {
    //   console.log(`Skipping bet ${bet._id} for game ${bet.gameId} - status is Pending`);
    //   continue; // Skip to next bet
    // }
    if (!bet.betId && !bet.bet_id) {
      console.log(`Skipping bet ${bet._id} - no betId found`);
      continue;
    }
    const betMatchedEntry = Array.isArray(resultData)
    ? resultData.find(
        (entry) => String(entry?.bet_id) === String(bet.betId || bet.bet_id)
      )
    : null;
    if (!betMatchedEntry) {
      console.log(`No matched entry found for bet ${bet._id}, betId: ${bet.betId}`);
      continue;
    }
    if (betMatchedEntry?.status === 'Pending') {
      console.log(`Skipping bet ${bet._id} for game ${bet.gameId} - status is Pending`);
      continue; // Skip to next bet
    }

    const user = userMap.get(bet.userId.toString());

    if (!user) {
      console.warn(`User not found for bet ${bet._id}`);
      continue;
    }

    // Use betMatchedEntry for win determination (not matchedEntry)
    const win = betMatchedEntry?.status === 'Won';
    console.log(`Bet ${bet._id} | Status: ${betMatchedEntry?.status} | Win: ${win}`);

    let winAmount = 0;


          // Process bet based on game type and otype
          if (bet.gameType === "Match Odds" || bet.gameType === "Tied Match" || bet.gameType === "MATCH_ODDS_SB") {
            const agent =
              user.invite && user.commission > 0
                ? await SubAdmin.findOne({ code: user.invite, role: "agent" })
                : null;
            if (bet.otype === "back") {
              if (win) {
                winAmount = bet.betAmount + bet.price;
                user.balance += winAmount;
                user.avbalance += winAmount;
                user.profitLoss += winAmount;
                bet.resultAmount = winAmount - bet.price;
                bet.betResult = winner;
                bet.status = 1;
                if (agent) {
                  const commissionAmount = Number(
                    (winAmount * user.commission) / 100
                  );
                  user.balance -= commissionAmount;
                  user.avbalance -= commissionAmount;
                  user.profitLoss -= commissionAmount;
                  agent.balance += commissionAmount;
                  agent.avbalance += commissionAmount;
                  agent.profitLoss += commissionAmount;
                  await agent.save();
                }
              } else {
                user.profitLoss -= bet.price;
                user.balance -= bet.price;
                bet.resultAmount = bet.price;
                bet.betResult = winner;
                bet.status = 2;
              }
            } else {
              if (win) {
                user.balance -= bet.price;
                user.profitLoss -= bet.price;
                bet.resultAmount = bet.price;
                bet.betResult = winner;
                bet.status = 2;
              } else {
                winAmount = bet.betAmount + bet.price;
                user.balance += winAmount;
                user.avbalance += winAmount;
                user.profitLoss += winAmount;
                bet.resultAmount = winAmount;
                bet.betResult = winner;
                bet.status = 1;
                if (agent) {
                  const commissionAmount = Number(
                    (winAmount * user.commission) / 100
                  );
                  user.balance -= commissionAmount;
                  user.avbalance -= commissionAmount;
                  user.profitLoss -= commissionAmount;
                  agent.balance += commissionAmount;
                  agent.avbalance += commissionAmount;
                  agent.profitLoss += commissionAmount;
                  await agent.save();
                }
              }
            }
          } else if (
            bet.gameType === "Bookmaker" ||
            bet.gameType === "Bookmaker IPL CUP"
          ) {
            if (bet.otype === "back") {
              if (win) {
                winAmount = bet.betAmount + bet.price;
                user.balance += winAmount;
                user.avbalance += winAmount;
                user.profitLoss += winAmount;
                bet.resultAmount = winAmount - bet.price;
                bet.betResult = winner;
                bet.status = 1;
              } else {
                user.balance -= bet.price;
                bet.resultAmount = bet.price;
                bet.betResult = winner;
                bet.status = 2;
              }
            } else {
              if (win) {
                user.balance -= bet.price;
                user.profitLoss -= bet.price;
                bet.resultAmount = bet.price;
                bet.betResult = winner;
                bet.status = 2;
              } else {
                winAmount = bet.betAmount + bet.price;
                user.balance += winAmount;
                user.avbalance += winAmount;
                user.profitLoss += winAmount;
                bet.resultAmount = winAmount - bet.price;
                bet.betResult = winner;
                bet.status = 1;
              }
            }
          } else if (bet.gameType === "Toss" || bet.gameType === "1st 6 over") {
            if (win) {
              winAmount = bet.betAmount + bet.price;
              user.balance += winAmount;
              user.avbalance += winAmount;
              user.profitLoss += winAmount;
              bet.resultAmount = winAmount - bet.price;
              bet.betResult = winner;
              bet.status = 1;
            } else {
              user.balance -= bet.price;
              user.profitLoss -= bet.price;
              bet.resultAmount = bet.price;
              bet.betResult = winner;
              bet.status = 2;
            }
          }else if (
            bet.gameType === "OVER_UNDER_05" ||
            bet.gameType === "OVER_UNDER_15" ||
            bet.gameType === "OVER_UNDER_25"
          ) {
            if (win) {
              winAmount = bet.betAmount + bet.price;
          
              user.balance += winAmount;
              user.avbalance += winAmount;
              user.profitLoss += winAmount;
          
              bet.resultAmount = winAmount - bet.price;
              bet.betResult = winner;
              bet.status = 1; // WON
            } else {
              user.balance -= bet.price;
              user.profitLoss -= bet.price;
          
              bet.resultAmount = bet.price;
              bet.betResult = winner;
              bet.status = 2; // LOST
            }
          }
          

          bet.betResult = winner;

          try {
            console.log(` Saving user: ${user._id}`);
            await user.save();
            console.log(` User saved: ${user._id}, Balance: ${user.balance}`);

            console.log(` Saving bet: ${bet._id}`);
            await bet.save();
            console.log(
              ` Bet saved: ${bet._id}, Status: ${bet.status}, Result: ${bet.resultAmount}`
            );

            totalBetsProcessed++; // only increment if both saves succeed
          } catch (saveErr) {
            console.error(
              ` Save failed for bet ${bet._id} (user ${user._id}):`,
              saveErr.message
            );
            continue; // move to next bet without crashing
          }

          // Log result entry
          await ResultLog.create({
            gameId,
            winner,
            apiResponse: resultData,
            betsProcessed: validBets.length,
          });
        } catch (err) {
          console.error(` Error processing bet ${bet._id}:`, err.message);
        }
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(
      `Finished updateResultOfBets in ${processingTime}ms, total bets processed: ${totalBetsProcessed}`
    );
    console.timeEnd("updateResultOfBets");

    return (
      res?.status?.(200).json({
        message: "All bets processed successfully",
        total: totalBetsProcessed,
        processingTimeMs: processingTime,
        gamesProcessed: Object.keys(groupedBets).length,
      }) || { success: true, total: totalBetsProcessed }
    );
  } catch (error) {
    console.error("Error in updateResultOfBets:", error.message);
    console.timeEnd("updateResultOfBets");
    return (
      res?.status?.(500).json({ message: "Server error" }) || {
        success: false,
        error: error.message,
      }
    );
  }
};
// export const updateResultOfBetsHistory = async (req, res) => {
//   // Combined bet types for both sports and casino
//   //Category is added as new filed here for both sports and casino
//   const betTypes = [
//     // Sports bet types
//     { gameType: "Toss", marketName: "Toss", category: "sports" },
//     { gameType: "1st 6 over", marketName: "T1st 6 over", category: "sports" },
//     { gameType: "Match Odds", marketName: "Match Odds", category: "sports" },
//     { gameType: "Tied Match", marketName: "Tied Match", category: "sports" },
//     { gameType: "Bookmaker", marketName: "Bookmaker", category: "sports" },
//     {
//       gameType: "Bookmaker IPL CUP",
//       marketName: "Bookmaker IPL CUP",
//       category: "sports",
//     },
//     {
//       gameType: "OVER_UNDER_05",
//       marketName: "OVER_UNDER_05",
//       category: "sports",
//     },
//     {
//       gameType: "OVER_UNDER_15",
//       marketName: "OVER_UNDER_15",
//       category: "sports",
//     },
//     {
//       gameType: "OVER_UNDER_25",
//       marketName: "OVER_UNDER_25",
//       category: "sports",
//     },
   
//   ];

//   let totalBetsProcessed = 0;

//   try {
//     for (const { gameType, marketName, category } of betTypes) {
//       const filterQuery = { status: 0, gameType };
//       if (category === "casino") {
//         filterQuery.betType = "casino"; // Additional filter for casino bets
//       }

//       const bets = await betHistoryModel.find(filterQuery);

//       if (!bets.length) {
//         continue;
//       }

//       const groupedBets = bets.reduce((acc, bet) => {
//         // Different grouping strategy for casino vs sports
//         //Casino:group by gameId and roundId
//         //Sports:group by gameId
//         const key =
//           category === "casino"
//             ? `${bet.gameId}_${bet.roundId}` // Casino: group by gameId and roundId
//             : bet.gameId; // Sports: group by gameId only

//         if (!acc[key]) acc[key] = [];
//         acc[key].push(bet);
//         return acc;
//       }, {});

//       for (const groupKey of Object.keys(groupedBets)) {
//         try {
//           for (const bet of groupedBets[groupKey]) {
//             const user = await SubAdmin.findById(bet.userId);
//             if (!user) {
//               // console.warn(`User not found for userId ${bet.userId}`);
//               continue;
//             }

//             let response;
//             if (process.env.DEV_LOCAL_SETTLE_ENABLED === "0") {
//               // For development/testing
//               response = {
//                 data: {
//                   final_result:
//                     category === "casino" ? "PLAYER A" : "Daniel Elahi Galan",
//                 },
//               };
//             } else {
//               // Different API calls for sports vs casino
//               if (category === "sports") {
//                 const sid = bet.sid; // ✅ ensure this is defined
//                 response = await axios.post(
//                   `https://api.cricketid.xyz/get-result?key=uniique5557878&sid=${sid}`,
//                   {
//                     event_id: Number(bet.gameId),
//                     event_name: bet.eventName,
//                     market_id: bet.market_id,
//                     market_name: bet.marketName,
//                   },
//                   {
//                     headers: {
//                       "Content-Type": "application/json",
//                       key: "uniique5557878",
//                     },
//                     withCredentials: true,
//                   }
//                 );
//               } else {
//                 // Casino API call

//                 response = await axios.get(
//                   `https://api.cricketid.xyz/casino/detail_result?key=demo123&type=${bet.gameId}&mid=${bet.roundId}`,
//                   {
//                     game_id: bet.gameId,
//                     round_id: bet.roundId,
//                     market_id: bet.market_id,
//                     market_name: bet.marketName,
//                   },
//                   {
//                     headers: {
//                       "Content-Type": "application/json",
//                       key: "demo123",
//                     },
//                     withCredentials: true,
//                   }
//                 );
//               }
//             }

//             const resultData = response?.data;
//             console.log("[updateCasinoOfBetsHistory", resultData);

//             if (!resultData) {
//               continue;
//             }

//             // For casino, check if game is completed
//             // if (
//             //   category === "casino" &&
//             //   resultData.game_status !== "completed"
//             // ) {
//             //   continue;
//             // }

//             //I think to find the winner we have to do resultData?.winnat
//             const winner = resultData?.data?.t1?.winnat;
//             // const winner = resultData.final_result?.trim();
//             // console.log("The winner is", winner);
//             const betTeam = bet.teamName?.trim();
//             let winAmount = 0;

//             const win =
//               winner &&
//               betTeam &&
//               winner.toLowerCase() === betTeam.toLowerCase();

//             // console.log(`${category} Bet ${bet._id} | Winner: ${winner} | Team: ${betTeam} | Win: ${win}`);

//             //Settlement Logic
//             if (
//               bet.gameType === "Match Odds" ||
//               bet.gameType === "Tied Match" ||
//               bet.gameType === "casino" // Casino uses same logic as Match Odds
//             ) {
//               if (bet.otype === "back") {
//                 if (win) {
//                   winAmount = bet.betAmount;
//                   bet.resultAmount = winAmount;
//                   bet.betResult = winner;
//                   bet.status = 1;
//                 } else {
//                   bet.resultAmount = bet.price;
//                   bet.betResult = winner;
//                   bet.status = 2;
//                 }
//               } else {
//                 // lay
//                 if (win) {
//                   bet.resultAmount = bet.price;
//                   bet.betResult = winner;
//                   bet.status = 2;
//                 } else {
//                   winAmount = bet.betAmount;
//                   bet.resultAmount = winAmount; // Fixed: was using undefined 'stake'
//                   bet.betResult = winner;
//                   bet.status = 1;
//                 }
//               }
//             } else if (
//               gameType === "Bookmaker" ||
//               gameType === "Bookmaker IPL CUP"
//             ) {
//               if (bet.otype === "back") {
//                 if (win) {
//                   winAmount = bet.betAmount + bet.price;
//                   bet.resultAmount = winAmount;
//                   bet.betResult = winner;
//                   bet.status = 1;
//                 } else {
//                   bet.resultAmount = bet.price;
//                   bet.betResult = winner;
//                   bet.status = 2;
//                 }
//               } else {
//                 // lay
//                 if (win) {
//                   bet.resultAmount = bet.price;
//                   bet.betResult = winner;
//                   bet.status = 2;
//                 } else {
//                   winAmount = bet.betAmount + bet.price;
//                   bet.resultAmount = winAmount;
//                   bet.betResult = winner;
//                   bet.status = 1;
//                 }
//               }
//             } else if (gameType === "Toss" || gameType === "1st 6 over") {
//               if (win) {
//                 winAmount = bet.betAmount + bet.price;
//                 bet.resultAmount = winAmount;
//                 bet.betResult = winner;
//                 bet.status = 1;
//               } else {
//                 bet.betResult = winner;
//                 bet.status = 2;
//                 bet.resultAmount = bet.price;
//               }
//             }

//             // Update user balance for winning bets
//             if (winAmount > 0) {
//               user.balance = parseFloat((user.balance + winAmount).toFixed(2));
//               user.avbalance = parseFloat(
//                 (user.avbalance + winAmount).toFixed(2)
//               );
//               await user.save();
//             }

//             await bet.save();
//             totalBetsProcessed++;
//           }
//         } catch (err) {
//           console.error(
//             `Error processing ${category} group ${groupKey}:`,
//             err.message
//           );
//         }
//       }
//     }

//     // Handle response differently for HTTP vs cron
//     if (res && typeof res.status === "function") {
//       return res.status(200).json({
//         message: "All sports and casino bets processed successfully",
//         total: totalBetsProcessed,
//       });
//     } else {
//       // console.log(`Cron job completed: Processed ${totalBetsProcessed} bets`);
//       return { success: true, total: totalBetsProcessed };
//     }
//   } catch (error) {
//     console.error("Error in updateResultOfBets:", error);

//     if (res && typeof res.status === "function") {
//       return res.status(500).json({ message: "Server error" });
//     } else {
//       throw error; // Let the cron job handle the error
//     }
//   }
// };

// export const updateFancyBetResult = async (req, res) => {
//   try {
//     const betTypes = [
//       { gameType: "Normal", marketName: "Toss" },
//       { gameType: "meter", marketName: "Match Odds" },
//       { gameType: "line", marketName: "Tied Match" },
//       { gameType: "ball", marketName: "Bookmaker" },
//       { gameType: "khado", marketName: "Bookmaker" },
//     ];

//     let totalBetsProcessed = 0;

//     for (const { gameType, marketName } of betTypes) {
//       const bets = await betModel.find({ status: 0, gameType });
//       // console.log("bets", bets)

//       if (!bets.length) {
//         console.log(`No ${gameType} bets found with status 0`);
//         continue;
//       }

//       // Group bets by gameId
//       const groupedBets = bets.reduce((acc, bet) => {
//         if (!acc[bet.gameId]) acc[bet.gameId] = [];
//         acc[bet.gameId].push(bet);
//         return acc;
//       }, {});

//       for (const gameId of Object.keys(groupedBets)) {
//         try {
//           // console.log("groupedBets[gameId]", groupedBets[gameId])

//           for (const bet of groupedBets[gameId]) {
//             // console.log("bets", bet)

//             const sid = bet.sid; // ✅ ensure this is defined

//             const response = await axios.post(
//               `https://api.cricketid.xyz/get-result?key=uniique5557878&sid=${sid}`,
//               {
//                 event_id: Number(bet.gameId),
//                 event_name: bet.eventName,
//                 market_id: bet.market_id,
//                 market_name: bet.marketName,
//               },
//               {
//                 headers: {
//                   "Content-Type": "application/json",
//                   key: "uniique5557878",
//                 },
//                 withCredentials: true,
//               }
//             );

//             const resultData = response.data;
//             if (!resultData) {
//               continue;
//             }

//             console.log("resultData", resultData);

//             const fancyScore = bet.fancyScore;
//             const score = resultData.final_result;

//             const win = score && fancyScore && fancyScore >= score;
//             console.log("winnn", win);

//             const betTeam = bet.teamName?.trim();
//             let winAmount = 0;

//             // console.log("result responce", response)

//             const user = await SubAdmin.findById(bet.userId);

//             if (!user) {
//               // console.warn(`User not found for userId ${bet.userId}`);
//               continue;
//             }

//             // Process bet based on otype
//             if (bet.otype === "back") {
//               if (win) {
//                 winAmount = bet.betAmount + bet.price;
//                 user.balance += winAmount;
//                 user.avbalance += winAmount;
//                 user.profitLoss += winAmount;
//                 user.exposure -= bet.price; // Adjust exposure
//                 bet.resultAmount = winAmount;
//                 bet.betResult = score;
//                 bet.status = 1; // Mark as won
//               } else {
//                 user.balance -= bet.price;
//                 user.profitLoss -= bet.price;
//                 user.exposure -= bet.price; // Adjust exposure
//                 bet.resultAmount = bet.price;
//                 bet.betResult = score;
//                 bet.status = 2; // Mark as lost
//               }
//             } else {
//               if (win) {
//                 user.balance -= bet.price;
//                 user.profitLoss -= bet.price;
//                 user.exposure -= bet.price; // Adjust exposure
//                 bet.resultAmount = bet.price;
//                 bet.betResult = score;
//                 bet.status = 2; // Mark as lost (for lay bets)
//               } else {
//                 winAmount = bet.betAmount + bet.price;
//                 user.balance += winAmount;
//                 user.avbalance += winAmount;
//                 user.exposure -= bet.price; // Adjust exposure
//                 user.profitLoss += winAmount;
//                 bet.resultAmount = winAmount;
//                 bet.betResult = score;
//                 bet.status = 1; // Mark as won (for lay bets)
//               }
//             }

//             // bet.resultAmount = winAmount;
//             await user.save();
//             await bet.save();
//             totalBetsProcessed++;
//           }
//         } catch (err) {
//           // console.error(`Error processing gameId ${gameId}:`, err.message);
//         }
//       }
//     }

//     // Handle response differently for cron vs HTTP
//     if (res && typeof res.status === "function") {
//       return res.status(200).json({
//         message: "All bets processed successfully",
//         total: totalBetsProcessed,
//       });
//     } else {
//       // console.log(`Cron job completed: Processed ${totalBetsProcessed} bets`);
//       return { total: totalBetsProcessed };
//     }
//   } catch (error) {
//     console.error("Error in updateFancyBetResult:", error);
//     if (res && typeof res.status === "function") {
//       return res.status(500).json({ message: "Server error" });
//     }
//     throw error; // Let the cron job handle the error
//   }
// };

export const updateResultOfBetsHistory = async (req, res) => {
  // Combined bet types for both sports and casino
  //Category is added as new filed here for both sports and casino
  const betTypes = [
    // Sports bet types
    { gameType: "Toss", marketName: "Toss", category: "sports" },
    { gameType: "1st 6 over", marketName: "T1st 6 over", category: "sports" },
    { gameType: "Match Odds", marketName: "Match Odds", category: "sports" },
    { gameType: "Tied Match", marketName: "Tied Match", category: "sports" },
    { gameType: "Bookmaker", marketName: "Bookmaker", category: "sports" },
    { gameType: "MATCH_ODDS_SB", marketName: "MATCH_ODDS_SB", category: "sports" },
    {
      gameType: "Bookmaker IPL CUP",
      marketName: "Bookmaker IPL CUP",
      category: "sports",
    },
    {
      gameType: "OVER_UNDER_05",
      marketName: "OVER_UNDER_05",
      category: "sports",
    },
    {
      gameType: "OVER_UNDER_15",
      marketName: "OVER_UNDER_15",
      category: "sports",
    },
    {
      gameType: "OVER_UNDER_25",
      marketName: "OVER_UNDER_25",
      category: "sports",
    },
   
  ];

  let totalBetsProcessed = 0;

  try {
    for (const { gameType, marketName, category } of betTypes) {
      const filterQuery = { status: 0, gameType };
      if (category === "casino") {
        filterQuery.betType = "casino"; // Additional filter for casino bets
      }

      const bets = await betHistoryModel.find(filterQuery);
      console.log("bets pending to update result from betHistoryModel", bets);

      if (!bets.length) {
        continue;
      }

      const groupedBets = bets.reduce((acc, bet) => {
        // Different grouping strategy for casino vs sports
        //Casino:group by gameId and roundId
        //Sports:group by gameId
        const key =
          category === "casino"
            ? `${bet.gameId}_${bet.roundId}` // Casino: group by gameId and roundId
            : bet.gameId; // Sports: group by gameId only

        if (!acc[key]) acc[key] = [];
        acc[key].push(bet);
        return acc;
      }, {});

      for (const groupKey of Object.keys(groupedBets)) {
        try {
          for (const bet of groupedBets[groupKey]) {
            const user = await SubAdmin.findById(bet.userId);
            const agent =
              user.invite && user.commission > 0
                ? await SubAdmin.findOne({ code: user.invite, role: "agent" })
                : null;
            if (!user) {
              // console.warn(User not found for userId ${bet.userId});
              continue;
            }

            let response;
            if (process.env.DEV_LOCAL_SETTLE_ENABLED === "0") {
              // For development/testing
              response = {
                data: {
                  final_result:
                    category === "casino" ? "PLAYER A" : "Daniel Elahi Galan",
                },
              };
            } else {
              // Different API calls for sports vs casino
              if (category === "sports") {
                const PROXY_BASE_URL =
                  process.env.PROXY_BASE_URL || "https://shubdxinternational.com";
                const sid = Number(bet.sid);
                let endpoint;
                if (sid === 4) {
                  endpoint = `${PROXY_BASE_URL}/${SETTLEMENT_ID}/betsreport-4`;
                } else if (sid === 2) {
                  endpoint = `${PROXY_BASE_URL}/${SETTLEMENT_ID}/betsreport-2`;
                } else if (sid === 1) {
                  endpoint = `${PROXY_BASE_URL}/${SETTLEMENT_ID}/betsreport-1`;
                } else {
                  console.warn(`Unsupported sid ${sid} for bet ${bet._id}`);
                  continue;
                }

                response = await axiosIPv4.get(endpoint, {
                  // Add query params if provider requires them later
                });
              } else {
                // Casino API call

                response = await axios.get(
                  `https://api.cricketid.xyz/casino/detail_result?key=demo123&type=${bet.gameId}&mid=${bet.roundId}`,
                  {
                    game_id: bet.gameId,
                    round_id: bet.roundId,
                    market_id: bet.market_id,
                    market_name: bet.marketName,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      key: "demo123",
                    },
                    withCredentials: true,
                  }
                );
              }
            }

            const resultData = response?.data;
            console.log("[updateResultOfBetsHistory]", resultData);

            if (!resultData) {
              continue;
            }

        

            // let winner;
            // if (category === "casino") {
            //   winner = resultData?.data?.t1?.winnat;
            // } else {
            //   const winnerSource = Array.isArray(resultData)
            //     ? resultData.find(
            //         (entry) =>
            //           String(entry?.event_id) === String(bet.gameId) &&
            //           (!bet.market_id ||
            //             String(entry?.market_id) === String(bet.market_id))
            //       ) || resultData[0]
            //     : resultData;

            //   const rawWinner =
            //     winnerSource?.final_result ||
            //     winnerSource?.selection ||
            //     winnerSource?.winner ||
            //     winnerSource?.result ||
            //     winnerSource?.winner_name;
            //   winner = rawWinner?.trim();
            // }

            // if (!winner) {
            //   continue;
            // }
            // const betTeam = bet.teamName?.trim();
            // let winAmount = 0;

            // const win =
            //   winner &&
            //   betTeam &&
            //   winner.toLowerCase() === betTeam.toLowerCase();
            // Around line 2094-2125, replace the winner extraction and win logic:

let winner;
let matchedEntry = null; // Add this to track the matched entry

if (category === "casino") {
  winner = resultData?.data?.t1?.winnat;
} else {
  // Find the matched entry first (similar to updateResultOfBets)
  // matchedEntry = Array.isArray(resultData)
  //   ? resultData.find(
  //       (entry) =>
  //         String(entry?.event_id) === String(bet.gameId) &&
  //         (!bet.market_id ||
  //           String(entry?.market_id) === String(bet.market_id))
  //     )
  //   : null;
  if (!bet.betId && !bet.bet_id) {
    console.log(`Skipping bet ${bet._id} - no betId found`);
    continue;
  }
  
  matchedEntry = Array.isArray(resultData)
    ? resultData.find(
        (entry) => String(entry?.bet_id) === String(bet.betId || bet.bet_id)
      )
    : null;
  
  if (!matchedEntry) {
    console.log(`No matched entry found for bet ${bet._id}, betId: ${bet.betId}`);
    continue;
  }

  const winnerSource = matchedEntry || (Array.isArray(resultData) ? resultData[0] : resultData);

  const rawWinner =
    winnerSource?.final_result ||
    winnerSource?.selection ||
    winnerSource?.winner ||
    winnerSource?.status ||  // ADD THIS - same as updateResultOfBets
    winnerSource?.result ||
    winnerSource?.winner_name;
  winner = rawWinner?.trim();
}

if (!winner) {
  continue;
}

const betTeam = bet.teamName?.trim();
let winAmount = 0;

// CHANGE THIS - Use status field like updateResultOfBets does
// if (matchedEntry?.status === 'Pending') {
//   console.log(`Skipping bet   - status is Pending`);
//   continue; // Skip to next bet
// }
// const win = matchedEntry?.status === 'Won';
if (matchedEntry?.status === 'Pending') {
  console.log(`Skipping bet ${bet._id} for game ${bet.gameId} - status is Pending`);
  continue; // Skip to next bet
}
const win = matchedEntry?.status === 'Won';
// Remove the old logic:
// const win = winner && betTeam && winner.toLowerCase() === betTeam.toLowerCase();

console.log(`Bet ${bet._id} | Status: ${matchedEntry?.status} | Win: ${win}`);

            // console.log(${category} Bet ${bet._id} | Winner: ${winner} | Team: ${betTeam} | Win: ${win});

            //Settlement Logic
            if (
              bet.gameType === "Match Odds" ||
              bet.gameType === "Tied Match" ||
              bet.gameType === "MATCH_ODDS_SB"||
              bet.gameType === "casino" // Casino uses same logic as Match Odds
            ) {
              if (bet.otype === "back") {
                if (win) {
                  winAmount = bet.betAmount;
                  bet.resultAmount = winAmount;
                  bet.betResult = winner;
                  bet.status = 1;
                } else {
                  bet.resultAmount = bet.price;
                  bet.betResult = winner;
                  bet.status = 2;
                }
              } else {
                // lay
                if (win) {
                  bet.resultAmount = bet.price;
                  bet.betResult = winner;
                  bet.status = 2;
                } else {
                  winAmount = bet.betAmount;
                  bet.resultAmount = winAmount; // Fixed: was using undefined 'stake'
                  bet.betResult = winner;
                  bet.status = 1;
                }
              }
            } else if (
              gameType === "Bookmaker" ||
              gameType === "Bookmaker IPL CUP"
            ) {
              if (bet.otype === "back") {
                if (win) {
                  winAmount = bet.betAmount + bet.price;
                  bet.resultAmount = winAmount;
                  bet.betResult = winner;
                  bet.status = 1;
                } else {
                  bet.resultAmount = bet.price;
                  bet.betResult = winner;
                  bet.status = 2;
                }
              } else {
                // lay
                if (win) {
                  bet.resultAmount = bet.price;
                  bet.betResult = winner;
                  bet.status = 2;
                } else {
                  winAmount = bet.betAmount + bet.price;
                  bet.resultAmount = winAmount;
                  bet.betResult = winner;
                  bet.status = 1;
                }
              }
            } else if (gameType === "Toss" || gameType === "1st 6 over") {
              if (win) {
                winAmount = bet.betAmount + bet.price;
                bet.resultAmount = winAmount;
                bet.betResult = winner;
                bet.status = 1;
              } else {
                bet.betResult = winner;
                bet.status = 2;
                bet.resultAmount = bet.price;
              }
            }else if (
              gameType === "OVER_UNDER_05" ||
              gameType === "OVER_UNDER_15" ||
              gameType === "OVER_UNDER_25"
            ) {
              if (win) {
                winAmount = bet.betAmount + bet.price;
            
                bet.resultAmount = winAmount;
                bet.betResult = winner;
                bet.status = 1;
              } else {
                bet.resultAmount = bet.price;
                bet.betResult = winner;
                bet.status = 2;
              }
            }
            

            // Update user balance for winning bets
            if (winAmount > 0) {
              user.balance = parseFloat((user.balance + winAmount).toFixed(2));
              user.avbalance = parseFloat(
                (user.avbalance + winAmount).toFixed(2)
              );
              await user.save();
            }

            await bet.save();
            totalBetsProcessed++;
          }
        } catch (err) {
          console.log("error in updateResultOfBetsHistory", err);
          console.error(
            `Error processing ${category} group ${groupKey}:`,
            err.message
          );
        }
      }
    }

    // Handle response differently for HTTP vs cron
    if (res && typeof res.status === "function") {
      return res.status(200).json({
        message: "All sports and casino bets processed successfully",
        total: totalBetsProcessed,
      });
    } else {
      // console.log(Cron job completed: Processed ${totalBetsProcessed} bets);
      return { success: true, total: totalBetsProcessed };
    }
  } catch (error) {
    console.error("Error in updateResultOfBets:", error);

    if (res && typeof res.status === "function") {
      return res.status(500).json({ message: "Server error" });
    } else {
      throw error; // Let the cron job handle the error
    }
  }
};
// export const updateFancyBetResult = async (req, res) => {
//   console.log("The Update Fancy Bet Result is called");
//   try {
//     const betTypes = [
//       { gameType: "Normal", marketName: "Toss" },
//       { gameType: "meter", marketName: "Match Odds" },
//       { gameType: "line", marketName: "Tied Match" },
//       { gameType: "ball", marketName: "Bookmaker" },
//       { gameType: "khado", marketName: "Bookmaker" },
//     ];

//     let totalBetsProcessed = 0;

//     for (const { gameType, marketName } of betTypes) {
//       const bets = await betModel.find({ status: 0, gameType });
    

//       if (!bets.length) {
//         console.log(`No ${gameType} bets found with status 0`);
//         continue;
//       }

//       // Group bets by gameId
//       const groupedBets = bets.reduce((acc, bet) => {
//         if (!acc[bet.gameId]) acc[bet.gameId] = [];
//         acc[bet.gameId].push(bet);
//         return acc;
//       }, {});

//       for (const gameId of Object.keys(groupedBets)) {
//         try {
         

//           for (const bet of groupedBets[gameId]) {
//             const PROXY_BASE_URL =
//               process.env.PROXY_BASE_URL || "http://localhost:5000";
            
//             const endpoint = `${PROXY_BASE_URL}/${SETTLEMENT_ID}/betsreport-4`;

//             const response = await axiosIPv4.get(endpoint, {
//               params: {
//                 event_id: bet.gameId,
//                 market_id: bet.market_id,
//                 bet_id: bet.betId || bet.bet_id,
//               },
//             });

//             const resultData = response.data;
//             if (!resultData) {
//               continue;
//             }

//             console.log("resultData from fancy bet result", resultData);
//               //This is the score what user has bet on
//             // const fancyScore = bet.fancyScore;
//             // //This is the api response score from the api call
//             // const score=resultData?.fancy_result || resultData?.final_result;

//             // const win = score && fancyScore && fancyScore >= score;
//             // console.log("winnn", win);

//             // const betTeam = bet.teamName?.trim();
//             // let winAmount = 0;
//             const matchedEntry = Array.isArray(resultData)
//       ? resultData.find(
//           (entry) =>
//             String(entry?.bet_id) === String(bet.betId || bet.bet_id) ||
//             (String(entry?.event_id) === String(bet.gameId) &&
//               (!bet.market_id ||
//                 String(entry?.market_id) === String(bet.market_id)))
//         )
//       : resultData;

//     // Check if status is Pending - skip this individual bet
//     if (matchedEntry?.status === 'Pending') {
//       console.log(`Skipping fancy bet ${bet._id} for game ${bet.gameId} - status is Pending`);
//       continue; // Skip to next bet
//     }

//     // Extract score from matched entry
//     const fancyScore = bet.fancyScore;
//     const score = matchedEntry?.fancy_result || matchedEntry?.final_result;
//     console.log("score", score);
//     console.log("fancyScore", fancyScore);

//     if (!score && !fancyScore) {
//       console.log(`No score found for bet ${bet._id}, skipping`);
//       continue;
//     }
//     const win = score && fancyScore && parseFloat(fancyScore) >= parseFloat(score);
//     console.log(`Bet ${bet._id} | FancyScore: ${fancyScore} | API Score: ${score} | Win: ${win} | Status: ${matchedEntry?.status}`);

//     const betTeam = bet.teamName?.trim();
//     let winAmount = 0;
//             // console.log("result responce", response)

//             const user = await SubAdmin.findById(bet.userId);

//             if (!user) {
//               // console.warn(User not found for userId ${bet.userId});
//               continue;
//             }
//             console.log("processing bet");
//             // Process bet based on otype
//             if (bet.otype === "Yes") {
//               console.log("processing back bet");
//               if (win) {
//                 winAmount = bet.betAmount + bet.price;
//                 user.balance += winAmount;
//                 user.avbalance += winAmount;
//                 user.profitLoss += winAmount;
//                 user.exposure -= bet.price; // Adjust exposure
//                 bet.resultAmount = winAmount;
//                 bet.betResult = score;
//                 bet.status = 1; // Mark as won
//                 if (agent) {
//                   const commissionAmount = Number(
//                     (winAmount * user.commission) / 100
//                   );
//                   user.balance -= commissionAmount;
//                   user.avbalance -= commissionAmount;
//                   user.profitLoss -= commissionAmount;
//                   agent.balance += commissionAmount;
//                   agent.avbalance += commissionAmount;
//                   agent.profitLoss += commissionAmount;
//                   await agent.save();
//                 }
//               } else {
//                 user.balance -= bet.price;
//                 user.profitLoss -= bet.price;
//                 user.exposure -= bet.price; // Adjust exposure
//                 bet.resultAmount = bet.price;
//                 bet.betResult = score;
//                 bet.status = 2; // Mark as lost
//               }
//             } else {
//               console.log("processing lay bet");
//               if (win) {
//                 console.log("processing win lay bet");
//                 user.balance -= bet.price;
//                 user.profitLoss -= bet.price;
//                 user.exposure -= bet.price; // Adjust exposure
//                 bet.resultAmount = bet.price;
//                 bet.betResult = score;
//                 bet.status = 2; // Mark as lost (for lay bets)
//               } else {
//                 console.log("processing lose lay bet");
//                 winAmount = bet.betAmount + bet.price;
//                 user.balance += winAmount;
//                 user.avbalance += winAmount;
//                 user.exposure -= bet.price; // Adjust exposure
//                 user.profitLoss += winAmount;
//                 bet.resultAmount = winAmount;
//                 bet.betResult = score;
//                 bet.status = 1; // Mark as won (for lay bets)
//                 console.log("bet status",bet.status);
//                 try{
//                   if (agent) {
//                     const commissionAmount = Number(
//                       (winAmount * user.commission) / 100
//                     );
//                     user.balance -= commissionAmount;
//                     user.avbalance -= commissionAmount;
//                     user.profitLoss -= commissionAmount;
//                     agent.balance += commissionAmount;
//                     agent.avbalance += commissionAmount;
//                     agent.profitLoss += commissionAmount;
//                     await agent.save();
//                   }
//                 }catch(err){
//                   console.log("error in processing lose lay bet",err);
//                 }
//               }
//             }
//            console.log("bet processing complete");
//             // bet.resultAmount = winAmount;
//             console.log("user",user);
//             console.log("bet",bet);
//             await user.save();
//             await bet.save();
//             console.log("user saved",user);
//             console.log("bet saved",bet);
//             totalBetsProcessed++;
//           }
//         } catch (err) {
//           // console.error(Error processing gameId ${gameId}:, err.message);
//         }
//       }
//     }

//     // Handle response differently for cron vs HTTP
//     if (res && typeof res.status === "function") {
//       return res.status(200).json({
//         message: "All bets processed successfully",
//         total: totalBetsProcessed,
//       });
//     } else {
//       // console.log(Cron job completed: Processed ${totalBetsProcessed} bets);
//       return { total: totalBetsProcessed };
//     }
//   } catch (error) {
//     console.error("Error in updateFancyBetResult:", error);
//     if (res && typeof res.status === "function") {
//       return res.status(500).json({ message: "Server error" });
//     }
//     throw error; // Let the cron job handle the error
//   }
// };

export const updateFancyBetResult = async (req, res) => {
  console.log("The Update Fancy Bet Result is called");
  try {
    const betTypes = [
      { gameType: "Normal", marketName: "Toss" },
      { gameType: "meter", marketName: "Match Odds" },
      { gameType: "line", marketName: "Tied Match" },
      { gameType: "ball", marketName: "Bookmaker" },
      { gameType: "khado", marketName: "Bookmaker" },
    ];

    let totalBetsProcessed = 0;

    for (const { gameType } of betTypes) {
      const bets = await betModel.find({ status: 0, gameType });
      console.log("bets from fancy bet result", bets);

      if (!bets.length) continue;

      const groupedBets = bets.reduce((acc, bet) => {
        acc[bet.gameId] = acc[bet.gameId] || [];
        acc[bet.gameId].push(bet);
        return acc;
      }, {});

      for (const gameId of Object.keys(groupedBets)) {
        for (const bet of groupedBets[gameId]) {
          const endpoint = `${process.env.PROXY_BASE_URL}/${SETTLEMENT_ID}/betsreport-4`;

          const response = await axiosIPv4.get(endpoint, {
            
          });

          const resultData = response.data;
          if (!resultData) continue;
          console.log("resultData from fancy bet result", resultData);

          // const matchedEntry = Array.isArray(resultData)
          //   ? resultData.find(
          //       (e) =>
          //         String(e.bet_id) === String(bet.betId || bet.bet_id)
          //     )
          //   : resultData;
          // console.log("matchedEntry from fancy bet result", matchedEntry);

          // if (!matchedEntry || matchedEntry.status === "Pending") continue;
//           const matchedEntry = Array.isArray(resultData)
//   ? resultData.find(
//       (e) =>
//         String(e.bet_id) === String(bet.betId || bet.bet_id)
//     )
//   : null; // ✅ FIX: Return null if not array, don't use resultData directly

// if (!matchedEntry) {
//   console.log(`No matched entry found for bet ${bet._id}, betId: ${bet.betId}`);
//   continue;
// }

// // ✅ FIX: Case-insensitive check
// const status = String(matchedEntry.status || "").toLowerCase();
// if (status === "pending") {
//   console.log(`Skipping bet ${bet._id} - status is Pending`);
//   continue;
// }
if (!bet.betId && !bet.bet_id) {
  console.log(`Skipping bet ${bet._id} - no betId found`);
  continue;
}

const matchedEntry = Array.isArray(resultData)
  ? resultData.find(
      (e) => String(e.bet_id) === String(bet.betId || bet.bet_id)
    )
  : null;

if (!matchedEntry) {
  console.log(`No matched entry found for bet ${bet._id}, betId: ${bet.betId}`);
  continue;
}

// ✅ FIX: Case-insensitive check
const status = String(matchedEntry.status || "").toLowerCase();
if (status === "pending") {
  console.log(`Skipping bet ${bet._id} - status is Pending`);
  continue;
}

          const fancyScore = Number(bet.fancyScore);
          const score = Number(
            matchedEntry.fancy_result ?? matchedEntry.final_result
          );

          if (Number.isNaN(score) || Number.isNaN(fancyScore)) continue;

          // ✅ FIXED WIN LOGIC
          let win = false;
          if (bet.otype === "back") {
            win = score <= fancyScore;
          } else {
            win = score > fancyScore;
          }

          const user = await SubAdmin.findById(bet.userId);
          if (!user) continue;

          let winAmount = 0;

          if (bet.otype === "back") {
            if (win) {
              winAmount = bet.betAmount + bet.price;
              user.balance += winAmount;
              user.avbalance += winAmount;
              user.profitLoss += winAmount;
              bet.status = 1;
              bet.resultAmount = winAmount;
            } else {
              user.balance -= bet.price;
              user.profitLoss -= bet.price;
              bet.status = 2;
              bet.resultAmount = bet.price;
            }
          // } else {
          //   if (win) {
          //     user.balance -= bet.price;
          //     user.profitLoss -= bet.price;
          //     bet.status = 2;
          //     bet.resultAmount = bet.price;
          //   } else {
          //     winAmount = bet.betAmount + bet.price;
          //     user.balance += winAmount;
          //     user.avbalance += winAmount;
          //     user.profitLoss += winAmount;
          //     bet.status = 1;
          //     bet.resultAmount = winAmount;
          //   }
          // }
        } else {
          if (win) {
            winAmount = bet.betAmount + bet.price;
            user.balance += winAmount;
            user.avbalance += winAmount;
            user.profitLoss += winAmount;
            bet.status = 1;
            bet.resultAmount = winAmount;
          } else {
            user.balance -= bet.price;
            user.profitLoss -= bet.price;
            bet.status = 2;
            bet.resultAmount = bet.price;
          }
        }
        

          user.exposure -= bet.price;
          bet.betResult = score;

          await user.save();
          await bet.save();
          totalBetsProcessed++;
        }
      }
    }

    return res?.status(200).json({
      message: "All bets processed successfully",
      total: totalBetsProcessed,
    });
  } catch (error) {
    console.error("Error in updateFancyBetResult:", error);
    return res?.status(500).json({ message: "Server error" });
  }
};

// export const updateFancyBetResult = async (req, res) => {
//   console.log("updateFancyBetResult called");

//   try {
//     let totalBetsProcessed = 0;

//     const bets = await betModel.find({ status: 0 });

//     for (const bet of bets) {
//       if (!bet?.betId) continue;

//       const endpoint = `${process.env.PROXY_BASE_URL}/${SETTLEMENT_ID}/betsreport-4`;
//       const response = await axiosIPv4.get(endpoint);
//       const resultData = response?.data;

//       let settlements = [];

//       if (Array.isArray(resultData)) {
//         settlements = resultData;
//       } else if (Array.isArray(resultData?.data)) {
//         settlements = resultData.data;
//       } else {
//         console.log("Invalid settlement response", resultData);
//         continue;
//       }

//       const matchedEntry = settlements.find(
//         (e) => e && String(e.bet_id) === String(bet.betId)
//       );

//       if (!matchedEntry) continue;

//       const rawStatus = matchedEntry?.status;
//       if (!rawStatus) continue;

//       const apiStatus = String(rawStatus).toLowerCase();
//       if (apiStatus === "pending") continue;

//       if (bet.status !== 0) continue;

//       const score = Number(
//         matchedEntry?.fancy_result ?? matchedEntry?.final_result
//       );

//       const fancyScore = Number(bet.fancyScore);

//       if (Number.isNaN(score) || Number.isNaN(fancyScore)) continue;

//       let win;
//       if (apiStatus === "won") win = true;
//       else if (apiStatus === "lost") win = false;
//       else {
//         win =
//           bet.otype === "Yes"
//             ? score <= fancyScore
//             : score > fancyScore;
//       }

//       const user = await SubAdmin.findById(bet.userId);
//       if (!user) continue;

//       let resultAmount;

//       if (win) {
//         resultAmount = bet.betAmount + bet.price;
//         user.balance += resultAmount;
//         user.avbalance += resultAmount;
//         user.profitLoss += resultAmount;
//         bet.status = 1;
//       } else {
//         resultAmount = bet.price;
//         user.balance -= bet.price;
//         user.profitLoss -= bet.price;
//         bet.status = 2;
//       }

//       user.exposure -= bet.price;

//       bet.resultAmount = resultAmount;
//       bet.betResult = score;

//       await user.save();
//       await bet.save();

//       totalBetsProcessed++;
//     }

//     return res.status(200).json({
//       message: "Fancy bets settled successfully",
//       total: totalBetsProcessed,
//     });
//   } catch (error) {
//     console.error("updateFancyBetResult error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };




// export const updateFancyBetHistory = async (req, res) => {
//   try {
//     const betTypes = [
//       { gameType: "Normal", marketName: "Toss" },
//       { gameType: "meter", marketName: "Match Odds" },
//       { gameType: "line", marketName: "Tied Match" },
//       { gameType: "ball", marketName: "Bookmaker" },
//       { gameType: "khado", marketName: "Bookmaker" },
//     ];

//     let totalBetsProcessed = 0;

//     for (const { gameType, marketName } of betTypes) {
//       const bets = await betHistoryModel.find({ status: 0, gameType });

//       if (!bets.length) {
//         // console.log(`No ${gameType} bets found with status 0`);
//         continue;
//       }

//       // Group bets by gameId
//       const groupedBets = bets.reduce((acc, bet) => {
//         if (!acc[bet.gameId]) acc[bet.gameId] = [];
//         acc[bet.gameId].push(bet);
//         return acc;
//       }, {});

//       for (const gameId of Object.keys(groupedBets)) {
//         try {
//           // const response = await axios.get(`https://api.cricketid.xyz/v2/result?key=uniique5557878&gmid=${gameId}&sid=4`);
//           // const resultData = response.data;

//           for (const bet of groupedBets[gameId]) {
//             const sid = bet.sid; // ✅ ensure this is defined

//             const response = await axios.post(
//               `https://api.cricketid.xyz/get-result?key=uniique5557878&sid=${sid}`,
//               {
//                 event_id: Number(bet.gameId),
//                 event_name: bet.eventName,
//                 market_id: bet.market_id,
//                 market_name: bet.marketName,
//               },
//               {
//                 headers: {
//                   "Content-Type": "application/json",
//                   key: "uniique5557878",
//                 },
//                 withCredentials: true,
//               }
//             );

//             const resultData = response.data;
//             if (!resultData) {
//               continue;
//             }

//             console.log("resultData", resultData);

//             const fancyScore = bet.fancyScore;
//             const score = resultData.final_result;

//             const win = score && fancyScore && fancyScore >= score;
//             console.log("winnn", win);

//             const betTeam = bet.teamName?.trim();
//             let winAmount = 0;

//             // console.log("result responce", response)

//             const user = await SubAdmin.findById(bet.userId);

//             if (!user) {
//               // console.warn(`User not found for userId ${bet.userId}`);
//               continue;
//             }
//             // Process bet based on otype
//             if (bet.otype === "back") {
//               if (win) {
//                 winAmount = bet.betAmount + bet.price;
//                 bet.resultAmount = winAmount;
//                 // user.balance += winAmount;
//                 // user.avbalance += winAmount;
//                 bet.betResult = score;
//                 bet.status = 1; // Mark as won
//               } else {
//                 bet.resultAmount = bet.price;
//                 bet.betResult = score;
//                 bet.status = 2; // Mark as lost
//               }
//             } else {
//               if (win) {
//                 bet.resultAmount = bet.price;
//                 bet.betResult = score;
//                 bet.status = 2; // Mark as lost (for lay bets)
//               } else {
//                 winAmount = bet.betAmount + bet.price;
//                 bet.resultAmount = winAmount;
//                 // user.balance += winAmount;
//                 // user.avbalance += winAmount;
//                 bet.betResult = score;
//                 bet.status = 1; // Mark as won (for lay bets)
//               }
//             }

//             await user.save();
//             await bet.save();
//             totalBetsProcessed++;
//           }
//         } catch (err) {
//           // console.error(`Error processing gameId ${gameId}:`, err.message);
//         }
//       }
//     }

//     // Handle response differently for cron vs HTTP
//     if (res && typeof res.status === "function") {
//       return res.status(200).json({
//         message: "All bets processed successfully",
//         total: totalBetsProcessed,
//       });
//     } else {
//       // console.log(`Cron job completed: Processed ${totalBetsProcessed} bets`);
//       return { total: totalBetsProcessed };
//     }
//   } catch (error) {
//     console.error("Error in updateFancyBetResult:", error);
//     if (res && typeof res.status === "function") {
//       return res.status(500).json({ message: "Server error" });
//     }
//     throw error; // Let the cron job handle the error
//   }
// };

// export const updateFancyBetHistory = async (req, res) => {
//   try {
//     const betTypes = [
//       { gameType: "Normal", marketName: "Toss" },
//       { gameType: "meter", marketName: "Match Odds" },
//       { gameType: "line", marketName: "Tied Match" },
//       { gameType: "ball", marketName: "Bookmaker" },
//       { gameType: "khado", marketName: "Bookmaker" },
//     ];

//     let totalBetsProcessed = 0;

//     for (const { gameType, marketName } of betTypes) {
//       const bets = await betHistoryModel.find({ status: 0, gameType });

//       if (!bets.length) {
//         // console.log(No ${gameType} bets found with status 0);
//         continue;
//       }

//       // Group bets by gameId
//       const groupedBets = bets.reduce((acc, bet) => {
//         if (!acc[bet.gameId]) acc[bet.gameId] = [];
//         acc[bet.gameId].push(bet);
//         return acc;
//       }, {});

//       for (const gameId of Object.keys(groupedBets)) {
//         try {
//           for (const bet of groupedBets[gameId]) {
//             const PROXY_BASE_URL =
//               process.env.PROXY_BASE_URL || "http://localhost:5000";
//             const endpoint = `${PROXY_BASE_URL}/${SETTLEMENT_ID}/betsreport-4`;

//             const response = await axiosIPv4.get(endpoint, {
//               params: {
//                 event_id: bet.gameId,
//                 market_id: bet.market_id,
//                 bet_id: bet.betId || bet.bet_id,
//               },
//             });

//             const resultData = response.data;
//             if (!resultData) {
//               continue;
//             }

//             console.log("resultData", resultData);

//             // const fancyScore = bet.fancyScore;
//             // const score = resultData.final_result;

//             // const win = score && fancyScore && fancyScore >= score;
//             // console.log("winnn", win);

//             // const betTeam = bet.teamName?.trim();
//             // let winAmount = 0;

//             const matchedEntry = Array.isArray(resultData)
//       ? resultData.find(
//           (entry) =>
//             String(entry?.bet_id) === String(bet.betId || bet.bet_id) ||
//             (String(entry?.event_id) === String(bet.gameId) &&
//               (!bet.market_id ||
//                 String(entry?.market_id) === String(bet.market_id)))
//         )
//       : resultData;

//     // Check if status is Pending - skip this individual bet
//     if (matchedEntry?.status === 'Pending') {
//       console.log(`Skipping fancy bet ${bet._id} for game ${bet.gameId} - status is Pending`);
//       continue; // Skip to next bet
//     }

//     const fancyScore = bet.fancyScore;
//     const score = matchedEntry?.fancy_result || matchedEntry?.final_result;

//     if (!score && !fancyScore) {
//       console.log(`No score found for bet ${bet._id}, skipping`);
//       continue;
//     }

//     const win = score && fancyScore && parseFloat(fancyScore) >= parseFloat(score);
//     console.log(`Bet ${bet._id} | FancyScore: ${fancyScore} | API Score: ${score} | Win: ${win} | Status: ${matchedEntry?.status}`);

//     const betTeam = bet.teamName?.trim();
//     let winAmount = 0;

//             // console.log("result responce", response)

//             const user = await SubAdmin.findById(bet.userId);

//             if (!user) {
//               // console.warn(User not found for userId ${bet.userId});
//               continue;
//             }
//             // Process bet based on otype
//             if (bet.otype === "Yes") {
//               if (win) {
//                 winAmount = bet.betAmount + bet.price;
//                 bet.resultAmount = winAmount;
//                 // user.balance += winAmount;
//                 // user.avbalance += winAmount;
//                 bet.betResult = score;
//                 bet.status = 1; // Mark as won
//               } else {
//                 bet.resultAmount = bet.price;
//                 bet.betResult = score;
//                 bet.status = 2; // Mark as lost
//               }
//             } else {
//               if (win) {
//                 bet.resultAmount = bet.price;
//                 bet.betResult = score;
//                 bet.status = 2; // Mark as lost (for lay bets)
//               } else {
//                 winAmount = bet.betAmount + bet.price;
//                 bet.resultAmount = winAmount;
//                 // user.balance += winAmount;
//                 // user.avbalance += winAmount;
//                 bet.betResult = score;
//                 bet.status = 1; // Mark as won (for lay bets)
//               }
//             }

//             await user.save();
//             await bet.save();
//             totalBetsProcessed++;
//           }
//         } catch (err) {
//           // console.error(Error processing gameId ${gameId}:, err.message);
//         }
//       }
//     }

//     // Handle response differently for cron vs HTTP
//     if (res && typeof res.status === "function") {
//       return res.status(200).json({
//         message: "All bets processed successfully",
//         total: totalBetsProcessed,
//       });
//     } else {
//       // console.log(Cron job completed: Processed ${totalBetsProcessed} bets);
//       return { total: totalBetsProcessed };
//     }
//   } catch (error) {
//     console.error("Error in updateFancyBetResult:", error);
//     if (res && typeof res.status === "function") {
//       return res.status(500).json({ message: "Server error" });
//     }
//     throw error; // Let the cron job handle the error
//   }
// };

export const updateFancyBetHistory = async (req, res) => {
  try {
    let totalBetsProcessed = 0;

    const bets = await betHistoryModel.find({ status: 0 });

    for (const bet of bets) {
      const endpoint = `${process.env.PROXY_BASE_URL}/${SETTLEMENT_ID}/betsreport-4`;

      const response = await axiosIPv4.get(endpoint, {
        
      });

      const resultData = response.data;
      if (!resultData) continue;

      // const matchedEntry = Array.isArray(resultData)
      //   ? resultData.find(
      //       (e) =>
      //         String(e.bet_id) === String(bet.betId || bet.bet_id)
      //     )
      //   : resultData;

      // if (!matchedEntry || matchedEntry.status === "Pending") continue;
//       const matchedEntry = Array.isArray(resultData)
//   ? resultData.find(
//       (e) =>
//         String(e.bet_id) === String(bet.betId || bet.bet_id)
//     )
//   : null; // ✅ FIX: Return null if not array, don't use resultData directly

// if (!matchedEntry) {
//   console.log(`No matched entry found for bet ${bet._id}, betId: ${bet.betId}`);
//   continue;
// }

// // ✅ FIX: Case-insensitive check
// const status = String(matchedEntry.status || "").toLowerCase();
// if (status === "pending") {
//   console.log(`Skipping bet ${bet._id} - status is Pending`);
//   continue;
// }
if (!bet.betId && !bet.bet_id) {
  console.log(`Skipping bet ${bet._id} - no betId found`);
  continue;
}

const matchedEntry = Array.isArray(resultData)
  ? resultData.find(
      (e) => String(e.bet_id) === String(bet.betId || bet.bet_id)
    )
  : null;

if (!matchedEntry) {
  console.log(`No matched entry found for bet ${bet._id}, betId: ${bet.betId}`);
  continue;
}

// ✅ FIX: Case-insensitive check
const status = String(matchedEntry.status || "").toLowerCase();
if (status === "pending") {
  console.log(`Skipping bet ${bet._id} - status is Pending`);
  continue;
}
      const fancyScore = Number(bet.fancyScore);
      const score = Number(
        matchedEntry.fancy_result ?? matchedEntry.final_result
      );

      if (Number.isNaN(score) || Number.isNaN(fancyScore)) continue;

      // ✅ FIXED WIN LOGIC
      let win = false;
      if (bet.otype === "back") {
        win = score <= fancyScore;
      } else {
        win = score > fancyScore;
      }

      bet.betResult = score;
      bet.resultAmount = win
        ? bet.betAmount + bet.price
        : bet.price;
      bet.status = win ? 1 : 2;

      await bet.save();
      totalBetsProcessed++;
    }

    return res?.status(200).json({
      message: "All bets processed successfully",
      total: totalBetsProcessed,
    });
  } catch (error) {
    console.error("Error in updateFancyBetHistory:", error);
    return res?.status(500).json({ message: "Server error" });
  }
};

// export const updateFancyBetHistory = async (req, res) => {
//   console.log("updateFancyBetHistory called");

//   try {
//     let totalSynced = 0;

//     const historyBets = await betHistoryModel.find({ status: 0 });

//     for (const historyBet of historyBets) {
//       if (!historyBet.betId) continue;

//       const mainBet = await betModel.findOne({
//         betId: historyBet.betId,
//         status: { $in: [1, 2] }, // settled only
//       });

//       if (!mainBet) continue;

//       // ✅ COPY RESULT (NO CALCULATION)
//       historyBet.status = mainBet.status;
//       historyBet.resultAmount = mainBet.resultAmount;
//       historyBet.betResult = mainBet.betResult;
//       historyBet.updatedAt = new Date();

//       await historyBet.save();
//       totalSynced++;
//     }

//     return res.status(200).json({
//       message: "Fancy bet history synced successfully",
//       total: totalSynced,
//     });
//   } catch (error) {
//     console.error("updateFancyBetHistory error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

export const getPendingBets = async (req, res) => {
  const { id } = req;
  let { gameId } = req.query;

  try {
    const query = {
      userId: id,
      status: 0,
    };

    // Only add gameId if it's not the string "undefined"
    if (gameId && gameId !== "undefined") {
      query.gameId = gameId;
    }

    // console.log("Built Query =>", query);

    const bets = await betHistoryModel.find(query).sort({ createdAt: -1 });
    console.log("The fetched bets are", bets);

    // console.log("Fetched Bets =>", bets);

    return res.status(200).json({ data: bets });
  } catch (error) {
    console.error("Error fetching bets:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPendingBetsAmounts = async (req, res) => {
  const { id } = req;
  const { gameId } = req.query;

  try {
    const betTypes = [
      { gameType: "Toss", marketName: "Toss", category: "sports" },
      { gameType: "Match Odds", marketName: "Match Odds", category: "sports" },
      { gameType: "Tied Match", marketName: "Tied Match", category: "sports" },
      { gameType: "Bookmaker", marketName: "Bookmaker", category: "sports" },
      { gameType: "Normal", marketName: "Toss", category: "sports" },
      { gameType: "meter", marketName: "Match Odds", category: "sports" },
      { gameType: "line", marketName: "Tied Match", category: "sports" },
      { gameType: "ball", marketName: "Bookmaker", category: "sports" },
      { gameType: "khado", marketName: "Bookmaker", category: "sports" },
      { gameType: "Winner", marketName: "Winner", category: "sports" },
      {
        gameType: "OVER_UNDER_05",
        marketName: "OVER_UNDER_05",
        category: "sports",
      },
      {
        gameType: "OVER_UNDER_15",
        marketName: "OVER_UNDER_15",
        category: "sports",
      },
      {
        gameType: "OVER_UNDER_25",
        marketName: "OVER_UNDER_25",
        category: "sports",
      },

      //Category fo Casino
      // { gameType: "casino", marketName: "WINNER", category: "casino" },
      { gameType: "casino", marketName: "WINNER", category: "casino" },
    ];

    const validGameTypes = betTypes.map((bt) => bt.gameType);
    console.log("The validGameTypes are", validGameTypes);

    const bets = await betModel
      .find({
        userId: id,
        status: 0,
        gameId,
        gameType: { $in: validGameTypes },
      })
      .sort({ createdAt: -1 });

    // Group by gameType + teamName
    const grouped = {};

    for (const bet of bets) {
      const key = `${bet.gameType}|${bet.teamName}`;
      if (!grouped[key]) {
        grouped[key] = {
          gameType: bet.gameType,
          teamName: bet.teamName,
          otype: bet.otype,
          totalBetAmount: bet.betAmount,
          totalPrice: bet.price,
        };
      }

      // grouped[key].totalBetAmount += Number(bet.betAmount);
      // grouped[key].totalPrice += Number(bet.price);
    }

    const result = Object.values(grouped);
    console.log("The result of PendingBetAmount", result);

    // console.log("result", bets)

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching bets:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getBetHistory = async (req, res) => {
  const { id } = req; // Assuming id comes from auth middleware
  const {
    page = 1,
    limit = 10,
    startDate,
    endDate,
    selectedGame,
    selectedVoid,
  } = req.query;
 

  try {
    const query = { userId: id, status: 0 };

    // Filter by date if both start and end dates are provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    // Filter by selectedGame if provided
    if (selectedGame) {
      query.gameName = selectedGame;
    }

    // Filter by selectedVoid if provided
    if (selectedVoid === "settel") {
      query.status = { $ne: 0 }; // Not equal to 0 (settled bets)
    } else if (selectedVoid === "void") {
      query.status = 1; // Voided bets (status = 1)
    } else if (selectedVoid === "unsettle") {
      query.status = 0; // Unsettled bets (status = 0)
    }

    const bets = await betHistoryModel
      .find(query)
      .sort({ date: -1 }) // most recent first
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await betHistoryModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bet history:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// export const getProfitlossHistory = async (req, res) => {
//   console.log("getProfitlossHistory is called");
//   const { id } = req; // User ID from auth middleware
//   console.log("req id is:",id);
//   const {
//     startDate,
//     endDate,
//     page = 1,
//     limit = 10,
//     eventName,
//     gameName,
//     marketName,
//   } = req.query;

//   // const gameName = "Cricket Game"

//   // console.log("req.query", req.query);

//   try {
//     // 1. Validate and parse inputs
//     const pageNum = Math.max(parseInt(page), 1);
//     const limitNum = Math.max(parseInt(limit), 1);
//     const skip = (pageNum - 1) * limitNum;

//     // 2. Build the base query
//     const betQuery = {
//       userId: id,
//       status: { $in: [1, 2] }, // Only settled bets (1=win, 2=loss)
//     };

//     // 3. Apply filters
//     // Date filters

//     if (startDate && endDate) {
//       betQuery.date = {
//         $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
//         $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
//       };
//     }

//     // Apply filters if provided
//     if (gameName) betQuery.gameName = gameName;
//     if (eventName) betQuery.eventName = eventName;
//     if (marketName) betQuery.marketName = marketName;

//     const fullFilterMode = gameName && eventName && marketName;

//     // 5. Retrieve bets with pagination
//     const bets = await betModel
//       .find(betQuery)
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//       console.log("bets is:",bets);
//     // console.log("bets", bets)

//     // 6. Handle full filter mode (return raw data without calculations)
//     if (fullFilterMode) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           report: bets,
//           total: {
//             totalBets: bets.length,
//             totalWinAmount: bets
//               .filter((b) => b.status === 1)
//               .reduce((sum, b) => sum + (b.resultAmount || 0), 0),
//             totalLossAmount: bets
//               .filter((b) => b.status === 2)
//               .reduce((sum, b) => sum + (b.resultAmount || 0), 0),
//           },
//         },
//       });
//     }

//     // 7. Existing grouping logic for partial filters
//     let groupKey = "gameName";
//     if (gameName && !eventName && !marketName) {
//       groupKey = "eventName";
//     } else if (gameName && eventName && !marketName) {
//       groupKey = "marketName";
//     }

//     // console.log("bets", bets);

//     const reportMap = {};

//     console.log("my bet is:",bets[0]);

//     for (const bet of bets) {
//       const key = bet[groupKey]?.trim() || "Unknown";
//       if (!reportMap[key]) {
//         reportMap[key] = {
//           name: key,
//           eventName: bet.eventName,
//           gameName: bet.gameName,
//           marketName: bet.marketName,
//           userName: bet.userName,
//           gameName: bet.gameName,
//           date: bet.createdAt,
//           teamName: bet.teamName,
//           WinAmount: 0,
//           LossAmount: 0,
//           myProfit: 0,
//           stakeAmount:bet.price,
//           backValue:bet.otype=="back"?bet.xValue:0,
//           layValue:bet.otype!="back"?0:bet.xValue,
//           otype:bet.otype,
//           commision:bet.price*.05
//         };
//       }

//       if (bet.status === 1) {
//         reportMap[key].WinAmount += bet.resultAmount || 0;
//       } else if (bet.status === 2) {
//         reportMap[key].LossAmount += bet.resultAmount || 0;
//       }
//       reportMap[key].myProfit =
//         reportMap[key].WinAmount - reportMap[key].LossAmount;
//     }

//     // 4. Get paginated bets and totals in parallel
//     const reportArray = Object.values(reportMap);
//     const total = reportArray.reduce(
//       (acc, curr) => ({
//         name: "Total",
//         WinAmount: acc.WinAmount + curr.WinAmount,
//         LossAmount: acc.LossAmount + curr.LossAmount,
//         myProfit: acc.myProfit + curr.myProfit,

//       }),
//       { name: "Total", WinAmount: 0, LossAmount: 0, myProfit: 0 }
//     );

//     console.log("reportArray", reportArray);

//     return res.status(200).json({
//       success: true,
//       data: {
//         report: reportArray,
//         total,
//       },
//     });
//   } catch (error) {
//     console.error("getMyReportByEvents error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


export const getProfitlossHistory = async (req, res) => {
  try {
    const { id } = req;
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate,
      gameName,
      eventName,
      marketName
    } = req.query;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const query = {
      userId: id,
      status: { $in: [1, 2] }
    };

    // Add date filter if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    // Add other filters if provided
    if (gameName) query.gameName = gameName;
    if (eventName) query.eventName = eventName;
    if (marketName) query.marketName = marketName;

    const [bets, totalBets] = await Promise.all([
      betModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),

      betModel.countDocuments(query)
    ]);

    // Fetch user commission percentage (only fetch once)
    const user = await SubAdmin.findById(id);
    const commissionPercentage = user?.commission || 0;

    const formatted = bets.map(bet => {
      // Calculate winAmount and profit based on status
      const winAmount = bet.status === 1 ? (bet.resultAmount + bet.price) : 0;
      const lossAmount = bet.status === 2 ? (bet.resultAmount || bet.price || 0) : 0;
      const profit = bet.status === 1 ? (bet.resultAmount || 0) : -(bet.resultAmount || bet.price || 0);
      
      // Calculate commission only for winning bets
      // Commission is calculated as: (winAmount * commissionPercentage) / 100
      const commission = bet.status === 1 && commissionPercentage > 0 
        ? Number(((winAmount * commissionPercentage) / 100).toFixed(2))
        : 0;

      return {
        betId: bet._id,
        gameName: bet.gameName,
        eventName: bet.eventName,
        marketName: bet.marketName,
        teamName: bet.teamName,
        odds: bet.xValue,
        stake: bet.price,
        otype: bet.otype,
        winAmount: winAmount,
        lossAmount: lossAmount,
        profit: profit,
        commission: commission,
        date: bet.createdAt
      };
    });

    return res.json({
      success: true,
      data: {
        report: formatted,
        totalRecords: totalBets,
        page: pageNum,
        limit: limitNum
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const getTransactionHistoryByUserAndDate = async (req, res) => {
  try {
    const { id } = req; // Make sure this is getting the correct user ID
    const { startDate, endDate, page, limit } = req.query;

    // Validate user ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const filter = {
      userId: id,
    };

    // Add date filtering if both dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Add one day to end date to include all transactions on that day
      end.setDate(end.getDate() + 1);

      filter.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    console.log("Final filter:", filter);

    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log("Found transactions:", transactions.length);

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};





