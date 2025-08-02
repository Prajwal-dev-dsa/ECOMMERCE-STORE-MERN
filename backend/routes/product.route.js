import express from "express";

import { adminRoute, protectedRoute } from "../middlewares/auth.middleware.js";

import {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  deleteProduct,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, getAllProducts); // get all products, accessible only for admin
router.get("/featured", getFeaturedProducts); // featured products
router.get("/recommended", getRecommendedProducts); // recommended products
router.get("/category/:category", getProductsByCategory); // get products by category
router.post("/", protectedRoute, adminRoute, createProduct); // create a new product, only for admin
router.patch("/:id", protectedRoute, adminRoute, toggleFeaturedProduct); // toggle featured status of a product
router.delete("/:id", protectedRoute, adminRoute, deleteProduct); // delete product, only for admin

export default router;
