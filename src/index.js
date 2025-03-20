import dotenv from 'dotenv'
import cors from 'cors';
import express from 'express';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.routes.js'
import bookRoutes from './routes/book.routes.js'

dotenv.config()
const app = express()

const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '10mb' }))   //middlewawre to handle body

app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB();
})
