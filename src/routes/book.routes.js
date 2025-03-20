import express from 'express';
import protectedRoute from '../middleware/auth.middleware.js';
import { createPost, getAllBooks, deleteBook, getUserBooks } from '../controllers/book.controller.js';

const router = express.Router()

router.post("/", protectedRoute, createPost)
router.get("/", protectedRoute, getAllBooks)
router.get("/userbooks", protectedRoute, getUserBooks)
router.delete("/:id", protectedRoute, deleteBook)

export default router;
