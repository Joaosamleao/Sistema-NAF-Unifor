import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async() => {
    if (!process.env.MONGO_URI) {
        console.warn('MONGO_URI not set. Skipping database connection (development mode).');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to the database');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message || err);
        console.warn('Continuing without database connection (development mode).');
    }
}