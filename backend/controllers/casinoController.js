import axios from "axios";
import adminModel from "../models/adminModel.js";
import * as cheerio from "cheerio";
 
// Hardcoded provider base and key (as requested, no env)
const CRIC_BASE = "https://api.cricketid.xyz";
const CRIC_API_KEY = "demo123";
 
export const isCasinoGame = (gameId, cid, gid, tabno) => {
  try {
    if (cid != null && Number(cid) === 4) return true;
    if (gid != null && Number(gid) === 35) return true;
    if (tabno != null && Number(tabno) === 6) return true;
    if (typeof gameId === "string" && !/^\d+$/.test(gameId)) return true;
    return false;
  } catch (e) {
    return false;
  }
};
 
export const getCasinoData = async (req, res) => {
  try {
    const { gameId, cid, gid, tabno } = req.query || {};
 
    const admin = await adminModel.findOne({}, "type").lean();
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    if (admin.type === 0) return res.status(403).json({ success: false, message: "Access denied" });
 
    const url = `${CRIC_BASE}/casino/tableid?key=${CRIC_API_KEY}`;
    const response = await axios.get(url, { timeout: 10000 });
 
    if (response?.data?.success) {
      return res.status(200).json({ success: true, data: response.data.data || [] });
    } else {
      return res.status(502).json({
        success: false,
        message: "Failed to fetch casino data from provider",
        provider: response?.data,
      });
    }
  } catch (error) {
    console.error("getCasinoData error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Server error", error: error?.message });
  }
};
 
//Fetch CasinoBetting data
export const getCasinoBettingData=async(req,res)=>{
  const {gameId}=req.query ;
  if(!gameId){
 
    return res.status(400).json({success:false,message:"Game Id is required"})
  }
  try{
    const response=await axios.get(`${CRIC_BASE}/casino/data?key=demo123&type=${gameId}`);
    console.log("➡️ Hitting provider URL:", `${CRIC_BASE}/casino/data?key=demo123&type=${gameId}`);
    return res.status(200).json({
      message:"Casino Betting data fetched Successfully",
      data:response.data
 
 
    })
  }
 
   catch (error) {
    console.error("Error in fetchingCasinoBettingData", error?.message);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error?.message });
  }
}
 
//Fetch CasinoResult data
export const getCasinoResultData=async(req,res)=>{
  const {gameId}=req.query ;
  if(!gameId){
 
    return res.status(400).json({success:false,message:"Game Id is required"})
  }
  try{
    const response=await axios.get(`${CRIC_BASE}/casino/result?key=demo123&type=${gameId}`);
    console.log("➡️ Hitting provider URL:", `${CRIC_BASE}/casino/result?key=demo123&type=${gameId}`);
 
 
 
    const json=response.data;
    if(json.success){
      return res.status(200).json({success:true,data:json.data});
    }
    else{
      return res.status(500).json({success:false,message:"Invalid Response from API"})
    }
  }
  catch(error){
    console.error("Error in fetchingCasinoBettingData",error?.message)
    res.status(500).json({success:false,message:"Internal Server Error",error:error?.message})
  }
}
export const getCasinoResultDetailData=async(req,res)=>{
  try{
 
    const{gameId,mid}=req.query
    if(!gameId || !mid){
      return res.status(400).json({message:"GameId or mid is missing"})
    }
     const response=await axios.get(`${CRIC_BASE}/casino/detail_result?key=demo123&type=${gameId}&mid=${mid}`);
    console.log("➡️ Hitting provider URL:", `${CRIC_BASE}/casino/detail_result?key=demo123&type=${gameId}&mid=${mid}`);
 
    const json=response.data;
    return res.status(200).json({message:"Success",data:json?.data?.t1})
 
 
 
 
  }
  catch(error){
    console.error("Error in fetchingCasinoResultBettingData",error?.message)
    res.status(500).json({success:false,message:"Internal server Error,error?.message "})
 
  }
}
 
// server/getCasinoVideo.js


// export const getCasinoVideo = async (req, res) => {
//   try {
//     const { gameId } = req.query;
//     if (!gameId) {
//       return res.status(400).json({ success: false, message: "Missing gameId" });
//     }

//     const url = `https://live.cricketid.xyz/casino-tv?id=${encodeURIComponent(gameId)}`;
//     const { data: html } = await axios.get(url, {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
//         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
//         "Accept-Language": "en-US,en;q=0.9",
//         "Referer": "https://live.cricketid.xyz/",
//       },
//       timeout: 15000,
//       maxRedirects: 5,
//       validateStatus: s => s >= 200 && s < 400,
//     });

//     const normalize = (s) =>
//       s.replace(/\\\//g, "/").replace(/\\u002F/gi, "/").replace(/&amp;/g, "&");

//     const $ = cheerio.load(html);

//     // Things we want to return
//     let wsUrl = null;          // wss://.../authstream/stream.mp4
//     let hlsUrl = null;         // https://.../authhttp/playlist.m3u8
//     let mp4Url = null;         // https://.../authhttp/stream.mp4
//     let streamname = null;     // rtmp streamname
//     let jwtoken = null;        // JWT used by h5live security
//     let tokenExp = null;       // optional: JWT expiry (unix) if we can read it

//     $("script").each((_, el) => {
//       const script = ($(el).html() || "").trim();
//       if (!script) return;

//       // urls
//       if (!wsUrl) {
//         const m = script.match(/"websocket"\s*:\s*["'`](https?:\/\/|wss:\/\/)([^"'`\\]+)["'`]/i);
//         if (m) wsUrl = normalize(m[0].split(/["'`]/)[1]);
//       }
//       if (!hlsUrl) {
//         const m = script.match(/"hls"\s*:\s*["'`](https?:\/\/[^"'`\\]+?\.m3u8)[^"'`]*["'`]/i);
//         if (m) hlsUrl = normalize(m[1]);
//       }
//       if (!mp4Url) {
//         const m = script.match(/"progressive"\s*:\s*["'`](https?:\/\/[^"'`\\]+?\.mp4)[^"'`]*["'`]/i);
//         if (m) mp4Url = normalize(m[1]);
//       }
//       if (!streamname) {
//         const m = script.match(/"streamname"\s*:\s*["'`]([^"'`]+)["'`]/i);
//         if (m) streamname = normalize(m[1]);
//       }

//       // token (supports single/double/backtick + escaped)
//       if (!jwtoken) {
//         const m =
//           script.match(/"jwtoken"\s*:\s*`([^`]+)`/) ||
//           script.match(/"jwtoken"\s*:\s*["']([^"'`]+)["']/);
//         if (m) jwtoken = normalize(m[1]);
//       }
//     });

//     if (!jwtoken || (!hlsUrl && !wsUrl)) {
//       return res.status(404).json({
//         success: false,
//         message: "Could not find required player configuration on the page.",
//         details: { wsUrl: !!wsUrl, hlsUrl: !!hlsUrl, jwtoken: !!jwtoken },
//       });
//     }

//     // (Optional) decode token expiry if it's a JWT; don't verify, just parse payload
//     try {
//       const payload = JSON.parse(
//         Buffer.from(jwtoken.split(".")[1], "base64").toString("utf8")
//       );
//       if (payload?.exp) tokenExp = payload.exp;
//     } catch { /* ignore */ }

//     return res.status(200).json({
//       success: true,
//       message: "Success",
//       h5live: {
//         server: {
//           websocket: wsUrl || null,
//           hls: hlsUrl || null,
//           progressive: mp4Url || null,
//         },
//         rtmp: streamname ? { streamname } : null,
//         security: { jwtoken, exp: tokenExp },
//       },
//     });
//   } catch (error) {
//     console.error("❌ getCasinoVideo error:", error?.message);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error?.message || String(error),
//     });
//   }
// };
export const getCasinoVideo = async (req, res) => {
  try {
    const { gameId } = req.query;
    if (!gameId) {
      return res.status(400).json({ success: false, message: "Missing gameId" });
    }

    const url = `https://live.cricketid.xyz/casino-tv?id=${encodeURIComponent(gameId)}`;
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://live.cricketid.xyz/",
      },
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: s => s >= 200 && s < 400,
    });

    const normalize = (s) =>
      s.replace(/\\\//g, "/").replace(/\\u002F/gi, "/").replace(/&amp;/g, "&").trim();

    const $ = cheerio.load(html);

    // ---- values to extract ----
    let wsUrl = null;        // wss://... (must be ws/wss, not a file like .mp4)
    let hlsUrl = null;       // https://.../playlist.m3u8
    let mp4Url = null;       // https://.../stream.mp4
    let rtmpUrl = null;      // rtmp://...
    let streamname = null;   // Av7gf-...
    let jwtoken = null;      // JWT
    let tokenExp = null;     // optional: decoded exp from JWT

    $("script").each((_, el) => {
      const script = (($(el).html() || "").trim());
      if (!script) return;

      // websocket: only accept ws:// or wss:// and ignore literal "websocket"
      if (!wsUrl) {
        const m = script.match(/"websocket"\s*:\s*["'`](wss?:\/\/[^"'`\\]+)["'`]/i);
        if (m) {
          const candidate = normalize(m[1]);
          if (!/\/stream\.mp4(\?|$)/i.test(candidate)) wsUrl = candidate; // guard against file path
        }
      }

      if (!hlsUrl) {
        const m = script.match(/"hls"\s*:\s*["'`](https?:\/\/[^"'`\\]+?\.m3u8[^"'`]*)["'`]/i);
        if (m) hlsUrl = normalize(m[1]);
      }

      if (!mp4Url) {
        const m = script.match(/"progressive"\s*:\s*["'`](https?:\/\/[^"'`\\]+?\.mp4[^"'`]*)["'`]/i);
        if (m) mp4Url = normalize(m[1]);
      }

      if (!streamname) {
        const m = script.match(/"streamname"\s*:\s*["'`]([^"'`]+)["'`]/i);
        if (m) streamname = normalize(m[1]);
      }

      // try to get a real RTMP url if present
      if (!rtmpUrl) {
        const m = script.match(/"rtmp"\s*:\s*{[^}]*"url"\s*:\s*["'`](rtmp:\/\/[^"'`\\]+)["'`]/i);
        if (m) rtmpUrl = normalize(m[1]);
      }

      if (!jwtoken) {
        let m = script.match(/"jwtoken"\s*:\s*`([^`]+)`/);
        if (!m) m = script.match(/"jwtoken"\s*:\s*["']([^"'`]+)["']/);
        if (m) jwtoken = normalize(m[1]);
      }
    });

    // decode exp (optional)
    if (jwtoken) {
      try {
        const payload = JSON.parse(Buffer.from(jwtoken.split(".")[1], "base64").toString("utf8"));
        if (payload?.exp) tokenExp = payload.exp;
      } catch { /* ignore */ }
    }

    // Require JWT + at least one playable H5Live path (ws or hls)
    if (!jwtoken || (!wsUrl && !hlsUrl)) {
      return res.status(404).json({
        success: false,
        message: "Could not find required player configuration on the page.",
        details: { websocket: !!wsUrl, hls: !!hlsUrl, jwtoken: !!jwtoken },
      });
    }

    // Only include RTMP if COMPLETE (url + streamname). Otherwise omit it!
    const rtmp =
      rtmpUrl && streamname ? { url: rtmpUrl, streamname } : null;

    return res.status(200).json({
      success: true,
      message: "Success",
      h5live: {
        server: {
          websocket: wsUrl,             // null if not found
          hls: hlsUrl,                  // null if not found
          progressive: mp4Url,          // null if not found
        },
        security: { jwtoken },
        ...(rtmp ? { rtmp } : {}),      // include ONLY when complete
      },
      meta: { exp: tokenExp ?? null }
    });

  } catch (error) {
    console.error("❌ getCasinoVideo error:", error?.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error?.message || String(error),
    });
  }
};
