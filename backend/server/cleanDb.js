import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/upgradex";

async function cleanDatabase() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUri);
        console.log("Connected successfully!");

        const collections = ['projects', 'tasks', 'codereviews', 'portfolios', 'videocalls'];
        
        for (const colName of collections) {
            console.log(`Clearing collection: ${colName}...`);
            try {
                await mongoose.connection.db.collection(colName).deleteMany({});
                console.log(`Collection ${colName} cleared!`);
            } catch (colErr) {
                console.log(`Collection ${colName} could not be cleared or doesn't exist yet.`);
            }
        }

        console.log("Database clean up complete! All projects, tasks, reviews, and calls have been removed.");
    } catch (err) {
        console.error("Error cleaning database:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

cleanDatabase();
