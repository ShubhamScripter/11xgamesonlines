import axios from "axios";
import http from "http";
import https from "https";

// Force IPv4 resolution
const agentOptions = {
  family: 4,     // <---- Force IPv4
  hints: 0,
};

export const axiosIPv4 = axios.create({
  httpAgent: new http.Agent(agentOptions),
  httpsAgent: new https.Agent(agentOptions),
});
