/**
 * One-time cleanup: remove manual deposit/withdraw requests for legacy methods
 * (bank, upi, whatsapp) that are no longer supported in the UI.
 *
 * Usage: node scripts/cleanupLegacyDepositRequests.mjs
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

dotenv.config();

const LEGACY_METHODS = ['bank', 'upi', 'whatsapp'];

const dnsServers = (process.env.DNS_SERVERS || '8.8.8.8,8.8.4.4,1.1.1.1')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
if (dnsServers.length) {
  dns.setServers(dnsServers);
}

const schema = new mongoose.Schema({}, { strict: false, collection: 'manualdepositrequests' });
const ManualDepositRequest = mongoose.model('ManualDepositRequestCleanup', schema);

if (!process.env.MONGO_URI?.trim()) {
  console.error('MONGO_URI is not set in .env');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  const count = await ManualDepositRequest.countDocuments({
    method: { $in: LEGACY_METHODS },
  });
  console.log(`Found ${count} legacy deposit/withdraw request(s) to delete.`);

  if (count > 0) {
    const result = await ManualDepositRequest.deleteMany({
      method: { $in: LEGACY_METHODS },
    });
    console.log(`Deleted ${result.deletedCount} record(s).`);
  }

  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error('Cleanup failed:', error.message);
  process.exit(1);
}
