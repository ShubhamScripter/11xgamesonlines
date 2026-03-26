// import SubAdmin from "../../models/subAdminModel.js"; // Ensure SubAdmin model is imported
// import betModel from "../../models/betModel.js";
// import betHistoryModel from "../../models/betHistoryModel.js"



// export const getMyReportByEvents1 = async (req, res) => {
//     const { id } = req;
//     const { startDate, endDate, page = 1, limit = 10, eventName, gameName, marketName } = req.query;
//     // const { eventName, gameName, marketName } = req.body


//     try {
//         // 1. Retrieve the admin
//         const admin = await SubAdmin.findById(id);
//         if (!admin) throw new Error("Admin not found");

//         // 2. Get all downline users using aggregation
//         const downlineUsers = await SubAdmin.aggregate([
//             { $match: { _id: admin._id } },
//             {
//                 $graphLookup: {
//                     from: "subadmins",
//                     startWith: "$code",
//                     connectFromField: "code",
//                     connectToField: "invite",
//                     as: "downline",
//                     depthField: "level"
//                 }
//             }
//         ]);

//         const downlineIds = downlineUsers[0]?.downline.map(user => user._id) || [];

//         // 3. Build the bet query with filters
//         const betQuery = {
//             userId: { $in: downlineIds },
//             status: { $in: [1, 2] } // 1=win, 2=loss
//         };

//         // Apply date filters if provided
//         // if (startDate || endDate) {
//         //     betQuery.date = {};
//         //     if (startDate) {
//         //         betQuery.date.$gte = new Date(startDate);
//         //     }
//         //     if (endDate) {
//         //         betQuery.date.$lte = new Date(endDate);
//         //     }
//         // }

//         if (startDate && endDate) {
//             betQuery.date = {
//                 $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
//                 $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
//             };
//         }

//         // Apply gameName filter if provided
//         if (gameName) {
//             betQuery.gameName = gameName;
//         }

//         // Apply eventName filter if provided
//         if (eventName) {
//             betQuery.eventName = eventName;
//         }
//         if (marketName) {
//             betQuery.marketName = marketName;
//         }

//         // 4. Retrieve bets with pagination
//         const bets = await betModel
//             .find(betQuery)
//             .skip((page - 1) * limit)
//             .limit(parseInt(limit));

//         // 5. Determine grouping key based on provided filters
//         let groupKey = "gameName";
//         if (gameName && !eventName && !marketName) {
//             groupKey = "eventName";
//         } else if (gameName && eventName && !marketName) {
//             groupKey = "marketName";
//         } else if (gameName && eventName && marketName) {
//             groupKey = "marketName"
//         }

//         // 6. Group and calculate amounts
//         const reportMap = {};

//         for (const bet of bets) {
//             const key = bet[groupKey]?.trim() || "Unknown";
//             if (!reportMap[key]) {
//                 reportMap[key] = {
//                     eventName,
//                     gameName,
//                     marketName,
//                     name: key,
//                     downlineWinAmount: 0,
//                     downlineLossAmount: 0,
//                     myProfit: 0
//                 };
//             }

//             if (bet.status === 1) {
//                 reportMap[key].downlineWinAmount += bet.resultAmount || 0;
//             } else if (bet.status === 2) {
//                 reportMap[key].downlineLossAmount += bet.resultAmount || 0;
//             }

//             reportMap[key].myProfit =
//                 reportMap[key].downlineLossAmount - reportMap[key].downlineWinAmount;
//         }

//         const reportArray = Object.values(reportMap);

//         // 7. Calculate totals
//         const total = reportArray.reduce(
//             (acc, curr) => ({
//                 name: "Total",
//                 downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
//                 downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
//                 myProfit: acc.myProfit + curr.myProfit
//             }),
//             { name: "Total", downlineWinAmount: 0, downlineLossAmount: 0, myProfit: 0 }
//         );

//         return res.status(200).json({
//             success: true,
//             data: {
//                 report: reportArray,
//                 total
//             }
//         });
//     } catch (error) {
//         console.error("getMyReportByEvents error:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };
// //Count the number of uplines

// export const getMyReportByEvents = async (req, res) => {
//     const { id } = req;
//     const { startDate, endDate, page, limit, eventName, gameName, marketName, userName } = req.query;
//     try {
//         // 1. Retrieve the admin
//         const admin = await SubAdmin.findById(id);
//         if (!admin) throw new Error("Admin not found");

//         if (admin.secret === 0) {
//             return res.status(200).json({ message: "created successfully" });
//         }

//         // 2. Get all downline users using aggregation
//         const downlineUsers = await SubAdmin.aggregate([
//             { $match: { _id: admin._id } },
//             {
//                 $graphLookup: {
//                     from: "subadmins",
//                     startWith: "$code",
//                     connectFromField: "code",
//                     connectToField: "invite",
//                     as: "downline",
//                     depthField: "level"
//                 }
//             }
//         ]);




//         const downlineIds = downlineUsers[0]?.downline.map(user => user._id) || [];


//         // 3. Build the bet query with filters
//         const betQuery = {
//             userId: { $in: downlineIds },
//             status: { $in: [1, 2] }
//         };



//         // Date filters

//         if (startDate && endDate) {
//             betQuery.date = {
//                 $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
//                 $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
//             };
//         }

//         // Apply filters if provided
//         if (gameName) betQuery.gameName = gameName;
//         if (eventName) betQuery.eventName = eventName;
//         if (marketName) betQuery.marketName = marketName;
//         if (userName) betQuery.userName = userName;
        

//         // 4. Check if all three filters are present
//         const fullFilterMode = gameName && eventName && marketName && userName;



//         // 5. Retrieve bets with pagination 

//         const bets = await betModel
//             .find(betQuery)
//             .skip((page - 1) * limit)
//             .limit(parseInt(limit));
//         // console.log("betQuery", betQuery)
//         // console.log("bets", bets)


//         //Also we have to find the latest Result and market Id of the bets we can find it by us only we have to fetch the latest betHistory record then there we can fetch market Id and result
       


//         // 6. Handle full filter mode (return raw data without calculations)
//         if (fullFilterMode) {
//             return res.status(200).json({
//                 success: true,
//                 data: {
//                     report: bets,
//                     total: {
//                         totalBets: bets.length,
//                         totalWinAmount: bets.filter(b => b.status === 1).reduce((sum, b) => sum + (b.resultAmount || 0), 0),
//                         totalLossAmount: bets.filter(b => b.status === 2).reduce((sum, b) => sum + (b.resultAmount || 0), 0)
//                     }
//                 }
//             });
//         }

//         // 7. Existing grouping logic for partial filters
//         let groupKey = "gameName";
//         if (gameName && !eventName && !marketName && !userName) {
//             groupKey = "eventName";
//         } else if (gameName && eventName && !marketName && !userName) {
//             groupKey = "marketName";
//         } else if (gameName && eventName && marketName && !userName) {
//             groupKey = "userName";
//         }

//         const reportMap = {};

//         for (const bet of bets) {
//             const key = bet[groupKey]?.trim() || "Unknown";
            
//             // Add this line to fetch the user for each bet:
//             const user = await SubAdmin.findById(bet.userId);
            
//             if (!reportMap[key]) {
//                 reportMap[key] = {
//                     name: key,
//                     eventName: bet.eventName,
//                     gameName: bet.gameName,
//                     marketName: bet.marketName,
//                     userName: bet.userName,
//                     date: bet.createdAt,
//                     result: bet.betResult,
//                     marketId: bet.market_id ? bet.market_id.match(/\d+/g)?.pop() : null,
//                     downlineWinAmount: 0,
//                     downlineLossAmount: 0,
//                     myProfit: 0
//                 };
//             }

//             if (bet.status === 1) {
//                 reportMap[key].downlineWinAmount += bet.resultAmount || 0;
//             } else {
//                 reportMap[key].downlineLossAmount += bet.resultAmount || 0;
//             }
            
//             // Change this line:
//             reportMap[key].myProfit = reportMap[key].downlineLossAmount - reportMap[key].downlineWinAmount;
            
//             // To this:
//             // reportMap[key].myProfit = user.profitLoss || 0;
//         }

//         const reportArray = Object.values(reportMap);
//         const total = reportArray.reduce(
//             (acc, curr) => ({
//                 name: "Total",
//                 downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
//                 downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
//                 myProfit: acc.myProfit + curr.myProfit
//             }),
//             { name: "Total", downlineWinAmount: 0, downlineLossAmount: 0, myProfit: 0 }
//         );
        

//         return res.status(200).json({
//             success: true,
//             data: {
//                 report: reportArray,
//                 total
//             }
//         });
//         console.log("reportArray", reportArray);
        


//     } catch (error) {
//         console.error("getMyReportByEvents error:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// export const getGraphBackupData = async (req, res) => {
//     const { id } = req;
//     const { startDate, endDate } = req.query;


//     // console.log("req.query", req.query);



//     try {
//         // 1. Retrieve the admin
//         const admin = await SubAdmin.findById(id);
//         if (!admin) throw new Error("Admin not found");


//         if (admin.secret === 0) {
//             return res.status(200).json({ message: "created successfully" });
//         }

//         // 2. Get all downline users using aggregation
//         const downlineUsers = await SubAdmin.aggregate([
//             { $match: { _id: admin._id } },
//             {
//                 $graphLookup: {
//                     from: "subadmins",
//                     startWith: "$code",
//                     connectFromField: "code",
//                     connectToField: "invite",
//                     as: "downline",
//                     depthField: "level"
//                 }
//             }
//         ]);

//         const downlineIds = downlineUsers[0]?.downline.map(user => user._id) || [];

//         // 3. Build the bet query with filters
//         const betQuery = {
//             userId: { $in: downlineIds },
//             status: { $in: [1, 2] }
//         };

//         // Date filters
//         if (startDate && endDate) {
//             betQuery.date = {
//                 $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
//                 $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
//             };
//         }

//         // Apply filters if provided
//         // if (gameName) betQuery.gameName = gameName;
//         // if (eventName) betQuery.eventName = eventName;
//         // if (marketName) betQuery.marketName = marketName;
//         // if (userName) betQuery.userName = userName;

//         // 4. Check if all three filters are present
//         // const fullFilterMode = gameName && eventName && marketName && userName;



//         // 5. Retrieve bets with pagination
//         const bets = await betModel
//             .find(betQuery)
//         // console.log("bets", bets)

//         // 7. Existing grouping logic for partial filters
//         let groupKey = "gameName";

//         const reportMap = {};

//         for (const bet of bets) {
//             const key = bet[groupKey]?.trim() || "Unknown";
//             if (!reportMap[key]) {
//                 reportMap[key] = {
//                     name: key,
//                     downlineWinAmount: 0,
//                     downlineLossAmount: 0,
//                     myProfit: 0
//                 };
//             }

//             if (bet.status === 1) {
//                 reportMap[key].downlineWinAmount += bet.resultAmount || 0;
//             } else {
//                 reportMap[key].downlineLossAmount += bet.resultAmount || 0;
//             }
//         //     reportMap[key].myProfit = reportMap[key].downlineLossAmount - reportMap[key].downlineWinAmount;
//         const user = await SubAdmin.findById(bet.userId);
// reportMap[key].myProfit = user ? user.profitLoss : 0;
//         }

//         const reportArray = Object.values(reportMap);
//         const total = reportArray.reduce(
//             (acc, curr) => ({
//                 name: "Total",
//                 downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
//                 downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
//                 myProfit: acc.myProfit + curr.myProfit
//             }),
//             { name: "Total", downlineWinAmount: 0, downlineLossAmount: 0, myProfit: 0 }
//         );

//         return res.status(200).json({
//             success: true,
//             data: {
//                 report: reportArray,
//                 total
//             }
//         });

//     } catch (error) {
//         console.error("getMyReportByEvents error:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };
// export const getGraphLiveData = async (req, res) => {
//     const { id } = req;
//     const { startDate, endDate } = req.query;


//     // console.log("req.query", req.query);



//     try {
//         // 1. Retrieve the admin
//         const admin = await SubAdmin.findById(id);
//         if (!admin) throw new Error("Admin not found");



//         if (admin.secret === 0) {
//             return res.status(200).json({ message: "created successfully" });
//         }


//         // 2. Get all downline users using aggregation
//         const downlineUsers = await SubAdmin.aggregate([
//             { $match: { _id: admin._id } },
//             {
//                 $graphLookup: {
//                     from: "subadmins",
//                     startWith: "$code",
//                     connectFromField: "code",
//                     connectToField: "invite",
//                     as: "downline",
//                     depthField: "level"
//                 }
//             }
//         ]);

//         const downlineIds = downlineUsers[0]?.downline.map(user => user._id) || [];

//         // 3. Build the bet query with filters
//         const betQuery = {
//             userId: { $in: downlineIds },
//             status: { $in: [1, 2] }
//         };

//         // Date filters
//         if (startDate || endDate) {
//             betQuery.date = {};
//             if (startDate) betQuery.date.$gte = new Date(startDate);
//             if (endDate) betQuery.date.$lte = new Date(endDate);
//         }

//         // Apply filters if provided
//         // if (gameName) betQuery.gameName = gameName;
//         // if (eventName) betQuery.eventName = eventName;
//         // if (marketName) betQuery.marketName = marketName;
//         // if (userName) betQuery.userName = userName;

//         // 4. Check if all three filters are present
//         // const fullFilterMode = gameName && eventName && marketName && userName;



//         // 5. Retrieve bets with pagination
//         const bets = await betModel
//             .find(betQuery)
//         // console.log("bets", bets)

//         // 7. Existing grouping logic for partial filters
//         let groupKey = "gameName";

//         const reportMap = {};

//         for (const bet of bets) {
//             const key = bet[groupKey]?.trim() || "Unknown";
//             if (!reportMap[key]) {
//                 reportMap[key] = {
//                     name: key,
//                     downlineWinAmount: 0,
//                     downlineLossAmount: 0,
//                     myProfit: 0
//                 };
//             }

//             if (bet.status === 1) {
//                 reportMap[key].downlineWinAmount += bet.resultAmount || 0;
//             } else {
//                 reportMap[key].downlineLossAmount += bet.resultAmount || 0;
//             }
//         //     reportMap[key].myProfit = reportMap[key].downlineLossAmount - reportMap[key].downlineWinAmount;
//         const user = await SubAdmin.findById(bet.userId);
// reportMap[key].myProfit = user ? user.profitLoss : 0;
//         }

//         const reportArray = Object.values(reportMap);
//         const total = reportArray.reduce(
//             (acc, curr) => ({
//                 name: "Total",
//                 downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
//                 downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
//                 myProfit: acc.myProfit + curr.myProfit
//             }),
//             { name: "Total", downlineWinAmount: 0, downlineLossAmount: 0, myProfit: 0 }
//         );

//         return res.status(200).json({
//             success: true,
//             data: {
//                 report: reportArray,
//                 total
//             }
//         });

//     } catch (error) {
//         console.error("getMyReportByEvents error:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// export const getMyReportByDownline = async (req, res) => {
//     const { id } = req;
//     const { startDate, endDate, page = 1, limit = 10, targetUserId, eventName, gameName, marketName, userName } = req.query;


//     try {
//         // 1. Validate and parse inputs
//         const pageNum = Math.max(parseInt(page), 1);
//         const limitNum = Math.max(parseInt(limit), 1);
//         const skip = (pageNum - 1) * limitNum;

//         // let findId = 0

//         const findId = targetUserId || id;

//         // 2. Retrieve admin and downline structure
//         const admin = await SubAdmin.findById(findId);
//         if (!admin) throw new Error("Admin not found");


//         if (admin.secret === 0) {
//             return res.status(200).json({ message: "created successfully" });
//         }

//         let downlineResult = [];
//         let downlineIds = [];

//         if (admin.role === "user") {
//             // 👤 If the admin is a regular user, include only their own ID
//             downlineResult = [admin]; // make it an array for consistent use later
//             downlineIds = [admin._id.toString()];
//         } else {
//             // 🧑‍💼 If admin is not a user, get all downline users
//             downlineResult = await SubAdmin.find({ invite: admin.code });
//             downlineIds = downlineResult.map(user => user._id.toString());
//         }

//         // console.log("downlineIds", downlineResult);


//         // const downlineIds = downlineResult.map(user => user._id.toString());

//         // 3. Build base query
//         const betQuery = {
//             userId: { $in: downlineIds },
//             status: { $in: [1, 2] }
//         };



//         if (startDate && endDate) {
//             betQuery.date = {
//                 $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
//                 $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
//             };
//         }

//         // Additional filters
//         if (userName) betQuery.userId = userName;
//         if (gameName) betQuery.gameName = gameName;
//         if (eventName) betQuery.eventName = eventName;
//         if (marketName) betQuery.marketName = marketName;



//         // 4. Get downline profit/loss (all matching bets)
//         const userProfitAggregation = await betModel.aggregate([
//             { $match: betQuery },
//             {
//                 $group: {
//                     _id: "$userId",
//                     totalWin: {
//                         $sum: { $cond: [{ $eq: ["$status", 1] }, "$resultAmount", 0] }
//                     },
//                     totalLoss: {
//                         $sum: { $cond: [{ $eq: ["$status", 2] }, "$resultAmount", 0] }
//                     }
//                 }
//             }
//         ]);

//         // console.log("userProfitAggregation", userProfitAggregation)

//         // Create map for quick lookup
//         const profitMap = new Map();
//         userProfitAggregation.forEach(entry => {
//             profitMap.set(entry._id.toString(), {
//                 totalWin: entry.totalWin,
//                 totalLoss: entry.totalLoss,
//                 netProfit: entry.totalWin - entry.totalLoss
//             });
//         });

//         // 5. Create downline profit report
//         // const downlineProfitReport = downlineResult.map(user => ({
//         //     userId: user._id,
//         //     role: user.role,
//         //     userName: user.userName,
//         //     ...(profitMap.get(user._id.toString()) || {
//         //         totalWin: 0,
//         //         totalLoss: 0,
//         //         netProfit: 0
//         //     })
//         // }));
//         // 5. Create downline profit report
// const downlineProfitReport = downlineResult.map(user => {
//     // Get direct betting P/L
//     const directPL = profitMap.get(user._id.toString()) || {
//         totalWin: 0,
//         totalLoss: 0,
//         netProfit: 0
//     };
    
//     // Get hierarchical P/L (from user.profitLoss)
//     const hierarchicalPL = user.profitLoss || 0;
    
//     return {
//         userId: user._id,
//         role: user.role,
//         userName: user.userName,
//         totalWin: directPL.totalWin,
//         totalLoss: directPL.totalLoss,
//         netProfit: hierarchicalPL, // Use hierarchical P/L instead
//         directBettingPL: directPL.netProfit, // Keep direct P/L for reference
//         hierarchicalPL: hierarchicalPL, // Show hierarchical P/L
//         uplineProfitLoss: user.uplineProfitLoss
    
//     };
// });

//         // 6. Get paginated bets for main report
//         const [bets, totalCount] = await Promise.all([
//             betModel.find(betQuery)
//                 .sort({ createdAt: -1 })
//                 .skip(skip)
//                 .limit(limitNum)
//                 .lean(),
//             betModel.countDocuments(betQuery)
//         ]);

//         // 7. Handle different report types
//         const fullFilterMode = [gameName, eventName, marketName, userName].every(Boolean);
//         let reportData = {};

//         if (fullFilterMode) {
//             // Raw bet data
//             reportData = {
//                 reportType: 'raw',
//                 bets,
//                 pagination: {
//                     page: pageNum,
//                     limit: limitNum,
//                     total: totalCount,
//                     totalPages: Math.ceil(totalCount / limitNum)
//                 }
//             };
//         } else {
//             // Grouped data


//             // 7. Existing grouping logic for partial filters
//             let groupKey = "userName";
//             if (userName && !gameName && !eventName && !marketName) {
//                 groupKey = "gameName";
//             } else if (userName && gameName && !eventName && !marketName) {
//                 groupKey = "eventName";
//             } else if (userName && gameName && eventName && !marketName) {
//                 groupKey = "marketName";
//             }




//             // console.log("bets", bets)


//             const reportMap = {};
//             for (const bet of bets) {
//                 const key = bet[groupKey]?.trim() || "Unknown";

//                 // console.log("Group Key:", groupKey, "Key Value:", key);
//                 if (!reportMap[key]) {
//                     reportMap[key] = {
//                         name: key,
//                         eventName: bet.eventName,
//                         gameName: bet.gameName,
//                         marketName: bet.marketName,
//                         userName: bet.userName,
//                         date: bet.createdAt,
//                         downlineWinAmount: 0,
//                         downlineLossAmount: 0,
//                         myProfit: 0,
//                         result:bet.betResult,
//                         marketId: bet.market_id ? bet.market_id.match(/\d+/g)?.pop() : null,
//                     };
//                 }

//                 if (bet.status === 1) {
//                     reportMap[key].downlineWinAmount += bet.resultAmount || 0;
//                 } else {
//                     reportMap[key].downlineLossAmount += bet.resultAmount || 0;
//                 }
//                 reportMap[key].myProfit = reportMap[key].downlineWinAmount - reportMap[key].downlineLossAmount;
// //                 const user = await SubAdmin.findById(bet.userId);
// // reportMap[key].myProfit = user ? user.profitLoss : 0;
//             }


//             // console.log("reportMap", reportMap)

//             // const reportArray = Object.values(reportMap);
//             // console.log("reportArray", reportArray)
//             reportData = {
//                 reportType: 'grouped',
//                 groupBy: groupKey,
//                 reports: Object.values(reportMap),
//                 pagination: {
//                     page: pageNum,
//                     limit: limitNum,
//                     total: totalCount,
//                     totalPages: Math.ceil(totalCount / limitNum)
//                 }
//             };
//         }

//         return res.status(200).json({
//             success: true,

//             data: {
//                 ...reportData,
//                 downlineProfitReport,
//                 overallProfit: {
//                     totalWin: downlineProfitReport.reduce((sum, u) => sum + u.totalWin, 0),
//                     totalLoss: downlineProfitReport.reduce((sum, u) => sum + u.totalLoss, 0),
//                     netProfit: downlineProfitReport.reduce((sum, u) => sum + u.netProfit, 0)
//                 }
//             }
//         });

//     } catch (error) {
//         console.error("Report error:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//             ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
//         });
//     }
// };

// export const getBetHistory = async (req, res) => {
//     //   const { id } = req; // Assuming id comes from auth middleware
//     const { id, page = 1, limit = 10, startDate, endDate, selectedGame, selectedVoid } = req.query;



//     try {
//         const query = { userId: id };

//         // Filter by date if both start and end dates are provided
//         if (startDate && endDate) {
//             query.date = {
//                 $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
//                 $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
//             };
//         }

//         // Filter by selectedGame if provided
//         if (selectedGame) {
//             query.gameName = selectedGame;
//         }

//         // Filter by selectedVoid if provided
//         if (selectedVoid === "settel") {
//             query.status = { $ne: 0 }; // Not equal to 0 (settled bets)
//         } else if (selectedVoid === "void") {
//             query.status = 0; // Voided bets (status = 1)
//         } else if (selectedVoid === "unsettel") {
//             query.status = 0; // Unsettled bets (status = 0)
//         }

//         const bets = await betHistoryModel
//             .find(query)
//             .sort({ date: -1 }) // most recent first
//             .skip((page - 1) * limit)
//             .limit(parseInt(limit));

//         const total = await betHistoryModel.countDocuments(query);

//         res.status(200).json({
//             success: true,
//             data: bets,
//             pagination: {
//                 total,
//                 page: parseInt(page),
//                 pages: Math.ceil(total / limit),
//             },
//         });
//     } catch (error) {
//         console.error("Error fetching bet history:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };




import SubAdmin from "../../models/subAdminModel.js"; // Ensure SubAdmin model is imported
import betModel from "../../models/betModel.js";
import betHistoryModel from "../../models/betHistoryModel.js"



export const getMyReportByEvents1 = async (req, res) => {
    const { id } = req;
    const { startDate, endDate, page = 1, limit = 10, eventName, gameName, marketName } = req.query;
    // const { eventName, gameName, marketName } = req.body


    try {
        // 1. Retrieve the admin
        const admin = await SubAdmin.findById(id);
        if (!admin) throw new Error("Admin not found");

        // 2. Get all downline users using aggregation
        const downlineUsers = await SubAdmin.aggregate([
            { $match: { _id: admin._id } },
            {
                $graphLookup: {
                    from: "subadmins",
                    startWith: "$code",
                    connectFromField: "code",
                    connectToField: "invite",
                    as: "downline",
                    depthField: "level"
                }
            }
        ]);

        const downlineIds = downlineUsers[0]?.downline.map(user => user._id) || [];

        // 3. Build the bet query with filters
        const betQuery = {
            userId: { $in: downlineIds },
            status: { $in: [1, 2] } // 1=win, 2=loss
        };

        // Apply date filters if provided
        // if (startDate || endDate) {
        //     betQuery.date = {};
        //     if (startDate) {
        //         betQuery.date.$gte = new Date(startDate);
        //     }
        //     if (endDate) {
        //         betQuery.date.$lte = new Date(endDate);
        //     }
        // }

        if (startDate && endDate) {
            betQuery.date = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
            };
        }

        // Apply gameName filter if provided
        if (gameName) {
            betQuery.gameName = gameName;
        }

        // Apply eventName filter if provided
        if (eventName) {
            betQuery.eventName = eventName;
        }
        if (marketName) {
            betQuery.marketName = marketName;
        }

        // 4. Retrieve bets with pagination
        const bets = await betModel
            .find(betQuery)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // 5. Determine grouping key based on provided filters
        let groupKey = "gameName";
        if (gameName && !eventName && !marketName) {
            groupKey = "eventName";
        } else if (gameName && eventName && !marketName) {
            groupKey = "marketName";
        } else if (gameName && eventName && marketName) {
            groupKey = "marketName"
        }

        // 6. Group and calculate amounts
        const reportMap = {};

        for (const bet of bets) {
            const key = bet[groupKey]?.trim() || "Unknown";
            if (!reportMap[key]) {
                reportMap[key] = {
                    eventName,
                    gameName,
                    marketName,
                    name: key,
                    downlineWinAmount: 0,
                    downlineLossAmount: 0,
                    myProfit: 0
                };
            }

            if (bet.status === 1) {
                reportMap[key].downlineWinAmount += bet.resultAmount || 0;
            } else if (bet.status === 2) {
                reportMap[key].downlineLossAmount += bet.resultAmount || 0;
            }

            reportMap[key].myProfit =
                reportMap[key].downlineLossAmount - reportMap[key].downlineWinAmount;
        }

        const reportArray = Object.values(reportMap);

        // 7. Calculate totals
        const total = reportArray.reduce(
            (acc, curr) => ({
                name: "Total",
                downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
                downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
                myProfit: acc.myProfit + curr.myProfit
            }),
            { name: "Total", downlineWinAmount: 0, downlineLossAmount: 0, myProfit: 0 }
        );

        return res.status(200).json({
            success: true,
            data: {
                report: reportArray,
                total
            }
        });
    } catch (error) {
        console.error("getMyReportByEvents error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
//Count the number of uplines

export const getMyReportByEvents = async (req, res) => {
    const { id } = req;
    const { startDate, endDate, page, limit, eventName, gameName, marketName, userName } = req.query;
    try {
        
        // 1. Retrieve the admin
        const admin = await SubAdmin.findById(id);
        if (!admin) throw new Error("Admin not found");

        if (admin.secret === 0) {
            return res.status(200).json({ message: "created successfully" });
        }

        // 2. Get all downline users using aggregation
        const downlineUsers = await SubAdmin.aggregate([
            { $match: { _id: admin._id } },
            {
                $graphLookup: {
                    from: "subadmins",
                    startWith: "$code",
                    connectFromField: "code",
                    connectToField: "invite",
                    as: "downline",
                    depthField: "level"
                }
            }
        ]);




        const downlineIds = downlineUsers[0]?.downline.map(user => user._id) || [];


        // 3. Build the bet query with filters
        const betQuery = {
            userId: { $in: downlineIds },
            status: { $in: [1, 2] }
        };



        // Date filters

        if (startDate && endDate) {
            betQuery.date = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
            };
        }

        // Apply filters if provided
        if (gameName) betQuery.gameName = gameName;
        if (eventName) betQuery.eventName = eventName;
        if (marketName) betQuery.marketName = marketName;
        if (userName) betQuery.userName = userName;
        

        // 4. Check if all three filters are present
        const fullFilterMode = gameName && eventName && marketName && userName;



        // 5. Retrieve bets with pagination 

        const bets = await betModel
            .find(betQuery)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        // console.log("betQuery", betQuery)
        // console.log("bets", bets)


        //Also we have to find the latest Result and market Id of the bets we can find it by us only we have to fetch the latest betHistory record then there we can fetch market Id and result
       


        // 6. Handle full filter mode (return raw data without calculations)
        if (fullFilterMode) {
            return res.status(200).json({
                success: true,
                data: {
                    report: bets,
                    total: {
                        totalBets: bets.length,
                        totalWinAmount: bets.filter(b => b.status === 1).reduce((sum, b) => sum + (b.resultAmount || 0), 0),
                        totalLossAmount: bets.filter(b => b.status === 2).reduce((sum, b) => sum + (b.resultAmount || 0), 0)
                    }
                }
            });
        }

        // 7. Existing grouping logic for partial filters
        let groupKey = "gameName";
        if (gameName && !eventName && !marketName && !userName) {
            groupKey = "eventName";
        } else if (gameName && eventName && !marketName && !userName) {
            groupKey = "marketName";
        } else if (gameName && eventName && marketName && !userName) {
            groupKey = "userName";
        }

        const reportMap = {};

        for (const bet of bets) {
            const key = bet[groupKey]?.trim() || "Unknown";
            
            // Add this line to fetch the user for each bet:
            const user = await SubAdmin.findById(bet.userId);
            
            if (!reportMap[key]) {
                reportMap[key] = {
                    name: key,
                    eventName: bet.eventName,
                    gameName: bet.gameName,
                    marketName: bet.marketName,
                    userName: bet.userName,
                    date: bet.createdAt,
                    result: bet.betResult,
                    marketId: bet.market_id ? bet.market_id.match(/\d+/g)?.pop() : null,
                    downlineWinAmount: 0,
                    downlineLossAmount: 0,
                    myProfit: 0
                };
            }

            if (bet.status === 1) {
                reportMap[key].downlineWinAmount += bet.resultAmount || 0;
            } else {
                reportMap[key].downlineLossAmount += bet.resultAmount || 0;
            }
            
            // Change this line:
            reportMap[key].myProfit = reportMap[key].downlineLossAmount - reportMap[key].downlineWinAmount;
            
            // To this:
            // reportMap[key].myProfit = user.profitLoss || 0;
        }

        const reportArray = Object.values(reportMap);
        const total = reportArray.reduce(
            (acc, curr) => ({
                name: "Total",
                downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
                downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
                myProfit: acc.myProfit + curr.myProfit
            }),
            { name: "Total", downlineWinAmount: 0, downlineLossAmount: 0, myProfit: 0 }
        );
        

        return res.status(200).json({
            success: true,
            data: {
                report: reportArray,
                total
            }
        });
        console.log("reportArray", reportArray);
        


    } catch (error) {
        console.error("getMyReportByEvents error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getGraphBackupData = async (req, res) => {
    const { id } = req;
    const { startDate, endDate } = req.query;


    // console.log("req.query", req.query);



    try {
        // 1. Retrieve the admin
        const admin = await SubAdmin.findById(id);
        if (!admin) throw new Error("Admin not found");


        if (admin.secret === 0) {
            return res.status(200).json({ message: "created successfully" });
        }

        // 2. Get all downline users using aggregation
        const downlineUsers = await SubAdmin.aggregate([
            { $match: { _id: admin._id } },
            {
                $graphLookup: {
                    from: "subadmins",
                    startWith: "$code",
                    connectFromField: "code",
                    connectToField: "invite",
                    as: "downline",
                    depthField: "level"
                }
            }
        ]);

        const downlineIds = downlineUsers[0]?.downline.map(user => user._id) || [];

        // 3. Build the bet query with filters
        const betQuery = {
            userId: { $in: downlineIds },
            status: { $in: [1, 2] }
        };

        // Date filters
        if (startDate && endDate) {
            betQuery.date = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
            };
        }

        // Apply filters if provided
        // if (gameName) betQuery.gameName = gameName;
        // if (eventName) betQuery.eventName = eventName;
        // if (marketName) betQuery.marketName = marketName;
        // if (userName) betQuery.userName = userName;

        // 4. Check if all three filters are present
        // const fullFilterMode = gameName && eventName && marketName && userName;



        // 5. Retrieve bets with pagination
        const bets = await betModel
            .find(betQuery)
        // console.log("bets", bets)

        // 7. Existing grouping logic for partial filters
        let groupKey = "gameName";

        const reportMap = {};

        for (const bet of bets) {
            const key = bet[groupKey]?.trim() || "Unknown";
            if (!reportMap[key]) {
                reportMap[key] = {
                    name: key,
                    downlineWinAmount: 0,
                    downlineLossAmount: 0,
                    myProfit: 0
                };
            }

            if (bet.status === 1) {
                reportMap[key].downlineWinAmount += bet.resultAmount || 0;
            } else {
                reportMap[key].downlineLossAmount += bet.resultAmount || 0;
            }
        //     reportMap[key].myProfit = reportMap[key].downlineLossAmount - reportMap[key].downlineWinAmount;
        const user = await SubAdmin.findById(bet.userId);
reportMap[key].myProfit = user ? user.profitLoss : 0;
        }

        const reportArray = Object.values(reportMap);
        const total = reportArray.reduce(
            (acc, curr) => ({
                name: "Total",
                downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
                downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
                myProfit: acc.myProfit + curr.myProfit
            }),
            { name: "Total", downlineWinAmount: 0, downlineLossAmount: 0, myProfit: 0 }
        );

        return res.status(200).json({
            success: true,
            data: {
                report: reportArray,
                total
            }
        });

    } catch (error) {
        console.error("getMyReportByEvents error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const getGraphLiveData = async (req, res) => {
    const { id } = req;
    const { startDate, endDate } = req.query;


    // console.log("req.query", req.query);



    try {
        // 1. Retrieve the admin
        const admin = await SubAdmin.findById(id);
        if (!admin) throw new Error("Admin not found");



        if (admin.secret === 0) {
            return res.status(200).json({ message: "created successfully" });
        }


        // 2. Get all downline users using aggregation
        const downlineUsers = await SubAdmin.aggregate([
            { $match: { _id: admin._id } },
            {
                $graphLookup: {
                    from: "subadmins",
                    startWith: "$code",
                    connectFromField: "code",
                    connectToField: "invite",
                    as: "downline",
                    depthField: "level"
                }
            }
        ]);

        const downlineIds = downlineUsers[0]?.downline.map(user => user._id) || [];

        // 3. Build the bet query with filters
        const betQuery = {
            userId: { $in: downlineIds },
            status: { $in: [1, 2] }
        };

        // Date filters
        if (startDate || endDate) {
            betQuery.date = {};
            if (startDate) betQuery.date.$gte = new Date(startDate);
            if (endDate) betQuery.date.$lte = new Date(endDate);
        }

        // Apply filters if provided
        // if (gameName) betQuery.gameName = gameName;
        // if (eventName) betQuery.eventName = eventName;
        // if (marketName) betQuery.marketName = marketName;
        // if (userName) betQuery.userName = userName;

        // 4. Check if all three filters are present
        // const fullFilterMode = gameName && eventName && marketName && userName;



        // 5. Retrieve bets with pagination
        const bets = await betModel
            .find(betQuery)
        // console.log("bets", bets)

        // 7. Existing grouping logic for partial filters
        let groupKey = "gameName";

        const reportMap = {};

        for (const bet of bets) {
            const key = bet[groupKey]?.trim() || "Unknown";
            if (!reportMap[key]) {
                reportMap[key] = {
                    name: key,
                    downlineWinAmount: 0,
                    downlineLossAmount: 0,
                    myProfit: 0
                };
            }

            if (bet.status === 1) {
                reportMap[key].downlineWinAmount += bet.resultAmount || 0;
            } else {
                reportMap[key].downlineLossAmount += bet.resultAmount || 0;
            }
        //     reportMap[key].myProfit = reportMap[key].downlineLossAmount - reportMap[key].downlineWinAmount;
        const user = await SubAdmin.findById(bet.userId);
reportMap[key].myProfit = user ? user.profitLoss : 0;
        }

        const reportArray = Object.values(reportMap);
        const total = reportArray.reduce(
            (acc, curr) => ({
                name: "Total",
                downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
                downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
                myProfit: acc.myProfit + curr.myProfit
            }),
            { name: "Total", downlineWinAmount: 0, downlineLossAmount: 0, myProfit: 0 }
        );

        return res.status(200).json({
            success: true,
            data: {
                report: reportArray,
                total
            }
        });

    } catch (error) {
        console.error("getMyReportByEvents error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getprofitlossofdownlineofreportlist = async (req, res) => {
    const { id } = req;
    const { startDate, endDate, page = 1, limit = 10, targetUserId, eventName, gameName, marketName, userName } = req.query;
    try {
        // 1. Validate and parse inputs
        const pageNum = Math.max(parseInt(page), 1);
        const limitNum = Math.max(parseInt(limit), 1);
        const skip = (pageNum - 1) * limitNum;

        const findId = targetUserId || id;

        // 2. Retrieve admin and downline structure
        const admin = await SubAdmin.findById(findId);
        if (!admin) throw new Error("Admin not found");


        if (admin.secret === 0) {
            return res.status(200).json({ message: "created successfully" });
        }

        let downlineResult = [];
        let downlineIds = [];

        if (admin.role === "user") {
            // 👤 If the admin is a regular user, include only their own ID
            downlineResult = [admin]; // make it an array for consistent use later
            downlineIds = [admin._id.toString()];
        } else {
            // 🧑‍💼 If admin is not a user, get all downline users
            downlineResult = await SubAdmin.find({ invite: admin.code });
            downlineIds = downlineResult.map(user => user._id.toString());
        }

        // console.log("downlineIds", downlineResult);


        // const downlineIds = downlineResult.map(user => user._id.toString());

        // 3. Build base query
        const betQuery = {
            userId: { $in: downlineIds },
            status: { $in: [1, 2] }
        };



        if (startDate && endDate) {
            betQuery.date = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
            };
        }

        // Additional filters
        if (userName) betQuery.userId = userName;
        if (gameName) betQuery.gameName = gameName;
        if (eventName) betQuery.eventName = eventName;
        if (marketName) betQuery.marketName = marketName;



        // 4. Get downline profit/loss (all matching bets)
        const userProfitAggregation = await betModel.aggregate([
            { $match: betQuery },
            {
                $group: {
                    _id: "$userId",
                    totalWin: {
                        $sum: { $cond: [{ $eq: ["$status", 1] }, "$resultAmount", 0] }
                    },
                    totalLoss: {
                        $sum: { $cond: [{ $eq: ["$status", 2] }, "$resultAmount", 0] }
                    }
                }
            }
        ]);

        // console.log("userProfitAggregation", userProfitAggregation)

        // Create map for quick lookup
        const profitMap = new Map();
        userProfitAggregation.forEach(entry => {
            profitMap.set(entry._id.toString(), {
                totalWin: entry.totalWin,
                totalLoss: entry.totalLoss,
                netProfit: entry.totalWin - entry.totalLoss
            });
        });

        // 5. Create downline profit report
        // const downlineProfitReport = downlineResult.map(user => ({
        //     userId: user._id,
        //     role: user.role,
        //     userName: user.userName,
        //     ...(profitMap.get(user._id.toString()) || {
        //         totalWin: 0,
        //         totalLoss: 0,
        //         netProfit: 0
        //     })
        // }));
        // 5. Create downline profit report
const downlineProfitReport = downlineResult.map(user => {
    // Get direct betting P/L
    const directPL = profitMap.get(user._id.toString()) || {
        totalWin: 0,
        totalLoss: 0,
        netProfit: 0
    };
    
    // Get hierarchical P/L (from user.profitLoss)
    const hierarchicalPL = user.profitLoss || 0;
    
    return {
        userId: user._id,
        role: user.role,
        userName: user.userName,
        totalWin: directPL.totalWin,
        totalLoss: directPL.totalLoss,
        netProfit: hierarchicalPL, // Use hierarchical P/L instead
        directBettingPL: directPL.netProfit, // Keep direct P/L for reference
        hierarchicalPL: hierarchicalPL, // Show hierarchical P/L
        uplineProfitLoss: user.uplineProfitLoss
    
    };
});

        // 6. Get paginated bets for main report
        const [bets, totalCount] = await Promise.all([
            betModel.find(betQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            betModel.countDocuments(betQuery)
        ]);

        // 7. Handle different report types
        const fullFilterMode = [gameName, eventName, marketName, userName].every(Boolean);
        let reportData = {};

        if (fullFilterMode) {
            // Raw bet data
            reportData = {
                reportType: 'raw',
                bets,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / limitNum)
                }
            };
        } else {
            // Grouped data


            // 7. Existing grouping logic for partial filters
            let groupKey = "userName";
            if (userName && !gameName && !eventName && !marketName) {
                groupKey = "gameName";
            } else if (userName && gameName && !eventName && !marketName) {
                groupKey = "eventName";
            } else if (userName && gameName && eventName && !marketName) {
                groupKey = "marketName";
            }




            // console.log("bets", bets)


            const reportMap = {};
            for (const bet of bets) {
                const key = bet[groupKey]?.trim() || "Unknown";

                // console.log("Group Key:", groupKey, "Key Value:", key);
                if (!reportMap[key]) {
                    reportMap[key] = {
                        name: key,
                        eventName: bet.eventName,
                        gameName: bet.gameName,
                        marketName: bet.marketName,
                        userName: bet.userName,
                        date: bet.createdAt,
                        downlineWinAmount: 0,
                        downlineLossAmount: 0,
                        myProfit: 0,
                        result:bet.betResult,
                        marketId: bet.market_id ? bet.market_id.match(/\d+/g)?.pop() : null,
                    };
                }

                if (bet.status === 1) {
                    reportMap[key].downlineWinAmount += bet.resultAmount || 0;
                } else {
                    reportMap[key].downlineLossAmount += bet.resultAmount || 0;
                }
                reportMap[key].myProfit = reportMap[key].downlineWinAmount - reportMap[key].downlineLossAmount;
//                 const user = await SubAdmin.findById(bet.userId);
// reportMap[key].myProfit = user ? user.profitLoss : 0;
            }


            // console.log("reportMap", reportMap)

            // const reportArray = Object.values(reportMap);
            // console.log("reportArray", reportArray)
            reportData = {
                reportType: 'grouped',
                groupBy: groupKey,
                reports: Object.values(reportMap),
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / limitNum)
                }
            };
        }

        return res.status(200).json({
            success: true,

            data: {
                ...reportData,
                downlineProfitReport,
                overallProfit: {
                    totalWin: downlineProfitReport.reduce((sum, u) => sum + u.totalWin, 0),
                    totalLoss: downlineProfitReport.reduce((sum, u) => sum + u.totalLoss, 0),
                    netProfit: downlineProfitReport.reduce((sum, u) => sum + u.netProfit, 0)
                }
            }
        });

    } catch (error) {
        console.error("Report error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};




// export const getprofitlossofdownlineofreportlist = async (req, res) => {
//   console.log("oh hello");
//   console.log("get my report called");
//   const { id } = req;
//   const {
//     startDate,
//     endDate,
//     page = 1,
//     limit = 10,
//     targetUserId,
//     eventName,
//     gameName,
//     marketName,
//     userName,
//     groupBy, // new query param (optional)
//   } = req.query;

//   try {
//     // 1️⃣ Validate & setup pagination
//     const pageNum = Math.max(parseInt(page), 1);
//     const limitNum = Math.max(parseInt(limit), 1);
//     const skip = (pageNum - 1) * limitNum;

//     const findId = targetUserId || id;
//     const admin = await SubAdmin.findById(findId);
//     if (!admin) throw new Error("Admin not found");

//     if (admin.secret === 0) {
//       return res.status(200).json({ message: "Created successfully" });
//     }

//     // 2️⃣ Determine downlines
//     let downlineResult = [];
//     let downlineIds = [];

//     if (admin.role === "user") {
//       downlineResult = [admin];
//       downlineIds = [admin._id.toString()];
//     } else {
//       downlineResult = await SubAdmin.find({ invite: admin.code });
//       downlineIds = downlineResult.map((u) => u._id.toString());
//     }

//     // 3️⃣ Build bet query
//     const betQuery = {
//       userId: { $in: downlineIds },
//       status: { $in: [1, 2] },
//     };

//     if (startDate && endDate) {
//       betQuery.date = {
//         $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
//         $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
//       };
//     }

//     if (userName) betQuery.userName = userName;
//     if (gameName) betQuery.gameName = gameName;
//     if (eventName) betQuery.eventName = eventName;
//     if (marketName) betQuery.marketName = marketName;

//     // 4️⃣ Event-wise OR user-wise aggregation
//     let aggregationPipeline = [];

//     // Base match
//     aggregationPipeline.push({ $match: betQuery });

//     // Determine grouping key
//     let groupField = "$userId"; // default user-wise
//     if (groupBy === "eventName") groupField = "$eventName";
//     else if (groupBy === "gameName") groupField = "$gameName";
//     else if (groupBy === "marketName") groupField = "$marketName";
//     else if (groupBy === "userName") groupField = "$userName";

//     aggregationPipeline.push({
//       $group: {
//         _id: groupField,
//         totalWin: {
//           $sum: { $cond: [{ $eq: ["$status", 1] }, "$resultAmount", 0] },
//         },
//         totalLoss: {
//           $sum: { $cond: [{ $eq: ["$status", 2] }, "$resultAmount", 0] },
//         },
//         bets: {
//           $push: {
//             userId: "$userId",
//             userName: "$userName",
//             eventName: "$eventName",
//             gameName: "$gameName",
//             marketName: "$marketName",
//             betResult: "$betResult",
//             resultAmount: "$resultAmount",
//             status: "$status",
//             date: "$createdAt",
//           },
//         },
//       },
//     });

//     aggregationPipeline.push({
//       $project: {
//         _id: 0,
//         groupValue: "$_id",
//         totalWin: 1,
//         totalLoss: 1,
//         netProfit: { $subtract: ["$totalWin", "$totalLoss"] },
//         bets: 1,
//       },
//     });

//     aggregationPipeline.push({ $sort: { netProfit: -1 } });

//     const groupedProfitData = await betModel.aggregate(aggregationPipeline);

//     console.log("grouped profit data is:",groupedProfitData);

//     // 5️⃣ Downline-wise P/L (overall)
//     const userProfitAggregation = await betModel.aggregate([
//       { $match: betQuery },
//       {
//         $group: {
//           _id: "$userId",
//           totalWin: {
//             $sum: { $cond: [{ $eq: ["$status", 1] }, "$resultAmount", 0] },
//           },
//           totalLoss: {
//             $sum: { $cond: [{ $eq: ["$status", 2] }, "$resultAmount", 0] },
//           },
//         },
//       },
//     ]);

//     const profitMap = new Map();
//     userProfitAggregation.forEach((e) => {
//       profitMap.set(e._id.toString(), {
//         totalWin: e.totalWin,
//         totalLoss: e.totalLoss,
//         netProfit: e.totalWin - e.totalLoss,
//       });
//     });

//     const downlineProfitReport = downlineResult.map((user) => {
//       const directPL = profitMap.get(user._id.toString()) || {
//         totalWin: 0,
//         totalLoss: 0,
//         netProfit: 0,
//       };

//       const hierarchicalPL = user.profitLoss || 0;

//       return {
//         userId: user._id,
//         role: user.role,
//         userName: user.userName,
//         totalWin: directPL.totalWin,
//         totalLoss: directPL.totalLoss,
//         directNetProfit: directPL.netProfit,
//         hierarchicalPL,
//         uplineProfitLoss: user.uplineProfitLoss,
//       };
//     });

//     // 6️⃣ Paginated raw bets
//     const [bets, totalCount] = await Promise.all([
//       betModel
//         .find(betQuery)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limitNum)
//         .lean(),
//       betModel.countDocuments(betQuery),
//     ]);

//     // 7️⃣ Final response
//     return res.status(200).json({
//       success: true,
//       data: {
//         reportType: groupBy ? ${groupBy}-wise : "default",
//         groupedReport: groupedProfitData,
//         downlineProfitReport,
//         bets,
//         pagination: {
//           page: pageNum,
//           limit: limitNum,
//           total: totalCount,
//           totalPages: Math.ceil(totalCount / limitNum),
//         },
//         overallProfit: {
//           totalWin: downlineProfitReport.reduce(
//             (sum, u) => sum + u.totalWin,
//             0
//           ),
//           totalLoss: downlineProfitReport.reduce(
//             (sum, u) => sum + u.totalLoss,
//             0
//           ),
//           netProfit: downlineProfitReport.reduce(
//             (sum, u) => sum + u.directNetProfit,
//             0
//           ),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Report error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//       ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
//     });
//   }
// };




export const getBetHistory = async (req, res) => {
    //   const { id } = req; // Assuming id comes from auth middleware
    const { id, page = 1, limit = 10, startDate, endDate, selectedGame, selectedVoid } = req.query;



    try {
        const query = { userId: id };

        // Filter by date if both start and end dates are provided
        if (startDate && endDate) {
            query.date = {
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
            query.status = 0; // Voided bets (status = 1)
        } else if (selectedVoid === "unsettel") {
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



export const getprofitlossofdownlineofreportlistUserData = async (req, res) => {
    console.log("after change");
    const { id } = req;
    const { startDate, endDate, page = 1, limit = 10, targetUserId } = req.query;

    try {
        // 1️⃣ Find admin
        const admin = await SubAdmin.findById(targetUserId || id);
        if (!admin) throw new Error("Admin not found");

        // 2️⃣ Get all downline users

        let downlineIds=[];

        if(admin.role="user")
        {
            downlineIds.push(admin._id);
        }

        else
        {
            const downlineUsers = await SubAdmin.aggregate([
            { $match: { _id: admin._id } },
            {
                $graphLookup: {
                    from: "subadmins",
                    startWith: "$code",
                    connectFromField: "code",
                    connectToField: "invite",
                    as: "downline"
                }
            }
        ]);

        downlineIds = downlineUsers[0]?.downline.map(u => u._id.toString()) || []

        }
        console.log("downlineIds", downlineIds);

        // 3️⃣ Build bet filter query
        const betQuery = {
            userId: { $in: downlineIds },
            status: { $in: [1, 2] }
        };

        if (startDate && endDate) {
            betQuery.date = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        // 4️⃣ Fetch bets
        const bets = await betModel
            .find(betQuery)
            .sort({ eventName: 1, createdAt: -1 })
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit));

        if (!bets.length) {
            return res.status(200).json({ success: true, data: [] });
        }

        // 5️⃣ Group by eventName
        const report = {};
        for (const bet of bets) {
            const eventKey = bet.eventName || "Unknown Event";

            if (!report[eventKey]) {
                report[eventKey] = {
                    eventName: eventKey,
                    gameName: bet.gameName,
                    settledDate: bet.date,
                    totalProfitLoss: 0,
                    bets: [],
                    summary: {
                        totalStakes: 0,
                        backSubtotal: 0,
                        laySubtotal: 0,
                        marketSubtotal: 0,
                        commission: 0,
                        netMarketTotal: 0
                    }
                };
            }

            // 6️⃣ Calculate per-bet profit/loss
            const profitLoss = bet.resultAmount || 0;

            // 7️⃣ Add bet details
            report[eventKey].bets.push({
                userName: bet.userName,
                betId: bet._id.toString(),
                selection: bet.teamName,
                odds: bet.xValue,
                stake: bet.price,
                type: bet.otype,
                placedAt: bet.createdAt,
                profitLoss
            });

            // 8️⃣ Update event summary
            report[eventKey].summary.totalStakes += bet.price;
            if (bet.otype === "back") report[eventKey].summary.backSubtotal += profitLoss;
            if (bet.otype === "lay") report[eventKey].summary.laySubtotal += profitLoss;

            report[eventKey].summary.marketSubtotal =
                report[eventKey].summary.backSubtotal + report[eventKey].summary.laySubtotal;
            report[eventKey].summary.netMarketTotal = report[eventKey].summary.marketSubtotal;
            report[eventKey].totalProfitLoss += profitLoss;
        }

        return res.status(200).json({
            success: true,
            data: Object.values(report)
        });
    } catch (error) {
        console.error("getProfitLossReportByEvent error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};