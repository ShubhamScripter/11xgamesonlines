// import axios from "axios";
// import { encrypt, decrypt } from "../utils/casinoCrypto.js";
// import SubAdmin from '../models/subAdminModel.js'

// const AGENCY_UID = "31417734-0bde-4dd7-8691-0d5a5a"; // Token
// const SERVER_URL = "https://bulkapi.in";

// // 🎮 1. Start Casino Game
// export const startCasinoGame = async (req, res) => {
//   try {
//     const { userName, game_uid, credit_amount } = req.body;

//     //  Find the subadmin/user before launching game
//     const subAdmin = await SubAdmin.findOne({ userName });
//     if (!subAdmin) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const timestamp = Date.now();

//     const payload = {
//       agency_uid: AGENCY_UID,
//       member_account: userName,
//       game_uid,
//       credit_amount,
//       currency_code: "INR",
//       language: "en",
//       home_url: "https://yourfrontend.com",
//       callback_url: "https://yourbackend.com/api/casino/callback",
//       platform: "web",
//       timestamp
//     };

//     const encryptedPayload = encrypt(payload);

//     // Send request to Casino API
//     const response = await axios.post(`${SERVER_URL}/launch_game`, {
//       agency_uid: AGENCY_UID,
//       timestamp,
//       payload: encryptedPayload
//     });
//     console.log("🔹 Casino API response:", response.data);
//     if (response.data.code === 0) {
//       const gameUrl = response.data.payload.game_launch_url;
//       return res.json({
//         success: true,
//         gameUrl,
//         message: "Game launched successfully"
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: response.data.msg || "Casino game launch failed"
//       });
//     }
//   } catch (error) {
//     console.error("❌ Casino launch error:", error.message);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// //  2. Callback (Bet/Win Results)
// export const casinoCallback = async (req, res) => {
//   try {
//     const { payload } = req.body;
//     const data = decrypt(payload);

//     const { member_account, bet_amount, win_amount } = data;

//     const subAdmin = await SubAdmin.findOne({ userName: member_account });
//     if (!subAdmin) {
//       console.warn("⚠️ Callback: user not found:", member_account);
//       return res.json({ code: 1, msg: "User not found" });
//     }

//     const oldBalance = subAdmin.balance || 0;
//     const newBalance = oldBalance - Number(bet_amount) + Number(win_amount);

//     subAdmin.balance = newBalance;
//     await subAdmin.save();

//     console.log(
//       `🎰 ${member_account}: Bet ${bet_amount} INR, Won ${win_amount} INR → New Balance = ${newBalance}`
//     );

//     // Respond to Casino API
//     return res.json({ code: 0, msg: "success" });
//   } catch (error) {
//     console.error("❌ Casino callback error:", error.message);
//     return res.json({ code: 1, msg: "callback error" });
//   }
// };


// import axios from "axios";
// import { encrypt, decrypt } from "../utils/casinoCrypto.js";
// import SubAdmin from '../models/subAdminModel.js'

// // 🔧 Get these from environment variables or database
// const AGENCY_UID = process.env.CASINO_AGENCY_UID || "31417734-0bde-4dd7-8691-0d5a5a";
// const SERVER_URL = process.env.CASINO_SERVER_URL || "https://bulkapi.in";

// // 🎮 1. Start Casino Game
// export const startCasinoGame = async (req, res) => {
//   try {
//     const { userName, game_uid, credit_amount } = req.body;

//     // ✅ Validate required fields
//     if (!userName || !game_uid || !credit_amount) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Missing required fields: userName, game_uid, credit_amount" 
//       });
//     }

//     // ✅ Find the subadmin/user before launching game
//     const subAdmin = await SubAdmin.findOne({ userName });
//     if (!subAdmin) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // ✅ Check if user has sufficient balance
//     if (subAdmin.balance < credit_amount) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Insufficient balance" 
//       });
//     }

//     const timestamp = Date.now();

//     const payload = {
//       agency_uid: AGENCY_UID,
//       member_account: userName,
//       game_uid,
//       credit_amount,
//       currency_code: "INR",
//       language: "en",
//       home_url: "http://localhost:5173", // 🔧 Update to your actual frontend URL
//       callback_url: "http://localhost:5000/api/casino/callback", // 🔧 Update to your actual backend URL
//       platform: "web",
//       timestamp
//     };

//     console.log("🔹 Sending payload to casino API:", payload);

//     const encryptedPayload = encrypt(payload);

//     // Send request to Casino API
//     const response = await axios.post(`${SERVER_URL}/launch_game`, {
//       agency_uid: AGENCY_UID,
//       timestamp,
//       payload: encryptedPayload
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       },
//       timeout: 30000 // 30 second timeout
//     });

//     console.log("🔹 Casino API response:", response.data);
    
//     // ✅ Better error handling
//     if (response.data && response.data.code === 0) {
//       const gameUrl = response.data.payload?.game_launch_url;
//       if (gameUrl) {
//         return res.json({
//           success: true,
//           gameUrl,
//           message: "Game launched successfully"
//         });
//       } else {
//         return res.status(400).json({
//           success: false,
//           message: "Game URL not received from casino API"
//         });
//       }
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: response.data?.msg || "Casino game launch failed",
//         errorCode: response.data?.code
//       });
//     }
//   } catch (error) {
//     console.error("❌ Casino launch error:", error.message);
    
//     // ✅ More specific error handling
//     if (error.response) {
//       console.error("❌ API Response Error:", error.response.data);
//       return res.status(500).json({ 
//         success: false, 
//         message: "Casino API error: " + (error.response.data?.msg || error.response.statusText),
//         details: error.response.data
//       });
//     } else if (error.request) {
//       console.error("❌ No response received:", error.request);
//       return res.status(500).json({ 
//         success: false, 
//         message: "No response from casino API" 
//       });
//     } else {
//       return res.status(500).json({ 
//         success: false, 
//         message: "Internal server error: " + error.message 
//       });
//     }
//   }
// };

// // 💸 2. Callback (Bet/Win Results)
// export const casinoCallback = async (req, res) => {
//   try {
//     console.log("🔹 Casino callback received:", req.body);
    
//     const { payload } = req.body;
//     if (!payload) {
//       return res.json({ code: 1, msg: "No payload received" });
//     }

//     const data = decrypt(payload);
//     console.log("🔹 Decrypted callback data:", data);

//     const { member_account, bet_amount, win_amount } = data;

//     if (!member_account) {
//       return res.json({ code: 1, msg: "Member account not found in callback" });
//     }

//     const subAdmin = await SubAdmin.findOne({ userName: member_account });
//     if (!subAdmin) {
//       console.warn("⚠️ Callback: user not found:", member_account);
//       return res.json({ code: 1, msg: "User not found" });
//     }

//     const oldBalance = subAdmin.balance || 0;
//     const newBalance = oldBalance - Number(bet_amount || 0) + Number(win_amount || 0);

//     subAdmin.balance = newBalance;
//     await subAdmin.save();

//     console.log(
//       `🎰 ${member_account}: Bet ${bet_amount} INR, Won ${win_amount} INR → New Balance = ${newBalance}`
//     );

//     // Respond to Casino API
//     return res.json({ code: 0, msg: "success" });
//   } catch (error) {
//     console.error("❌ Casino callback error:", error.message);
//     return res.json({ code: 1, msg: "callback error: " + error.message });
//   }
// };


import axios from "axios";
import { encrypt, decrypt } from "../utils/casinoCrypto.js";
import SubAdmin from '../models/subAdminModel.js'
import { sendToUser } from '../socket/bettingSocket.js';
// 🔧 Casino API Configuration
// const API_TOKEN = "31417734-0bde-4dd7-8691-0d5a5a";
// const API_SECRET = "722cb6dbd6fbfa00b82fed07451f81";
// const SERVER_URL = "https://bulkapi.in";
const API_TOKEN = process.env.CASINO_API_KEY;
const API_SECRET = process.env.CASINO_API_SECRET;
const SERVER_URL = process.env.CASINO_API_URL;

// 🎮 1. Start Casino Game
export const startCasinoGame = async (req, res) => {
  try {
    const { userName, game_uid, credit_amount } = req.body;

    // ✅ Validate required fields
    if (!userName || !game_uid || !credit_amount) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: userName, game_uid, credit_amount" 
      });
    }

    // ✅ Find the subadmin/user before launching game
    const subAdmin = await SubAdmin.findOne({ userName });
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Check if user has sufficient balance
    // if (subAdmin.avbalance < credit_amount) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: "Insufficient balance" 
    //   });
    // }
    const roundedBalance = Math.round(subAdmin.avbalance * 100) / 100;
    const roundedCreditAmount = Math.round(parseFloat(credit_amount) * 100) / 100;

    if (roundedBalance < roundedCreditAmount) {
      console.log("subadmin balance", subAdmin.avbalance);
      console.log("credit amount", credit_amount);
      console.log("rounded balance", roundedBalance);
      console.log("rounded credit amount", roundedCreditAmount);
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient balance" 
      });
    }

    const timestamp = Math.round(Date.now());

    // 🔧 Create payload exactly like PHP code
    const requestData = {
      user_id: userName, // Using userName as user_id
      wallet_amount: parseFloat(credit_amount),
      game_uid: game_uid,
      token: API_TOKEN,
      timestamp: timestamp
    };

    console.log("🔹 Request data:", requestData);

    // 🔧 Encrypt the payload using the secret key
    const message = JSON.stringify(requestData);
    const encryptedPayload = encrypt(message); // This uses your existing encrypt function

    // 🔧 Build URL with parameters (like PHP code)
    const gameUrl = `${SERVER_URL}/launch_game?` + 
      `user_id=${encodeURIComponent(userName)}` +
      `&wallet_amount=${encodeURIComponent(credit_amount)}` +
      `&game_uid=${encodeURIComponent(game_uid)}` +
      `&token=${encodeURIComponent(API_TOKEN)}` +
      `&timestamp=${encodeURIComponent(timestamp)}` +
      `&payload=${encodeURIComponent(encryptedPayload)}`;

    console.log("🔹 Generated game URL:", gameUrl);

    // 🔧 Return the game URL for frontend to redirect
    return res.json({
      success: true,
      gameUrl: gameUrl,
      message: "Game URL generated successfully"
    });

  } catch (error) {
    console.error("❌ Casino launch error:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error: " + error.message 
    });
  }
};

// 💸 2. Callback (Bet/Win Results)
// export const casinoCallback = async (req, res) => {
//   try {
//     console.log("🔹 Casino callback received:", req.body);
    
//     const { payload } = req.body;
//     if (!payload) {
//       return res.json({ code: 1, msg: "No payload received" });
//     }

//     const data = decrypt(payload);
//     console.log("🔹 Decrypted callback data:", data);

//     const { member_account, bet_amount, win_amount } = data;

//     if (!member_account) {
//       return res.json({ code: 1, msg: "Member account not found in callback" });
//     }

//     const subAdmin = await SubAdmin.findOne({ userName: member_account });
//     if (!subAdmin) {
//       console.warn("⚠️ Callback: user not found:", member_account);
//       return res.json({ code: 1, msg: "User not found" });
//     }

//     const oldBalance = subAdmin.balance || 0;
//     const newBalance = oldBalance - Number(bet_amount || 0) + Number(win_amount || 0);

//     subAdmin.balance = newBalance;
//     await subAdmin.save();

//     console.log(
//       `🎰 ${member_account}: Bet ${bet_amount} INR, Won ${win_amount} INR → New Balance = ${newBalance}`
//     );

//     // Respond to Casino API
//     return res.json({ code: 0, msg: "success" });
//   } catch (error) {
//     console.error("❌ Casino callback error:", error.message);
//     return res.json({ code: 1, msg: "callback error: " + error.message });
//   }
// };

// export const casinoCallback = async (req, res) => {
//   try {
//     // Log useful info while debugging
//     console.log('callback headers:', req.headers);
//     console.log('callback raw body:', req.body);

//     //this is response of console.log(req.body);
//     // callback raw body: {
//     //   mobile: 'user12',
//     //   bet_amount: '25',
//     //   win_amount: '0',
//     //   game_uid: '2e31c310ad2491d3c6021f6063dc9b74',
//     //   game_round: '16576070176050724324',
//     //   token: '31417734-0bde-4dd7-8691-0d5a5a',
//     //   wallet_before: '1065.8',
//     //   wallet_after: '1040.8',
//     //   change: '-25',
//     //   timestamp: '2025-10-30 12:13:31'
//     // }



//     // If provider sends encrypted payload JSON (your original flow)
//     if (req.body && req.body.payload) {
//       const data = decrypt(req.body.payload);
//       console.log('decrypted payload:', data);
//       // example fields: member_account, bet_amount, win_amount
//       const { member_account, bet_amount, win_amount } = data || {};
//       if (!member_account) return res.json({ code: 1, msg: 'Member account not found in payload' });

//       const subAdmin = await SubAdmin.findOne({ userName: member_account });
//       if (!subAdmin) return res.json({ code: 1, msg: 'User not found' });

//       const oldBalance = subAdmin.balance || 0;
//       const newBalance = oldBalance - Number(bet_amount || 0) + Number(win_amount || 0);
//       subAdmin.balance = newBalance;
//       await subAdmin.save();

//       return res.json({ code: 0, msg: 'success' });
//     }

//     // Otherwise accept form-encoded fields (like PHP sample)
//     const {
//       mobile,
//       bet_amount,
//       win_amount,
//       game_uid,
//       game_round,
//       token,
//       wallet_before,
//       wallet_after,
//       change,
//       timestamp,
//       currency_code,
//     } = req.body || {};

//     // Validate required bits; adjust to your model/logic
//     if (!mobile) return res.json({ code: 1, msg: 'No mobile provided' });

//     const subAdmin = await SubAdmin.findOne({ userName: mobile });
//     if (!subAdmin) return res.json({ code: 1, msg: 'User not found' });

//     const bet = Number(bet_amount || 0);
//     const win = Number(win_amount || 0);
//     const oldBalance = subAdmin.balance || 0;
//     const newBalance = oldBalance - bet + win;

//     subAdmin.balance = newBalance;
//     await subAdmin.save();

//     // TODO: optionally persist game history similar to PHP code (game_uid/game_round/change etc.)

//     return res.json({ code: 0, msg: 'success' });
//   } catch (error) {
//     console.error('Casino callback error:', error);
//     return res.json({ code: 1, msg: `callback error: ${error.message}` });
//   }
// };


import CasinoBetHistory from '../models/casinoBetHistory.model.js';


export const casinoCallback = async (req, res) => {
  try {
    console.log('callback headers:', req.headers);
    console.log('callback raw body:', req.body);

    // If provider sends encrypted payload JSON
    if (req.body && req.body.payload) {
      const data = decrypt(req.body.payload);
      console.log('decrypted payload:', data);
      
      const { member_account, bet_amount, win_amount, game_uid, game_round, timestamp, currency_code, wallet_before, wallet_after, change } = data || {};
      if (!member_account) return res.json({ code: 1, msg: 'Member account not found in payload' });

      const subAdmin = await SubAdmin.findOne({ userName: member_account });
      if (!subAdmin) return res.json({ code: 1, msg: 'User not found' });

      const oldBalance = subAdmin.avbalance || 0;
      const bet = Number(bet_amount || 0);
      const win = Number(win_amount || 0);
      const newBalance = oldBalance - bet + win;

      subAdmin.avbalance = newBalance;
      await subAdmin.save();

      // Check if record already exists
      const existingBet = await CasinoBetHistory.findOne({ 
        userName: member_account, 
        game_round: game_round || 'n/a' 
      });

      // Only save/update if:
      // 1. Record doesn't exist AND (bet > 0 OR win > 0)
      // 2. Record exists AND win > 0 (win settlement update)
      // Skip zero-value status callbacks that overwrite real bets
      const shouldSave = !existingBet 
        ? (bet > 0 || win > 0) 
        : (win > 0 || (existingBet.bet_amount === 0 && bet > 0));

      if (shouldSave) {
        await CasinoBetHistory.findOneAndUpdate(
          { userName: member_account, game_round: game_round || 'n/a' },
          {
            $setOnInsert: {
              userId: subAdmin._id.toString(),
              userName: member_account,
              game_uid: game_uid || 'n/a',
              game_round: game_round || 'n/a',
            },
            $set: {
              bet_amount: bet,
              win_amount: win,
              change: Number(change || (wallet_after ? Number(wallet_after) - Number(wallet_before || oldBalance) : (win - bet))),
              wallet_before: Number(wallet_before || oldBalance),
              wallet_after: Number(wallet_after || newBalance),
              currency_code: currency_code || 'INR',
              token: data.token,
              provider_timestamp: timestamp ? new Date(timestamp) : new Date(),
              providerRaw: data,
              processedAt: new Date(),
            }
          },
          { upsert: true, new: true }
        );
      } else {
        console.log(`⏭️ Skipping zero-value callback for game_round: ${game_round}`);
      }

      return res.json({ code: 0, msg: 'success' });
    }

    // Handle plain form-encoded fields (your current callback format)
    const {
      mobile,
      bet_amount,
      win_amount,
      game_uid,
      game_round,
      token,
      wallet_before,
      wallet_after,
      change,
      timestamp,
      currency_code,
    } = req.body || {};

    if (!mobile) return res.json({ code: 1, msg: 'No mobile provided' });

    // ✅ Find SubAdmin by userName (mobile maps to userName)
    const subAdmin = await SubAdmin.findOne({ userName: mobile });
    if (!subAdmin) return res.json({ code: 1, msg: 'User not found' });

    const bet = Number(bet_amount || 0);
    const win = Number(win_amount || 0);
    const oldBalance = subAdmin.avbalance || 0;
    const newBalance = oldBalance - bet + win;

    subAdmin.avbalance = newBalance;
    await subAdmin.save();
    sendToUser(subAdmin.userName, {
      type: "balance_update",
      userName: subAdmin.userName,
      newBalance: subAdmin.avbalance
    });
    // ✅ Check if record already exists
    const existingBet = await CasinoBetHistory.findOne({ 
      userName: mobile, 
      game_round: game_round || 'n/a' 
    });

    // ✅ Only save/update if:
    // 1. Record doesn't exist AND (bet > 0 OR win > 0) - create new bet record
    // 2. Record exists AND win > 0 - update with win settlement
    // 3. Record exists but has bet_amount = 0 AND bet > 0 - update with actual bet
    // Skip zero-value status callbacks that would overwrite real bets
    const shouldSave = !existingBet 
      ? (bet > 0 || win > 0) 
      : (win > 0 || (existingBet.bet_amount === 0 && bet > 0));

    if (shouldSave) {
      // ✅ Save/Update casino bet history with userId
      await CasinoBetHistory.findOneAndUpdate(
        { userName: mobile, game_round: game_round || 'n/a' },
        {
          $setOnInsert: {
            userId: subAdmin._id.toString(), // Store SubAdmin._id as userId
            userName: mobile, // mobile = userName in SubAdmin
            game_uid: game_uid || 'n/a',
            game_round: game_round || 'n/a',
          },
          $set: {
            bet_amount: bet,
            win_amount: win,
            change: Number(change || (wallet_after ? Number(wallet_after) - Number(wallet_before || oldBalance) : (win - bet))),
            wallet_before: Number(wallet_before || oldBalance),
            wallet_after: Number(wallet_after || newBalance),
            currency_code: currency_code || 'INR',
            token: token,
            provider_timestamp: timestamp ? new Date(timestamp) : new Date(),
            providerRaw: req.body, // Store full raw payload
            processedAt: new Date(),
          }
        },
        { upsert: true, new: true } // Prevent duplicates on retry
      );
      
      console.log(`🎰 Casino bet saved: ${mobile} - Bet: ${bet}, Win: ${win}, New Balance: ${newBalance}`);
    } else {
      console.log(`⏭️ Skipping zero-value callback for ${mobile} - game_round: ${game_round} (existing bet_amount: ${existingBet?.bet_amount})`);
    }

    return res.json({ code: 0, msg: 'success' });
  } catch (error) {
    console.error('Casino callback error:', error);
    return res.json({ code: 1, msg: `callback error: ${error.message}` });
  }
};

// 🔍 Debug encryption/decryption
export const debugEncryption = async (req, res) => {
  try {
    console.log("🔍 Starting debug encryption test...");
    
    const testData = {
      user_id: "user12",
      wallet_amount: 100,
      game_uid: "1",
      token: "31417734-0bde-4dd7-8691-0d5a5a",
      timestamp: Math.round(Date.now())
    };

    console.log("🔍 Original data:", testData);
    
    // Test encryption
    const message = JSON.stringify(testData);
    console.log("🔍 JSON string:", message);
    
    console.log("🔍 About to encrypt...");
    const encrypted = encrypt(message);
    console.log("🔍 Encrypted:", encrypted);
    
    console.log("🔍 About to decrypt...");
    const decrypted = decrypt(encrypted);
    console.log("🔍 Decrypted:", decrypted);
    
    // Test if they match
    const isMatch = JSON.stringify(testData) === JSON.stringify(decrypted);
    console.log("🔍 Encryption/Decryption match:", isMatch);
    
    res.json({
      original: testData,
      jsonString: message,
      encrypted: encrypted,
      decrypted: decrypted,
      isMatch: isMatch
    });
    
  } catch (error) {
    console.error("🔍 Debug encryption error:", error.message);
    console.error("🔍 Full error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Simple test without encryption
export const debugSimple = async (req, res) => {
  try {
    console.log("🔍 Simple test - no encryption");
    
    const testData = {
      user_id: "user12",
      wallet_amount: 100,
      game_uid: "1",
      token: "31417734-0bde-4dd7-8691-0d5a5a",
      timestamp: Math.round(Date.now())
    };

    const message = JSON.stringify(testData);
    console.log("🔍 JSON string:", message);
    
    res.json({
      success: true,
      message: "Simple test successful",
      data: testData,
      jsonString: message
    });
    
  } catch (error) {
    console.error("🔍 Simple test error:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// Get Casino Bet History by User ID
export const getCasinoBetHistory = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from URL params
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate 
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Build query
    const query = { userId: userId };

    // Add date filtering if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    // Get bets with pagination
    const bets = await CasinoBetHistory.find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CasinoBetHistory.countDocuments(query);

    // Calculate totals
    const totalBetAmount = await CasinoBetHistory.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$bet_amount" } } }
    ]);

    const totalWinAmount = await CasinoBetHistory.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$win_amount" } } }
    ]);

    res.status(200).json({
      success: true,
      data: bets,
      summary: {
        totalBetAmount: totalBetAmount[0]?.total || 0,
        totalWinAmount: totalWinAmount[0]?.total || 0,
        netResult: (totalWinAmount[0]?.total || 0) - (totalBetAmount[0]?.total || 0),
      },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching casino bet history:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Casino Bet History with Downline Tree 
export const getAllDownlineCasinoBetHistory = async (req, res) => {
  try {
    // Allow id from auth middleware, request body, or query params
    let id = req.id || req.body.id || req.query.id;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }
    
    const { startDate, endDate, page, limit } = req.query;

    // Find the admin
    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }

    // Get all downline users (recursive) - same pattern as getAllDownlineBets
    let queue = [admin.code];
    let userIds = [];

    while (queue.length > 0) {
      const currentCode = queue.shift();

      const downlineUsers = await SubAdmin.find({ invite: currentCode });

      for (const user of downlineUsers) {
        // Collect all users (unlike sports betting which only collects role === "user")
        userIds.push(user._id.toString());
        
        // Add agent/admin code to queue to go deeper
        queue.push(user.code);
      }
    }

    // ✅ If no downlines found, include only the user itself
    if (userIds.length === 0) {
      userIds = [admin._id.toString()];
    }

    // Build filter
    const filter = { userId: { $in: userIds } };

    // Add date filter if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lte: end };
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Fetch casino bet history for all collected users
    const betData = await CasinoBetHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalCount = await CasinoBetHistory.countDocuments(filter);

    return res.status(200).json({
      success: true,
      totalUsers: userIds.length,
      totalBets: betData.length,
      data: betData,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      }
    });

  } catch (error) {
    console.error("Error fetching casino bet history:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};
// Get All Casino Profit/Loss Report 

export const getAllCasinoProfitLoss = async (req, res) => {
  try {
    const { userId } = req.params; // User ID from URL params
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // 1️⃣ Find the target user
    const targetUser = await SubAdmin.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 2️⃣ Get only DIRECT downline users (just below, not recursive)
    let downlineResult = [];
    
    if (targetUser.role === "user") {
      // If user is a regular user, include only themselves
      downlineResult = [targetUser];
    } else {
      // Get direct downlines only
      downlineResult = await SubAdmin.find({ 
        invite: targetUser.code,
        status: { $ne: "delete" } 
      });
    }

    if (downlineResult.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        total: {
          stake: 0,
          casinoPL: 0,
          internationalCasinoPL: 0,
          uplinePL: 0
        }
      });
    }

    // 3️⃣ For each direct downline, get ALL their descendants and aggregate casino P/L
    const userPLReport = [];

    for (const downline of downlineResult) {
      // Get all descendants of this downline (recursive)
      const descendantsAggregation = await SubAdmin.aggregate([
        { $match: { _id: downline._id } },
        {
          $graphLookup: {
            from: "subadmins",
            startWith: "$code",
            connectFromField: "code",
            connectToField: "invite",
            as: "descendants"
          }
        }
      ]);

      // Extract all descendant IDs including the downline itself
      const descendantIds = descendantsAggregation[0]?.descendants.map(u => u._id.toString()) || [];
      if (!descendantIds.includes(downline._id.toString())) {
        descendantIds.push(downline._id.toString());
      }

      // Build date filter
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
      }

      // Aggregate casino P/L for this downline + all their descendants
      const casinoPLData = await CasinoBetHistory.aggregate([
        {
          $match: {
            userId: { $in: descendantIds },
            ...dateFilter
          }
        },
        {
          $group: {
            _id: null,
            totalStake: { $sum: "$bet_amount" },
            totalChange: { $sum: "$change" }
          }
        }
      ]);

      const plData = casinoPLData[0] || { totalStake: 0, totalChange: 0 };
      const casinoPL = plData.totalChange || 0;
      userPLReport.push({
        userId: downline._id.toString(),
        userName: downline.userName || "",
        role: downline.role || "",
        stake: plData.totalStake || 0,
        casinoPL: plData.totalChange || 0,
        internationalCasinoPL: 0,
        uplinePL:  -casinoPL || 0
      });
    }

    // 4️⃣ Calculate totals
    const totals = {
      stake: 0,
      casinoPL: 0,
      internationalCasinoPL: 0,
      uplinePL: 0
    };

    userPLReport.forEach(item => {
      totals.stake += item.stake;
      totals.casinoPL += item.casinoPL;
      totals.internationalCasinoPL += item.internationalCasinoPL;
      totals.uplinePL += item.uplinePL;
    });

    // 5️⃣ Sort by userName
    userPLReport.sort((a, b) => (a.userName || "").localeCompare(b.userName || ""));

    // 6️⃣ Return response
    res.status(200).json({
      success: true,
      data: userPLReport,
      total: totals
    });

  } catch (error) {
    console.error("Error fetching casino profit/loss:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};



// Get Casino Profit/Loss Report Grouped by Date
export const getCasinoProfitLossByDate = async (req, res) => {
  try {
    const { userId } = req.params; // User ID from URL params
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required"
      });
    }

    // 1️⃣ Find the target user
    const targetUser = await SubAdmin.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 2️⃣ Get ALL downlines (direct + recursive) for the target user
    let allDownlineIds = [];
    
    if (targetUser.role === "user") {
      // If user is a regular user, include only themselves
      allDownlineIds = [targetUser._id.toString()];
    } else {
      // Get direct downlines
      let downlineResult = await SubAdmin.find({ 
        invite: targetUser.code,
        status: { $ne: "delete" } 
      });

      // For each direct downline, get ALL their descendants (recursive)
      for (const downline of downlineResult) {
        const descendantsAggregation = await SubAdmin.aggregate([
          { $match: { _id: downline._id } },
          {
            $graphLookup: {
              from: "subadmins",
              startWith: "$code",
              connectFromField: "code",
              connectToField: "invite",
              as: "descendants"
            }
          }
        ]);

        // Extract all descendant IDs including the downline itself
        const descendantIds = descendantsAggregation[0]?.descendants.map(u => u._id.toString()) || [];
        if (!descendantIds.includes(downline._id.toString())) {
          descendantIds.push(downline._id.toString());
        }
        
        allDownlineIds = [...allDownlineIds, ...descendantIds];
      }
    }

    if (allDownlineIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        total: {
          stake: 0,
          downlinePL: 0,
          playerPL: 0,
          commission: 0,
          uplinePL: 0
        }
      });
    }

        // 3️⃣ Build date filter (using local timezone, not UTC)
        const startParts = startDate.split('-');
        const endParts = endDate.split('-');
        
        const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]), 0, 0, 0, 0);
        const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]), 23, 59, 59, 999);
    
        // 4️⃣ Aggregate casino P/L grouped by date
        const datePLData = await CasinoBetHistory.aggregate([
          {
            $match: {
              userId: { $in: allDownlineIds },
              createdAt: {
                $gte: start,
                $lte: end
              }
            }
          },
          {
            $project: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: "Asia/Kolkata" // Use IST timezone or adjust to your server timezone
                }
              },
              bet_amount: 1,
              change: 1
            }
          },
          {
            $group: {
              _id: "$date",
              stake: { $sum: "$bet_amount" },
              casinoPL: { $sum: "$change" }
            }
          },
          {
            $sort: { _id: 1 } // Sort by date ascending
          }
        ]);
    
        // 5️⃣ Generate all dates in the range and fill missing dates with zeros
        const allDatesMap = new Map();
        
        // Initialize map with all dates in range (set to zero)
        const currentDate = new Date(start);
        while (currentDate <= end) {
          // Format date as YYYY-MM-DD without timezone conversion
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          allDatesMap.set(dateStr, {
            uid: dateStr,
            stake: 0,
            downlinePL: 0,
            playerPL: 0,
            commission: 0,
            uplinePL: 0
          });
          
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Fill in actual data from aggregation
        datePLData.forEach(item => {
          const casinoPL = item.casinoPL || 0;
          allDatesMap.set(item._id, {
            uid: item._id,
            stake: item.stake || 0,
            downlinePL: casinoPL,
            playerPL: casinoPL,
            commission: 0,
            uplinePL: -casinoPL
          });
        });
        
        // Convert map to array and sort by date
        const formattedData = Array.from(allDatesMap.values()).sort((a, b) => 
          a.uid.localeCompare(b.uid)
        );
    
        // 6️⃣ Calculate totals
        const totals = {
          stake: 0,
          downlinePL: 0,
          playerPL: 0,
          commission: 0,
          uplinePL: 0
        };
    
        formattedData.forEach(item => {
          totals.stake += item.stake;
          totals.downlinePL += item.downlinePL;
          totals.playerPL += item.playerPL;
          totals.commission += item.commission;
          totals.uplinePL += item.uplinePL;
        });
    
        // 7️⃣ Return response
        res.status(200).json({
          success: true,
          data: formattedData,
          total: totals
        });

  } catch (error) {
    console.error("Error fetching casino profit/loss by date:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};