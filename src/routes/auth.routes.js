import express from 'express'
import protectedRoute from '../middleware/auth.middleware.js';
import { login, register, userprofile } from '../controllers/auth.controller.js';

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/userprofile", protectedRoute, userprofile)

export default router
