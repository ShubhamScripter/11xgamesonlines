import DeactivatedMatch from '../../models/matchSettingsModel.js';

const VALID_SPORTS = ['cricket', 'tennis', 'soccer', 'horse-racing'];

//Toggle Match Status (Deactivate/Activate)
export const toggleMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { sport, matchName } = req.body;

    //Validation checks
    if (!matchId || !sport || !matchName) {
      return res.status(400).json({ message: 'All field are required' });
    }
    if (!VALID_SPORTS.includes(sport)) {
      return res.status(400).json({ message: 'Invalid sport' });
    }

    //Check if superamdin
    if (req.role != 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can change match status',
      });
    }

    //Check if match is already deactivated

    const existing = await DeactivatedMatch.findOne({ matchId });

    if (existing) {
      //Match is already deactivated,so we need to activate it
      await DeactivatedMatch.deleteOne({ matchId });
      return res.status(200).json({
        success: true,
        message: 'Match activated successfully',
        data: {
          matchId,
          isActive: true,
        },
      });
    } else {
      //Match is active->Deactivate it
      await DeactivatedMatch.create({ matchId, sport, matchName });
      return res.status(200).json({
        success: true,
        message: 'Match deactivated successfully',
        data: {
          matchId,
          isActive: false,
        },
      });
    }
  } catch (error) {
    console.error('Error in toggleMatchStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const mapDeactivatedMatch = (m) => ({
  _id: m._id,
  matchId: m.matchId,
  eventId: m.matchId,
  marketId: m.matchId,
  sport: m.sport,
  matchName: m.matchName || `Match ${m.matchId}`,
  suspendedAt: m.createdAt,
  reason: m.reason || '',
  status: 'Suspended',
  deactivateBy: m.deactivateBy
    ? {
        _id: m.deactivateBy._id,
        userName: m.deactivateBy.userName,
        role: m.deactivateBy.role,
      }
    : null,
});

// GET /inactivematches — used by admin InActive Match page
export const getInactiveMatches = async (req, res) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(
      Math.max(1, parseInt(req.query.limit, 10) || 100),
      500
    );
    const skip = (pageNum - 1) * limitNum;
    const { sport, search } = req.query;

    const filter = {};
    if (sport && sport !== 'all' && VALID_SPORTS.includes(sport)) {
      filter.sport = sport;
    }
    if (search && String(search).trim()) {
      filter.matchName = { $regex: String(search).trim(), $options: 'i' };
    }

    const [deactivatedMatches, totalRecords] = await Promise.all([
      DeactivatedMatch.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('deactivateBy', 'userName role')
        .lean(),
      DeactivatedMatch.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Inactive matches fetched successfully',
      data: deactivatedMatches.map(mapDeactivatedMatch),
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalRecords / limitNum) || 1,
      totalRecords,
    });
  } catch (error) {
    console.error('Error in getInactiveMatches:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// PATCH /matches/:matchId/status — activate or suspend (superadmin)
export const updateMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { sport, action, matchName } = req.body;

    if (!matchId) {
      return res.status(400).json({ success: false, message: 'Match ID is required' });
    }

    if (req.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can change match status',
      });
    }

    if (action === 'activate') {
      const deleted = await DeactivatedMatch.deleteOne({ matchId: String(matchId) });
      return res.status(200).json({
        success: true,
        message: 'Match activated successfully',
        data: { matchId, isActive: true, removed: deleted.deletedCount > 0 },
      });
    }

    if (action === 'suspend') {
      if (!sport || !VALID_SPORTS.includes(sport)) {
        return res.status(400).json({ success: false, message: 'Valid sport is required' });
      }
      if (!matchName || !String(matchName).trim()) {
        return res.status(400).json({ success: false, message: 'Match name is required' });
      }

      const doc = await DeactivatedMatch.findOneAndUpdate(
        { matchId: String(matchId) },
        {
          matchId: String(matchId),
          sport,
          matchName: String(matchName).trim(),
          deactivateBy: req.id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Match deactivated successfully',
        data: { matchId: doc.matchId, isActive: false },
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use "activate" or "suspend".',
    });
  } catch (error) {
    console.error('Error in updateMatchStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//Get all deactivated matches (legacy shape)
export const getDeactivatedMatches = async (req, res) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(
      Math.max(1, parseInt(req.query.limit, 10) || 10),
      500
    );
    const skip = (pageNum - 1) * limitNum;

    const [deactivatedMatches, totalRecords] = await Promise.all([
      DeactivatedMatch.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('deactivateBy', 'userName role')
        .lean(),
      DeactivatedMatch.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Deactivated matches fetched successfully',
      data: {
        matches: deactivatedMatches.map(mapDeactivatedMatch),
      },
      totalRecords,
    });
  } catch (error) {
    console.error('Error in getDeactivatedMatches:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//Check if a specific match is active
export const checkMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const deactivatedMatch = await DeactivatedMatch.findOne({ matchId });
    if (deactivatedMatch) {
      return res.status(200).json({
        success: true,
        message: 'Match is deactivated',
        data: {
          isActive: false,
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        matchId,
        isActive: !deactivatedMatch,
      },
    });
  } catch (error) {
    console.error('Error in checkMatchStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
