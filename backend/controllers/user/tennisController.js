// // controllers/tennisController.js
// // import axios from "axios";
// const axios= require('axios')
// // exports.fetchTennisData = async (req, res) => {
// //   try {
// //     const response = await axios.get(
// //       "https://api.cricketid.xyz/esid?key=uniique5557878&sid=2"
// //     );

// //     const t1Data = response.data.data.t1 || [];
// //     const t2Data = response.data.data.t2 || [];

// //     const combinedData = [...t1Data, ...t2Data]
// //       .map((match) => ({
// //         id: match.gmid,
// //         title:match.cname,
// //         match: match.ename,
// //         date: match.stime,
// //         inplay: match.iplay,
// //         channels: match.f ? ["F"] : [],
// //         odds: match.section.reduce((acc, section, index) => {
// //           const homeOdds = section.odds[0]?.odds || "0";
// //           const awayOdds = section.odds[1]?.odds || "0";

// //           acc.push({ home: homeOdds, away: awayOdds });

// //           if (index < match.section.length - 1) {
// //             acc.push({ home: "0", away: "0" });
// //           }

// //           return acc;
// //         }, []),
// //       }))
// //       .sort((a, b) => new Date(a.date) - new Date(b.date));

// //     res.status(200).json({ success: true, data: combinedData });
// //   } catch (error) {
// //     console.error("Error fetching tennis data:", error.message);
// //     res
// //       .status(500)
// //       .json({ success: false, message: "Failed to fetch tennis data" });
// //   }
// // };

// exports.fetchTennisData = async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://reddbull.in/check/tennis/allmatches"
//     );

//     // const t1Data = response.data.data.t1 || [];
//     // const t2Data = response.data.data.t2 || [];

//     // const combinedData = [...t1Data, ...t2Data]
//     //   .map((match) => ({
//     //     id: match.gmid,
//     //     title:match.cname,
//     //     match: match.ename,
//     //     date: match.stime,
//     //     inplay: match.iplay,
//     //     channels: match.f ? ["F"] : [],
//     //     odds: match.section.reduce((acc, section, index) => {
//     //       const homeOdds = section.odds[0]?.odds || "0";
//     //       const awayOdds = section.odds[1]?.odds || "0";

//     //       acc.push({ home: homeOdds, away: awayOdds });

//     //       if (index < match.section.length - 1) {
//     //         acc.push({ home: "0", away: "0" });
//     //       }

//     //       return acc;
//     //     }, []),
//     //   }))
//     //   .sort((a, b) => new Date(a.date) - new Date(b.date));
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
//     res.status(200).json({ success: true, data: filteredMatches });
//   } catch (error) {
//     console.error("Error fetching tennis data:", error.message);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch tennis data" });
//   }
// };

// // exports.fetchTannisBettingData = async (req, res) => {
// //   const { gameid } = req.query;

// //   if (!gameid) {
// //     return res.status(400).json({ success: false, message: "Missing gameid" });
// //   }

// //   try {
// //     const response = await axios.get(
// //       `https://api.cricketid.xyz/getPriveteData?key=uniique5557878&gmid=${gameid}&sid=2`
// //     );

// //     const json = response.data;

// //     if (json.success) {
// //       res.status(200).json({
// //         success: true,
// //         data: response.data,
// //       });
// //     } else {
// //       res
// //         .status(500)
// //         .json({ success: false, message: "Invalid response from API" });
// //     }
// //   } catch (error) {
// //     console.error("Error in fetchBettingData:", error.message);
// //     res.status(500).json({ success: false, message: "Server error" });
// //   }
// // };

// exports.fetchTannisBettingData = async (req, res) => {
//   const { gameid } = req.query;

//   if (!gameid) {
//     return res.status(400).json({ success: false, message: "Missing gameid" });
//   }

//   try {
//     const response = await axios.get(
//       `https://reddbull.in/check/tennis/fetchmatch?match=${gameid}`
//     );

//     const json = response.data;

//     if (json.success) {
//       res.status(200).json({
//         success: true,
//         data: response.data,
//       });
//     } else {
//       res
//         .status(500)
//         .json({ success: false, message: "Invalid response from API" });
//     }
//   } catch (error) {
//     console.error("Error in fetchBettingData:", error.message);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

import axios from "axios";

export const fetchTennisData = async (req, res) => {
  try {
    const response = await axios.get(
      "https://reddbull.in/check/tennis/allmatches"
    );

    // const t1Data = response.data.data.t1 || [];
    // const t2Data = response.data.data.t2 || [];

    // const combinedData = [...t1Data, ...t2Data]
    //   .map((match) => ({
    //     id: match.gmid,
    //     title:match.cname,
    //     match: match.ename,
    //     date: match.stime,
    //     inplay: match.iplay,
    //     channels: match.f ? ["F"] : [],
    //     odds: match.section.reduce((acc, section, index) => {
    //       const homeOdds = section.odds[0]?.odds || "0";
    //       const awayOdds = section.odds[1]?.odds || "0";

    //       acc.push({ home: homeOdds, away: awayOdds });

    //       if (index < match.section.length - 1) {
    //         acc.push({ home: "0", away: "0" });
    //       }

    //       return acc;
    //     }, []),
    //   }))
    //   .sort((a, b) => new Date(a.date) - new Date(b.date));
    const result = response.data?.data?.result || [];

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
    res.status(200).json({ success: true, data: filteredMatches });
  } catch (error) {
    console.error("Error fetching tennis data:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch tennis data" });
  }
};



export const fetchTannisBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: "Missing gameid" });
  }

  try {
    const response = await axios.get(
      `https://reddbull.in/check/tennis/fetchmatch?match=${gameid}`
    );

    const json = response.data;

    if (json.success) {
      res.status(200).json({
        success: true,
        data: response.data,
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Invalid response from API" });
    }
  } catch (error) {
    console.error("Error in fetchBettingData:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};