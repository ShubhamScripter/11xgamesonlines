// controllers/tennisController.js
import dotenv from 'dotenv';
import {
  fetchMatchList,
  fetchMatchData,
  fetchScore,
} from '../services/matchApi/index.js';

dotenv.config();

export const fetchTennisData = async (req, res) => {
  try {
    const data = await fetchMatchList(2);

    if (!data || !data.success) {
      console.error('Tennis API error:', data);
      return res.status(data?.status || 500).json({ 
        success: false, 
        message: data?.message || 'Failed to fetch tennis data from provider' 
      });
    }

    const t1Data = data.data?.t1 || [];
    const t2Data = data.data?.t2 || [];

    const combinedData = [...t1Data, ...t2Data]
      .map((match) => ({
        id: match.gmid,
        beventId: match.beventId || match.bevent_id || null,
        match: match.ename,
        date: match.stime,
        cname:match.cname,
        iplay: match.iplay,
        channels: match.f ? ['F'] : [],
        odds: (match.section || []).reduce((acc, section, index) => {
          const homeOdds = section.odds?.[0]?.odds || '0';
          const awayOdds = section.odds?.[1]?.odds || '0';

          acc.push({ home: homeOdds, away: awayOdds });

          if (index < match.section.length - 1) {
            acc.push({ home: '0', away: '0' });
          }

          return acc;
        }, []),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({ success: true, data: combinedData });
  } catch (error) {
    console.error('Error fetching tennis data:', error.message, error.stack);
    res
      .status(500)
      .json({ success: false, message: 'Internal Server Error: ' + error.message });
  }
};

export const getTennisScorecard = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const data = await fetchScore(gameid, 2);
    if (data?.success && data?.iframe?.url) {
      return res.status(200).json(data);
    }
    return res.status(502).json({
      success: false,
      message: data?.message || 'Scorecard not available',
      data,
    });
  } catch (error) {
    console.error('Error fetching tennis scorecard:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const fetchTannisBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const json = await fetchMatchData(gameid, 2);

    if (json.success) {
      res.status(200).json({
        success: true,
        data: json,
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: 'Invalid response from API' });
    }
  } catch (error) {
    console.error('Error in fetchBettingData:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};