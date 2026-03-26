import { WebSocketServer } from "ws";
// import axios from "axios";
import { axiosIPv4 } from "../utils/axiosIPv4.js";

// Track clients and their subscribed gameids
let clients = [];
let cachedData = {};
let wssInstance = null;

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });
  wssInstance = wss;

  wss.on("connection", (ws) => {
    console.log(" WebSocket client connected");

    // Each client will have structure: { ws, gameid }
    // let client = { ws, gameid: null };
    let client = { ws, gameid: null, type: null,apitype: null, userName: null }; // ⬅ include type
    clients.push(client)

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "subscribe" && data.gameid) {
          client.gameid = data.gameid;
          client.apitype = data.apitype || "cricket"; // default = cricket
          console.log(` Subscribed to gameid: ${data.gameid}, apitype: ${client.apitype}`);
        }
        if (data.type === "identify" && data.userName) {
          client.userName = data.userName;
          console.log(` Client identified as: ${data.userName}`);
        }
      } catch (err) {
        console.error(" Invalid message:", message);
      }
    });

    ws.on("close", () => {
      clients = clients.filter((c) => c.ws !== ws);
      console.log(" WebSocket client disconnected");
    });
  });

  const pollBettingData = async () => {
    const uniqueSubscriptions = clients
      .map((c) => (c.gameid ? { gameid: c.gameid, apitype: c.apitype || "cricket" } : null))
      .filter(Boolean);

    const groupedByGameId = [...new Map(uniqueSubscriptions.map(obj => [`${obj.gameid}_${obj.apitype}`, obj])).values()];

    for (const { gameid, apitype } of groupedByGameId) {
      try {
       
        let endpoint = `https://shubdxinternational.com/sports/cricket/fetchmatch?match=${gameid}`;

        if (apitype === "tennis") {

          endpoint = `https://shubdxinternational.com/sports/tennis/fetchmatch?match=${gameid}`;
    
        } else if (apitype === "soccer") {
          console.log("soccer")
       
          endpoint = `https://shubdxinternational.com/sports/football/fetchmatch?match=${gameid}`;
        }
        const response = await axiosIPv4.get(endpoint);
        const newData = response.data;

        let bettingArray = Array.isArray(newData.result) ? newData.result : [];
        if (newData.success) {
          const cacheKey = `${gameid}_${apitype}`;
          if (JSON.stringify(newData) !== JSON.stringify(cachedData[cacheKey])) {
            cachedData[cacheKey] = newData;

            // Notify relevant clients
            clients.forEach((client) => {
              if (
                client.gameid === gameid &&
                client.apitype === apitype &&
                client.ws.readyState === 1
              ) {
                client.ws.send(JSON.stringify({ gameid, apitype, data: bettingArray }));
              }
            });
          }
        }
      } catch (error) {
        console.error(` Polling error for ${gameid} (${apitype}):`, error.message);
      }
    }
  };

  // Poll every 2 seconds
  setInterval(pollBettingData, 2000);

};

export const sendToUser = (userName, payload) => {
  if (!wssInstance) return console.warn(" WebSocket not initialized yet");

  clients.forEach((client) => {
    if (client.userName === userName && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(payload));
    }
  });
};