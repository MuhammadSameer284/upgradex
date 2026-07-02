import mongoose from "mongoose";
import dotenv from 'dotenv';

const connectDB = async ()=>{
    try {
       const connectDB = await mongoose.connect(process.env.MONGODB_URI)
        console.log("DB connected!");
        
    } catch (error) {
        console.log("connection failed!");
    }

}

export default connectDB;