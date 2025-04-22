import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import job from './lib/cron.js'
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import bookmarkRoutes from "./routes/bookmark.routes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

job.start(); // Start the cron job
app.use(cors());
app.use(express.json({ limit: "10mb" })); //middlewawre to handle body

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/bookmark", bookmarkRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
