import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
  getProfile,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup); // Register a new user
router.post("/login", login); // User Login
router.post("/logout", logout); // User Logout
router.post("/refreshToken", refreshToken); // Refresh token (Continually refreshes token after every 15 minutes)
router.get("/profile", protectedRoute, getProfile); // get user profile

export default router;
