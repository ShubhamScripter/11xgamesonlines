// import axios from "axios";
// const axios = require('axios')
// // import adminModel from "../models/adminModel.js";
// const adminModel =require('../../models/user.model.js')
// //  exports.getCricketData = async (req, res) => {
// //   try {
// //     const response = await axios.get(
// //       "https://api.cricketid.xyz/esid?sid=4&key=uniique5557878"
// //     );

// //     const admin = await adminModel.findOne({}, "type").lean();
// //     if (!admin) {

// //       return null;
// //     }

// //     if (admin.type === 0) {
// //       res.status(200).json({ success: false, message: "" });
// //     }


// //     if (response.data.success) {
// //       const t1 = response.data.data.t1 || [];
// //       const t2 = response.data.data.t2 || [];
// //       const allMatches = [...t1, ...t2];

// //       const transformed = allMatches
// //         .map((match) => {
// //           const team1Odds =
// //             match.section && match.section.length >= 1
// //               ? {
// //                 home: match.section[0].odds[0]?.odds?.toString() || "0",
// //                 away: match.section[0].odds[1]?.odds?.toString() || "0",
// //               }
// //               : { home: "0", away: "0" };

// //           const team2Odds =
// //             match.section && match.section.length >= 2
// //               ? {
// //                 home: match.section[1].odds[0]?.odds?.toString() || "0",
// //                 away: match.section[1].odds[1]?.odds?.toString() || "0",
// //               }
// //               : { home: "0", away: "0" };

// //           const oddsArr = [team1Odds, { home: "0", away: "0" }, team2Odds];

// //           return {
// //             id: match.gmid,
// //             title:match.cname,
// //             match: match.ename,
// //             date: match.stime,
// //             channels: [],
// //             odds: oddsArr,
// //             inplay: match.iplay,
// //           };
// //         })
// //         .sort((a, b) => new Date(a.date) - new Date(b.date));

// //       const now = new Date();

// //       const filteredMatches = transformed.filter((match) => {
// //         const matchDate = new Date(match.date);
// //         return match.inplay === true || matchDate >= now;
// //       });

// //       res.status(200).json({ success: true, matches: filteredMatches });
// //     } else {
// //       res
// //         .status(400)
// //         .json({ success: false, message: "Failed to fetch matches" });
// //     }
// //   } catch (err) {
// //     console.error("Error fetching matches:", err.message);
// //     res.status(500).json({ success: false, message: "Server error" });
// //   }
// // };

// // exports.getCricketData = async (req, res) => {
// //   try {
// //     const response = await axios.get(
// //       "https://reddbull.in/check/cricket/allmatches"
// //     );

// //     // Extract the result array
// //     const result = response.data?.data?.result || [];

// //     const bettingData = result.map((item) => ({
// //       id: item.groupById,                       // ✅ no "data." before item
// //       title: item.competition?.name || "",
// //       match: item.event?.name || "",
// //       date: item.event?.openDate || "",
// //       inplay: item.inPlay

// //     }));

// //     res.status(200).json({
// //       success: true,
// //       data: bettingData,
// //     });

// //   } catch (err) {
// //     console.error("Error fetching matches:", err.message);
// //     res.status(500).json({ success: false, message: "Server error" });
// //   }
// // };

// exports.getCricketData = async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://reddbull.in/check/cricket/allmatches"
//     );

//     const result = response.data?.data?.result || [];

//     // Helper: format date like "9/6/2025 8:20:00 PM"
//     const formatDate = (dateString) => {
//       if (!dateString) return "";
//       const date = new Date(dateString);
//       return date.toLocaleString("en-US", {
//         month: "numeric",
//         day: "numeric",
//         year: "numeric",
//         hour: "numeric",
//         minute: "numeric",
//         second: "numeric",
//         hour12: true,
//       });
//     };

//     const transformed = result.map((item) => ({
//       id: item.groupById,
//       title: item.competition?.name || "",
//       match: item.event?.name || "",
//       date: formatDate(item.event?.openDate), //  formatted
//       inplay: item.inPlay || false,
//     }));

//     const now = new Date();
//     const filteredMatches = transformed.filter((match) => {
//       const matchDate = new Date(match.date);
//       return match.inplay === true || matchDate >= now;
//     });

//     res.status(200).json({
//       success: true,
//       matches: filteredMatches,
//     });
//   } catch (err) {
//     console.error("Error fetching matches:", err.message);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };



// // exports.fetchCrirketBettingData = async (req, res) => {
// //   const { gameid } = req.query;

// //   if (!gameid) {
// //     return res.status(400).json({ success: false, message: "Missing gameid" });
// //   }

// //   try {
// //     const response = await axios.get(
// //       `https://api.cricketid.xyz/getPriveteData?key=uniique5557878&gmid=${gameid}&sid=4`
// //     );

// //     const json = response.data;

// //     if (json.success) {
// //       return res.status(200).json({ success: true, data: json });
// //     } else {
// //       return res.status(500).json({ success: false, message: "Invalid response from API" });
// //     }
// //   } catch (error) {
// //     console.error("Error in fetchBettingData:", error.message);
// //     return res.status(500).json({ success: false, message: "Server error" });
// //   }
// // };

// exports.fetchCrirketBettingData = async (req, res) => {
//   const { gameid } = req.query;

//   if (!gameid) {
//     return res.status(400).json({ success: false, message: "Missing gameid" });
//   }

//   try {
//     const response = await axios.get(
//       `https://reddbull.in/check/cricket/fetchmatch?match=${gameid}`
//     );

//     const json = response.data;

//     if (json.success) {
//       return res.status(200).json({ success: true, data: json });
//     } else {
//       return res.status(500).json({ success: false, message: "Invalid response from API" });
//     }
//   } catch (error) {
//     console.error("Error in fetchBettingData:", error.message);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

import axios from "axios";

export const getCricketData  = async (req, res) => {
  try {
    const response = await axios.get(
      "https://reddbull.in/check/cricket/allmatches"
    );

    const result = response.data?.data?.result || [];
    console.log("result length:", result.length);
    // Helper: format date like "9/6/2025 8:20:00 PM"
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      });
    };

    const transformed = result.map((item) => ({
      id: item.groupById,
      title: item.competition?.name || "",
      match: item.event?.name || "",
      date: formatDate(item.event?.openDate), //  formatted
      inplay: item.inPlay || false,
    }));

    const now = new Date();
    const filteredMatches = transformed.filter((match) => {
      const matchDate = new Date(match.date);
      return match.inplay === true || matchDate >= now;
    });

    res.status(200).json({
      success: true,
      matches: filteredMatches,
    });
  } catch (err) {
    console.error("Error fetching matches:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const fetchCricketBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: "Missing gameid" });
  }

  try {
    const response = await axios.get(
      `https://reddbull.in/check/cricket/fetchmatch?match=${gameid}`
    );

    const json = response.data;

    if (json.success) {
      return res.status(200).json({ success: true, data: json });
    } else {
      return res.status(500).json({ success: false, message: "Invalid response from API" });
    }
  } catch (error) {
    console.log("error", error);
    console.error("Error in fetchBettingData:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

