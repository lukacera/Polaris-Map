import mongoose from "mongoose";

const mongoDB: string = process.env.MONGO_URL || "mongodb://localhost:27017/mydatabase";

let isConnected = false;

export const connectToDB = async (): Promise<void> => {
    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(mongoDB);
        isConnected = true;
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
};