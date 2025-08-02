import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";

dotenv.config(); // Load environment variables from .env file

const app = express(); // Create an Express application
const PORT = process.env.PORT || 3000; // Port configuration

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies

//routes
app.use("/api/auth", authRoutes); //Authentication routes
app.use("/api/product", productRoutes); //Product routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(); // Connect to the database
});
