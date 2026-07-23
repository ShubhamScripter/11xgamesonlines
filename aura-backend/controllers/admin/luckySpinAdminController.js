import LuckySpinReward from '../../models/luckySpinRewardModel.js';
import LuckySpinConfig, { getLuckySpinConfigDoc } from '../../models/luckySpinConfigModel.js';

export const getRewardsAndConfig = async (req, res) => {
  try {
    const rewards = await LuckySpinReward.find().sort({ number: 1 });
    const config = await getLuckySpinConfigDoc();

    res.status(200).json({
      success: true,
      data: {
        rewards,
        config,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { mode, customRandomSelections, manualSelection } = req.body;
    
    const config = await getLuckySpinConfigDoc();
    
    if (mode) config.mode = mode;
    if (customRandomSelections) config.customRandomSelections = customRandomSelections;
    if (manualSelection !== undefined) config.manualSelection = manualSelection;
    
    await config.save();
    
    res.status(200).json({
      success: true,
      message: 'Config updated successfully',
      data: config,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Optional: Admin can create/update rewards if needed
export const saveReward = async (req, res) => {
  try {
    const { number, winGift, type, value } = req.body;
    
    let reward = await LuckySpinReward.findOne({ number });
    if (reward) {
      reward.winGift = winGift || reward.winGift;
      reward.type = type || reward.type;
      reward.value = value !== undefined ? value : reward.value;
      await reward.save();
    } else {
      reward = await LuckySpinReward.create({ number, winGift, type, value });
    }
    
    res.status(200).json({
      success: true,
      message: 'Reward saved successfully',
      data: reward,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
