import express from "express";
import {
  checkoutSuccess,
  createCheckoutSession,
} from "../controllers/payment.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-checkout-session", protectedRoute, createCheckoutSession); // checkout session creation, when user clicks on pay button
router.post("/checkout-success", protectedRoute, checkoutSuccess); // handle successful checkout and create order

export default router;
