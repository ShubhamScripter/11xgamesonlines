import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB:', mongoose.connection.name);
  } catch (error) {
    process.exit(1);
  }
};

export default connectDB;
