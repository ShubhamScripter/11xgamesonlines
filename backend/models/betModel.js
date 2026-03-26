import mongoose from "mongoose";

const betSchema = new mongoose.Schema(
  {
    userId: {
      // type: mongoose.Schema.Types.ObjectId,
      type: String,
      required: true,
      // ref: "User",
    },

    betType:{
      type:String,
      enum:['sports','casino'],
      default:'sports'

    },
    cid: { type: Number }, 
gid: { type: Number }, 
tabno: { type: Number }, 


    gameId: {
      type: String,
      // type: mongoose.Schema.Types.ObjectId,
      required: true,
      // ref: "Game",
    },
    roundId:{
      type:String

    },
    betId:{
      type:String
  },
    userName: {
      type: String,
      required: true,
    },
    invite: {
      type: String,
      // required: true,
    },
    userRole: {
      type: String,
      // required: true,
    },
    sid: {
      type: String,
    },
    otype: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    xValue: {
      type: Number,
      required: true,
    },
    resultAmount: {
      type: Number,
      default: 0,
    },
    betAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: Number,
      required: true,
      default: 0,
      index:1
    },
    eventName: {
      type: String,
      required: true,
    },
    marketName: {
      type: String,
      required: true,
    },
    fancyScore: {
      type: String,
      default: 0,
    },
    gameType: {
      type: String,
      required: true,
      index:1
    },
    gameName: {
      type: String,
      required: true,
    },
    teamName: {
      type: String,
      required: true,
    },
    market_id: {
      // Casino IDs may be strings like "casino_lucky5_..."; accept string or number
      type: String,
    },
    betResult: {
      type: String,
      // required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
betSchema.pre("save",function(next){
  if(this.isModified("status")){
    console.log(`[DEBUG] Bet ${this.id} status changing to ${this.status}`)
  }
  next();

})



const betModel = mongoose.model("Bet", betSchema);

export default betModel;
