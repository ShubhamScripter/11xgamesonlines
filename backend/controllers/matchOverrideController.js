
import matchOverrideModel from "../models/matchOverrideModel.js"



export const updateMatchStatus = async (req, res) => {
    try {
      const matchId = req.params.matchId;
      const { sport, action, reason, matchName } = req.body;
      const suspendedBy = req.id;
      console.log("The req is",req.role);
      //Only superadmin can suspend or activate a match 
      if (req.role !== "superadmin") {
        return res.status(403).json({ success: false, error: "Only superadmin can suspend or activate a match" });
      }
      
  
      if (!matchId) {
        return res.status(400).json({ success: false, error: "Match ID is required" });
      }
      if (!sport || !action) {
        return res.status(400).json({ success: false, error: "Sport and action are required" });
      }
  
      const validSports = ["cricket", "soccer", "tennis", "casino"];
      if (!validSports.includes(sport)) {
        return res.status(400).json({
          success: false,
          error: `Invalid sport: ${sport}. Must be one of: ${validSports.join(", ")}`
        });
      }
  
      if (action !== "suspend" && action !== "activate") {
        return res.status(400).json({
          success: false,
          error: "Action must be 'suspend' or 'activate'"
        });
      }
  
      if (action === "suspend") {
        const override = await matchOverrideModel.findOneAndUpdate(
          { matchId, sport },
          {
            matchId,
            sport,
            matchName,
            isSuspended: true,
            reason: reason || "Suspended by superadmin",
            suspendedBy,
            suspendedAt: new Date()
          },
          { upsert: true, new: true }
        );
  
        return res.status(200).json({
          success: true,
          message: "Match suspended successfully",
          data: {
            matchId: override.matchId,
            sport: override.sport,
            isSuspended: override.isSuspended,
            reason: override.reason,
            suspendedAt: override.suspendedAt
          }
        });
      }
  
      // action === "activate"
      const existingOverride = await matchOverrideModel.findOne({ matchId, sport });
      if (!existingOverride) {
        return res.status(200).json({
          success: true,
          message: "Match is already active",
          data: { matchId, sport, isSuspended: false }
        });
      }
  
      await matchOverrideModel.deleteOne({ matchId, sport });
      return res.status(200).json({
        success: true,
        message: "Match activated successfully",
        data: { matchId, sport, isSuspended: false }
      });
    } catch (error) {
      console.error("Error updating match status:", error);
  
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: "Match override already exists for this match and sport"
        });
      }
  
      return res.status(500).json({
        success: false,
        error: "Internal Server Error in updating Match Status"
      });
    }
  };

export const getSuspendedMatches = async (req, res) => {
  try {
    const suspendedMatches = await matchOverrideModel.find({ isSuspended: true });
    return res.status(200).json({ success: true, data: suspendedMatches });
  } catch (error) {
    console.error("Error getting suspended matches:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error in getting suspended matches" });
  }
};