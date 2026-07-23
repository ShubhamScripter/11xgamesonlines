import 'dotenv/config';
import mongoose from 'mongoose';
import SubAdmin from './models/subAdminModel.js';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const userId = '6a5f11f6f2296c7957b236db';
        const coinsToAdd = 1000;

        const updatedUser = await SubAdmin.findByIdAndUpdate(userId, {
            $inc: { luckySpinCoins: coinsToAdd }
        }, { new: true });

        console.log(`Successfully added ${coinsToAdd} coins. New coin balance: ${updatedUser.luckySpinCoins}`);
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

run();
