import dotenv from 'dotenv';
import { createProviderD } from '../services/matchApi/providerD.js';

dotenv.config();

const provider = createProviderD();
const EVENT_ID = process.argv[2] || '35715699';

console.log('Testing ProviderD Betfair flow for eventId:', EVENT_ID);

const list = await provider.fetchMatchList(4);
const found = [...(list.data?.t1 || [])].find(
  (m) => String(m.gmid) === String(EVENT_ID)
);
console.log('\n=== LIST MATCH ===');
console.log(
  found
    ? {
        gmid: found.gmid,
        ename: found.ename,
        cname: found.cname,
        inplay: found.inplay,
        odds0: found.section?.[0]?.odds?.[0]?.odds,
      }
    : 'not in list (may be ok if many events)'
);

const betting = await provider.fetchMatchData(EVENT_ID, 4);
console.log('\n=== BETTING MARKETS ===');
console.log('success:', betting.success, 'count:', betting.data?.length);
(betting.data || []).forEach((m, i) => {
  console.log(
    `${i + 1}. ${m.mname || m.name} | id: ${m.marketId} | status: ${m.status} | runners: ${m.runners?.length ?? m.section?.length}`
  );
});
