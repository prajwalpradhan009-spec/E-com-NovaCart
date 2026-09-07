import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDatabase = () => mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/novacart', {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000
});

export default connectDatabase;
