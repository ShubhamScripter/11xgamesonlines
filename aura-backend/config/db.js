import dns from 'dns';
import mongoose from 'mongoose';
import { bootLog } from './silenceConsole.js';

/**
 * On some Windows setups Node's default DNS fails (querySrv ECONNREFUSED)
 * while Compass/nslookup work. Use explicit DNS servers for mongodb+srv.
 */
const dnsServers = (process.env.DNS_SERVERS || '8.8.8.8,8.8.4.4,1.1.1.1')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
if (dnsServers.length) {
  dns.setServers(dnsServers);
}

const connectDB = async () => {
  if (!process.env.MONGO_URI?.trim()) {
    bootLog('MongoDB connection failed: MONGO_URI is not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    bootLog('Connected to MongoDB:', mongoose.connection.name);
  } catch (error) {
    bootLog('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
