import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    console.error('MONGO_URL environment variable is not defined');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
