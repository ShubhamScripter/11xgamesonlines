
// import axios from "axios";

// export const getSoccerInplayData  = async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://baajilive.com/check/inplay"
//     );
//     console.log("response", response.data);
//     const result = response.data?.data?.result || {};
//     const inPlayEvents = Array.isArray(result.inPlayEvents)
//       ? result.inPlayEvents
//       : [];
//     const popularEvents = Array.isArray(result.popularEvents)
//       ? result.popularEvents
//       : [];
//     const combinedEvents = [...inPlayEvents, ...popularEvents];
//     console.log("total events:", combinedEvents.length);
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
//     const transformed = [];
//     const seenIds = new Set();

//     combinedEvents.forEach((item) => {
//       if (!item || typeof item !== "object") return;

//       const market = item.market || {};
//       const event = item.event || market.event || {};

//       const eventType =
//         item.eventType ||
//         market.eventType ||
//         event.eventType ||
//         null;

//       const eventTypeId =
//         item.eventTypeId ||
//         market.eventTypeId ||
//         event.eventTypeId ||
//         null;

//       const isFootball =
//         (typeof eventType === "string" &&
//           eventType.toLowerCase() === "football") ||
//         eventTypeId === "1";

//       if (!isFootball) {
//         return;
//       }

//       const id =
//         market.groupById ||
//         event.id ||
//         market.id ||
//         item.groupById ||
//         item.id;

//       if (!id || seenIds.has(id)) {
//         return;
//       }

//       seenIds.add(id);

//       transformed.push({
//         id,
//         title: market.competition?.name || event.name || "",
//         match: event.name || market.name || "",
//         date: formatDate(event.openDate || market.event?.openDate),
//         inplay: item.isInPlay ?? market.inPlay ?? false,
//       });
//     });

//     res.status(200).json({
//       success: true,
//       matches: transformed,
//     });
//   } catch (err) {
//     console.error("Error fetching matches:", err.message);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// export const fetchSoccerData = async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://baajilive.com/check/football/allmatches"
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
//     res.status(200).json({ success: true, data: filteredMatches });
//   } catch (error) {
//     console.error("Error fetching soccer data:", error.message);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch soccer data" });
//   }
// };

import { axiosIPv4 } from "../utils/axiosIPv4.js";
// import axios from "axios";
import matchOverrideModel from "../models/matchOverrideModel.js";

const getSuspendedSoccerIds = async () => {
  const overrides = await matchOverrideModel
    .find({ sport: "soccer", isSuspended: true }, "matchId")
    .lean();
  return new Set(overrides.map((doc) => doc.matchId));
};

export const getSoccerInplayData = async (req, res) => {
  try {
    const suspendedIds = await getSuspendedSoccerIds();

    // const response = await axios.get("https://baajilive.com/check/inplay");
    const response = await axiosIPv4.get("https://shubdxinternational.com/sports/inplay");

    const result = response.data?.data?.result || {};
    const inPlayEvents = Array.isArray(result.inPlayEvents) ? result.inPlayEvents : [];
    const popularEvents = Array.isArray(result.popularEvents) ? result.popularEvents : [];
    const combinedEvents = [...inPlayEvents, ...popularEvents];

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
//     const formatDate = (dateString) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   return date.toLocaleString("en-GB", {
//     timeZone: "Asia/Dhaka",   // Force BST time
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: false,
//   });
// };


    const transformed = [];
    const seenIds = new Set();

    combinedEvents.forEach((item) => {
      if (!item || typeof item !== "object") return;

      const market = item.market || {};
      const event = item.event || market.event || {};
      const eventType = item.eventType || market.eventType || event.eventType || null;
      const eventTypeId = item.eventTypeId || market.eventTypeId || event.eventTypeId || null;

      const isFootball =
        (typeof eventType === "string" && eventType.toLowerCase() === "football") ||
        eventTypeId === "1";

      if (!isFootball) return;

      const id =
        market.groupById ||
        event.id ||
        market.id ||
        item.groupById ||
        item.id;

      if (!id || suspendedIds.has(id) || seenIds.has(id)) return;

      seenIds.add(id);

      transformed.push({
        id,
        title: market.competition?.name || event.name || "",
        match: event.name || market.name || "",
        date: formatDate(event.openDate || market.event?.openDate),
        inplay: item.isInPlay ?? market.inPlay ?? false,
      });
    });

    res.status(200).json({ success: true, matches: transformed });
  } catch (err) {
    console.error("Error fetching matches:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const fetchSoccerData = async (req, res) => {
  try {
    const suspendedIds = await getSuspendedSoccerIds();

    // const response = await axios.get("https://baajilive.com/check/football/allmatches");
    const response = await axiosIPv4.get("https://shubdxinternational.com/sports/football/allmatches");

    const result = response.data?.data?.result || [];

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
//     const formatDate = (dateString) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   return date.toLocaleString("en-GB", {
//     timeZone: "Asia/Dhaka",   // Force BST time
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: false,
//   });
// };


    const transformed = result
      .map((item) => ({
        id: item.groupById,
        title: item.competition?.name || "",
        match: item.event?.name || "",
        date: formatDate(item.event?.openDate),
        inplay: item.inPlay || false,
      }))
      .filter((match) => match.id && !suspendedIds.has(match.id));

    const now = new Date();
    const filteredMatches = transformed.filter((match) => {
      const matchDate = new Date(match.date);
      return match.inplay === true || matchDate >= now;
    });

    res.status(200).json({ success: true, data: filteredMatches });
  } catch (error) {
    console.error("Error fetching soccer data:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch soccer data" });
  }
};

export const fetchsoccerBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: "Missing gameid" });
  }

  try {
    // const response = await axios.get(
    //   `https://baajilive.com/check/football/fetchmatch?match=${gameid}`
    // );
    const response = await axiosIPv4.get(
      `https://shubdxinternational.com/sports/football/fetchmatch?match=${gameid}`
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

export const getfootballScoreV2 = async (req, res) => {
  const { event_id } = req.query;

  if (!event_id) {
    return res.status(400).json({ success: false, message: "Missing event_id" });
  }

  try {
    const response = await axiosIPv4.get(
      `https://shubdxinternational.com/score/football-v2?event_id=${event_id}`
    );

    return res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error("Error fetching cricket score-v2:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
