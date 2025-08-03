import express from "express";

import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, getCoupon); // get active coupon
router.get("/validate", protectedRoute, validateCoupon); // validate that coupon is valid

export default router;
