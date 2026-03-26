// import axios from "axios";
// import { axiosIPv4 } from "../utils/axiosIPv4.js";
// const CLIENT_ADDRESS = "wickspin_d92af26938a90950d";

// const BASE_URL = "https://www.shubdxinternational.com/exchange/streaming/v2/";

// const GET_STREAMING_URL = "https://shubdxinternational.com/exchange/streaming/v2/getStreaming";

// export const getLiveStream = async (req, res) => {
//     console.log("live streming api called")
//   try {
//     const { event_type_id, event_id } = req.query;

//     if (!event_type_id || !event_id) {
//       return res.status(400).json({
//         success: false,
//         message: "event_type_id and event_id are required",
//       });
//     }

//     // 1️⃣ Get streaming_id
//     // const firstURL = `${BASE_URL}/${CLIENT_ADDRESS}?event_type_id=${event_type_id}&event_id=${event_id}`;
//     const firstURL = `${BASE_URL}${CLIENT_ADDRESS}?event_type_id=${event_type_id}&event_id=${event_id}`;



//     console.log("first url",firstURL)
    
//     const firstResponse = await axiosIPv4.get(firstURL);
//     console.log("first response",firstResponse.data)

//     if (!firstResponse.data.streaming_id) {
//       return res.status(404).json({
//         success: false,
//         message: "Streaming ID not found for this event.",
//       });
//     }

//     const streaming_id = firstResponse.data.streaming_id;

//     // const streaming_id="63331977-e";

//     // 2️⃣ Get streaming URL using streaming_id
//     const secondURL = `${GET_STREAMING_URL}?event_id=${streaming_id}`;
//     const secondResponse = await axiosIPv4.get(secondURL);

//     const streamingUrl = secondResponse.data.streamUrl;

//     if (!streamingUrl) {
//       return res.status(404).json({
//         success: false,
//         message: "Streaming URL not found",
//       });
//     }

//     return res.json({
//       success: true,
//       streaming_id,
//       streamingUrl,
//     });

//   } catch (err) {
//       console.log("error message")
//       console.log("err",err.message)
//       console.log("error response message",err.response.data)
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


import axios from "axios";
import { axiosIPv4 } from "../utils/axiosIPv4.js";

const STREAMING_API_URL = "https://sporta-api.iomhost.com:4200/spb/match-live-stream";

export const getLiveStream = async (req, res) => {
  try {
    const { match_id, sportsName, match_name } = req.body;

    // Validate required fields
    if (!match_id || !sportsName || !match_name) {
      return res.status(400).json({
        success: false,
        message: "match_id, sportsName, and match_name are required",
      });
    }

    // Validate sportsName
    const validSports = ["cricket", "tennis", "football"];
    if (!validSports.includes(sportsName.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "sportsName must be one of: cricket, tennis, football",
      });
    }

    // Make POST request to streaming API
    const response = await axiosIPv4.post(STREAMING_API_URL, {
      match_id,
      sportsName: sportsName,
      match_name,
    });

    // Check if the API response is successful
    if (!response.data || !response.data.status) {
      return res.status(404).json({
        success: false,
        message: response.data?.message || "Streaming data not found",
      });
    }

    // Return the streaming iframe data
    console.log("response",response.data)
    return res.json({
      success: true,
      status: response.data.status,
      subCode: response.data.subCode,
      message: response.data.message,
      data: response.data.data, // This contains the iframe HTML
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Error fetching live stream",
      error: err.response?.data || err.message,
    });
  }
};

