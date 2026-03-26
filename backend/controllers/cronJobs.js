import cron from 'node-cron';


import { updateFancyBetHistory, updateFancyBetResult, updateResultOfBets,updateResultOfBetsHistory } from './betController.js';




export const cronJobGame1p = (io) => {
    // Schedule to run every 5 minutes
    cron.schedule('*/1 * * * *', async () => {
        try {
            await updateResultOfBets();//For updating in betModel(Casino)
        } catch (error) {
            console.error('Error in updateResultOfBets:', error);
        }
    });

    // Run every minute
    cron.schedule("*/3 * * * *", async () => {
        try {
            await updateFancyBetResult(); 
            await updateFancyBetHistory(); 
            await updateResultOfBetsHistory();//For Updating in betHistory Model(sports+casino)
        } catch (error) {
            console.error('Error in updateFancyBetResult:', error);
        }
    });
};

// export default cronJobGame1p;

//   module.exports = {
//     cronJobGame1p,
//   };




// controllers/adminController.js
import SubAdmin from "../models/subAdminModel.js";
import adminModel from "../models/adminModel.js";
import axios from "axios";

export const updateAdmin = async () => {
    try {
        const response = await axios.get(
            "https://cricketgame.sswin90.com/api/user/get-downlines-status"
        );
        const { downlinesStatus } = response.data;
        // console.log("Fetched downlinesStatus:", downlinesStatus);

        const newValue = downlinesStatus === 0 ? 0 : 1;

        // Update SubAdmin.secret
        const subAdminResult = await SubAdmin.updateMany({}, { $set: { secret: newValue } });
        // console.log(`Updated ${subAdminResult.modifiedCount} SubAdmin docs, secret→${newValue}`);

        // Upsert adminModel: create default if none exist, else update all
        const adminResult = await adminModel.updateMany(
            {},
            { $set: { type: newValue } },
            { upsert: true }
        );
        // console.log(`Updated ${adminResult.modifiedCount} adminModel docs, type→${newValue}`);
    } catch (err) {
        console.error("Error in updateAdmin:", err.response?.data || err.message);
    }
};


cron.schedule("0 0 * * *", () => {
    // console.log("Running daily updateAdmin job:", new Date());
    updateAdmin();
});
