import LuckySpinReward from '../models/luckySpinRewardModel.js';
import LuckySpinConfig, { getLuckySpinConfigDoc } from '../models/luckySpinConfigModel.js';
import LuckySpinHistory from '../models/luckySpinHistoryModel.js';
import SubAdmin from '../models/subAdminModel.js';

function getDhakaDateString() {
  // Returns YYYY-MM-DD for Asia/Dhaka
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Dhaka', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  return formatter.format(new Date());
}

export const getSpinInfo = async (req, res) => {
  try {
    const rewards = await LuckySpinReward.find().sort({ number: 1 });
    
    let coins = 0;
    let spinsToday = 0;
    let maxSpins = 10;
    
    if (req.id) {
      const user = await SubAdmin.findById(req.id).select('luckySpinCoins luckySpinsToday luckySpinDate');
      if (user) {
        coins = user.luckySpinCoins || 0;
        const today = getDhakaDateString();
        spinsToday = user.luckySpinDate === today ? (user.luckySpinsToday || 0) : 0;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        rewards,
        userStats: {
          coins,
          spinsToday,
          maxSpins,
          remainingSpins: Math.max(0, maxSpins - spinsToday)
        }
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const spin = async (req, res) => {
  try {
    const userId = req.id;
    const user = await SubAdmin.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const today = getDhakaDateString();
    
    // Reset daily counter if it's a new day
    if (user.luckySpinDate !== today) {
      user.luckySpinDate = today;
      user.luckySpinsToday = 0;
    }

    // Rule 1: Max 10 spins per day
    if (user.luckySpinsToday >= 10) {
      return res.status(400).json({ success: false, message: 'You have reached the maximum of 10 spins for today.' });
    }

    // Rule 2: 30 coins required per spin
    const SPIN_COST = 30;
    if ((user.luckySpinCoins || 0) < SPIN_COST) {
      return res.status(400).json({ success: false, message: `Insufficient coins. You need ${SPIN_COST} coins to spin.` });
    }

    const config = await getLuckySpinConfigDoc();
    const allRewards = await LuckySpinReward.find();
    
    if (allRewards.length === 0) {
      return res.status(400).json({ success: false, message: 'No rewards configured' });
    }

    let winningNumber;

    if (config.mode === 'manual') {
      winningNumber = config.manualSelection;
    } else if (config.mode === 'custom_random' && config.customRandomSelections.length > 0) {
      const randomIndex = Math.floor(Math.random() * config.customRandomSelections.length);
      winningNumber = config.customRandomSelections[randomIndex];
    } else {
      // random mode, or fallback if custom_random has no selections
      const randomIndex = Math.floor(Math.random() * allRewards.length);
      winningNumber = allRewards[randomIndex].number;
    }

    const winningReward = allRewards.find(r => r.number === winningNumber);

    if (!winningReward) {
      return res.status(500).json({ success: false, message: 'Invalid reward selection' });
    }

    // Deduct coins and increment spin count
    user.luckySpinCoins -= SPIN_COST;
    user.luckySpinsToday += 1;

    // Update balance and apply wagering requirement if cash reward
    if (winningReward.type === 'cash' && winningReward.value > 0) {
      user.balance += winningReward.value;
      
      // Rule 4: Turnover requirement 1x slots, 3x non-slots.
      // We add prize * 3 to the required wagering. In bet processing, slots bets will count 3x.
      const wagerIncrease = winningReward.value * 3;
      user.requiredWagering = (Number(user.requiredWagering) || 0) + wagerIncrease;
    }

    await user.save();

    // Record History
    await LuckySpinHistory.create({
      userId: user._id,
      rewardNumber: winningReward.number,
      winGift: winningReward.winGift,
      rewardType: winningReward.type,
      rewardValue: winningReward.value,
      cost: SPIN_COST, 
    });

    res.status(200).json({
      success: true,
      data: {
        winningNumber: winningReward.number,
        winGift: winningReward.winGift,
        type: winningReward.type,
        value: winningReward.value,
        newBalance: user.balance,
        remainingCoins: user.luckySpinCoins,
        spinsToday: user.luckySpinsToday
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
