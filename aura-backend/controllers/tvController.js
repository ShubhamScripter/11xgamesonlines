import {
  getAllTvList,
  getAllTvMap,
  lookupTvUrl,
} from '../services/tvApi/getAllTvService.js';

export const getAllTv = async (_req, res) => {
  try {
    const list = await getAllTvList();
    return res.status(200).json(list);
  } catch (error) {
    console.error('Error fetching get-all-tv:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch TV list' });
  }
};

export const getTvByEventId = async (req, res) => {
  const { eventId, gameid } = req.query;
  const id = eventId ?? gameid;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Missing eventId or gameid' });
  }

  try {
    const map = await getAllTvMap();
    const tv = lookupTvUrl(map, id);
    if (!tv) {
      return res.status(404).json({ success: false, message: 'TV not found for event' });
    }
    return res.status(200).json({ success: true, eventId: String(id), tv });
  } catch (error) {
    console.error('Error fetching TV by event:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch TV' });
  }
};
