import express from "express";
import {
	createPost,
	deletePost,
	getAllPost,
	getUserPost,
} from "../controllers/post.controller.js";
import protectedRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/createPost", protectedRoute, createPost);
router.get("/", protectedRoute, getAllPost);
router.get("/userposts", protectedRoute, getUserPost);
router.delete("/:id", protectedRoute, deletePost);

export default router;
