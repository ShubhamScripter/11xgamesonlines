import DeactivatedMatch from '../../models/matchSettingsModel.js';
import { normalizeMatchSectionList } from '../../constants/matchSectionConstants.js';
import {
  getMatchSectionSettings,
  getMatchSectionSettingsMap,
  invalidateMatchSectionCache,
  serializeMatchSectionDoc,
} from '../../utils/matchSectionSettings.js';

const VALID_SPORTS = ['cricket', 'tennis', 'soccer', 'horse-racing'];

function canManageMatchSettings(role) {
  return role === 'superadmin';
}

const mapDeactivatedMatch = (m) => {
  const settings = serializeMatchSectionDoc(m);
  return {
    _id: m._id,
    matchId: m.matchId,
    eventId: m.matchId,
    marketId: m.matchId,
    sport: m.sport,
    matchName: m.matchName || `Match ${m.matchId}`,
    suspendedAt: m.createdAt,
    matchDisabled: settings.matchDisabled,
    disabledSections: settings.disabledSections,
    sections: settings.sections,
    status: settings.matchDisabled ? 'Suspended' : 'Section controls',
    deactivateBy: m.deactivateBy
      ? {
          _id: m.deactivateBy._id,
          userName: m.deactivateBy.userName,
          role: m.deactivateBy.role,
        }
      : null,
  };
};

//Toggle Match Status (Deactivate/Activate) — legacy
export const toggleMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { sport, matchName } = req.body;

    if (!matchId || !sport || !matchName) {
      return res.status(400).json({ message: 'All field are required' });
    }
    if (!VALID_SPORTS.includes(sport)) {
      return res.status(400).json({ message: 'Invalid sport' });
    }
    if (!canManageMatchSettings(req.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can change match status',
      });
    }

    const existing = await DeactivatedMatch.findOne({ matchId });

    if (existing) {
      await DeactivatedMatch.deleteOne({ matchId });
      invalidateMatchSectionCache();
      return res.status(200).json({
        success: true,
        message: 'Match activated successfully',
        data: { matchId, isActive: true },
      });
    }

    await DeactivatedMatch.create({
      matchId,
      sport,
      matchName,
      matchDisabled: true,
      disabledSections: [],
      deactivateBy: req.id,
    });
    invalidateMatchSectionCache();

    return res.status(200).json({
      success: true,
      message: 'Match deactivated successfully',
      data: { matchId, isActive: false },
    });
  } catch (error) {
    console.error('Error in toggleMatchStatus:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getInactiveMatches = async (req, res) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 100), 500);
    const skip = (pageNum - 1) * limitNum;
    const { sport, search } = req.query;

    const filter = { matchDisabled: { $ne: false } };
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
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { sport, action, matchName } = req.body;

    if (!matchId) {
      return res.status(400).json({ success: false, message: 'Match ID is required' });
    }
    if (!canManageMatchSettings(req.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can change match status',
      });
    }

    if (action === 'activate') {
      const deleted = await DeactivatedMatch.deleteOne({ matchId: String(matchId) });
      invalidateMatchSectionCache();
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
          matchDisabled: true,
          deactivateBy: req.id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      invalidateMatchSectionCache();
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
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/** PATCH body: { sport, matchName, disabledSections: ['fancy', ...] } */
export const updateMatchSections = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { sport, matchName, disabledSections } = req.body;

    if (!canManageMatchSettings(req.role)) {
      return res.status(403).json({ message: 'Only superadmin can update match sections' });
    }
    if (!matchId || !sport || !VALID_SPORTS.includes(sport)) {
      return res.status(400).json({ message: 'Valid matchId and sport are required' });
    }

    const sections = normalizeMatchSectionList(disabledSections);

    if (sections.length === 0) {
      await DeactivatedMatch.deleteOne({ matchId: String(matchId) });
      invalidateMatchSectionCache();
      return res.json({
        success: true,
        message: 'All sections enabled for this match',
        data: serializeMatchSectionDoc(null),
      });
    }

    const doc = await DeactivatedMatch.findOneAndUpdate(
      { matchId: String(matchId) },
      {
        matchId: String(matchId),
        sport,
        matchName: String(matchName || '').trim() || `Match ${matchId}`,
        matchDisabled: false,
        disabledSections: sections,
        deactivateBy: req.id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    invalidateMatchSectionCache();
    return res.json({
      success: true,
      message: 'Match sections updated',
      data: serializeMatchSectionDoc(doc),
    });
  } catch (error) {
    console.error('Error in updateMatchSections:', error);
    return res.status(500).json({ message: error.message || 'Failed to update sections' });
  }
};

export const getAdminMatchSectionSettings = async (req, res) => {
  try {
    const { sport } = req.query;
    if (sport && sport !== 'all' && !VALID_SPORTS.includes(sport)) {
      return res.status(400).json({ message: 'Invalid sport' });
    }
    const map = await getMatchSectionSettingsMap(sport === 'all' ? null : sport);
    return res.json({ success: true, data: map });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load settings' });
  }
};

export const getPublicMatchSectionSettings = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { sport } = req.query;
    if (!matchId) {
      return res.status(400).json({ message: 'matchId is required' });
    }
    const data = await getMatchSectionSettings(matchId, sport);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load match settings' });
  }
};

export const getDeactivatedMatches = async (req, res) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 10), 500);
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
      data: { matches: deactivatedMatches.map(mapDeactivatedMatch) },
      totalRecords,
    });
  } catch (error) {
    console.error('Error in getDeactivatedMatches:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const checkMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { sport } = req.query;
    const data = await getMatchSectionSettings(matchId, sport);
    return res.status(200).json({
      success: true,
      data: {
        matchId,
        isActive: !data.matchDisabled,
        ...data,
      },
    });
  } catch (error) {
    console.error('Error in checkMatchStatus:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
