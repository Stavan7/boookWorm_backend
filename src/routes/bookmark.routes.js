import express from 'express'
import protectedRoute from '../middleware/auth.middleware.js'
import { checkBookmarkStatus, getUserBookmark, toggleBookmark } from '../controllers/bookmark.controller.js';

const router = express.Router()

router.get("/", protectedRoute, getUserBookmark);
router.post("/:postId", protectedRoute, toggleBookmark)

//check if a book is bookmarked
//bookmark status
router.get("/status/:postId", protectedRoute, checkBookmarkStatus)

export default router;
