import 'dotenv/config';
import mongoose from 'mongoose';
import LuckySpinReward from './models/luckySpinRewardModel.js';

const rewards = [
  { number: 1, winGift: '3888', type: 'cash', value: 3888 },
  { number: 2, winGift: '888', type: 'cash', value: 888 },
  { number: 3, winGift: '588', type: 'cash', value: 588 },
  { number: 4, winGift: '188', type: 'cash', value: 188 },
  { number: 5, winGift: '88', type: 'cash', value: 88 },
  { number: 6, winGift: '98', type: 'cash', value: 98 },
  { number: 7, winGift: '28', type: 'cash', value: 28 },
  { number: 8, winGift: '10', type: 'cash', value: 10 },
];

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
}).then(async () => {
  console.log('Connected to DB');
  
  for (const reward of rewards) {
    await LuckySpinReward.findOneAndUpdate(
      { number: reward.number },
      reward,
      { upsert: true, new: true }
    );
    console.log(`Upserted segment ${reward.number}`);
  }
  
  console.log('Done seeding rewards!');
  process.exit(0);
}).catch(err => {
  console.error('DB Connection Error:', err);
  process.exit(1);
});
