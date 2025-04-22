import express from "express";
import {
	login,
	register,
	userprofile,
	resetPassword,
	updateProfile,
	sendResetCode,
	verifyPasswordResetCode,
} from "../controllers/auth.controller.js";
import protectedRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/userprofile", protectedRoute, userprofile);
router.patch("/updateProfile", protectedRoute, updateProfile);
//passsword reset func
router.post("/send-reset-code", sendResetCode);
router.post("/verify-reset-code", verifyPasswordResetCode);
router.post("/reset-password", resetPassword);

export default router;
