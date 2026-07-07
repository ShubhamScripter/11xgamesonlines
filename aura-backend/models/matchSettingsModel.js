import mongoose from 'mongoose';

import subAdmin from './subAdminModel.js';
import { MATCH_SECTIONS } from '../constants/matchSectionConstants.js';

// Match visibility: whole-match off and/or per-section disable (match odds, bookmaker, fancy, premium)
const deactivateMatchSchema = new mongoose.Schema(
  {
    matchId: {
      type: String,
      unique: true,
      required: true,
    },
    sport: {
      type: String,
      enum: ['cricket', 'tennis', 'soccer', 'horse-racing'],
      required: true,
    },
    matchName: {
      type: String,
    },
    /** true = entire match hidden; legacy rows without this field are treated as fully disabled */
    matchDisabled: {
      type: Boolean,
      default: true,
    },
    /** Sections hidden on user UI when match is active (matchDisabled=false) */
    disabledSections: {
      type: [String],
      enum: MATCH_SECTIONS,
      default: [],
    },
    deactivateBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: subAdmin,
    },
  },
  { timestamps: true }
);

const DeactivatedMatch = mongoose.model(
  'DeactivatedMatch',
  deactivateMatchSchema
);
export default DeactivatedMatch;
