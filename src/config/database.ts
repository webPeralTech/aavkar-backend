import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    console.log(process.env.MONGODB_URI);
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://jackofficial388:NDBYunMjr7io9AFX@cluster0.aforycx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/crm_database';

    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
