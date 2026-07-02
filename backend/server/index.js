import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js';

const app = express();

dotenv.config();

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Server started successfully!")
})


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is live at http://localhost:${PORT}`);
})