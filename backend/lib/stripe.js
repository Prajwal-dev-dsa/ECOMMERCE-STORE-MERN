import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// stripe setup
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
