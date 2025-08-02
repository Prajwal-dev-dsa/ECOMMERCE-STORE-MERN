import redis from "../lib/redis.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // fetch all products from the database
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    // we first find products from redis cache, if not found we fetch from mongodb and then store it in redis and return as well.

    // this is done to reduce the load on the database and improve performance.

    let featuredProducts = await redis.get("featured_products"); // fetch all featured products from redis

    // if found in redis itself
    if (featuredProducts) {
      return res
        .status(200)
        .json({ featuredProducts: JSON.parse(featuredProducts) });
    }

    // if not found, we move to mongodb
    featuredProducts = await Product.find({ isFeatured: true }).lean(); // fetch featured products from the database

    // if not found even in mongodb
    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    // if found, store it in redis and return it.
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    res.status(200).json({ featuredProducts });
  } catch (error) {
    console.error("Error fetching featured products:", error.message);
    res.status(500).json({ message: "Error fetching featured products" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category } = req.body; // get product details
    let cloudinaryImage = null;

    // If an image is provided, upload it to Cloudinary
    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      cloudinaryImage = result.secure_url; // Get the secure URL of the uploaded image
    }

    // create a new product in db
    const product = await Product.create({
      name,
      price,
      description,
      image: cloudinaryImage ? cloudinaryImage : "", // Use the Cloudinary image URL
      category,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ message: "Error creating product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params; // get id from params
    const product = await Product.findById(id); // find product

    // if not found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // if product has an image, delete it
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; // Extract public ID from the image URL
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`); // Delete the image from Cloudinary
        console.log("Image deleted from cloudinary successfully");
      } catch (error) {
        console.error("Error deleting image from cloudinary:", error.message);
      }
    }
    await Product.findByIdAndDelete(id); // delete product from db
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ message: "Error deleting product" });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    // fecth 3 random products from the db
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          image: 1,
          category: 1,
        },
      },
    ]);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching recommended products:", error.message);
    res.status(500).json({ message: "Error fetching recommended products" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params; // get category id from params
    const products = await Product.find({ category }); // fetch products by category from the database

    // if prouct not found or id is incorrect
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found in this category" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error.message);
    res.status(500).json({ message: "Error fetching products by category" });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const { id } = req.params; // get id from params
    const product = await Product.findById(id); // find product

    // if product not found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //toggle the featured status
    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save(); // save it in db
    await updateFeaturedProductsCache(); // update it in redis cache
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error toggling featured status:", error.message);
    res.status(500).json({ message: "Error toggling featured status" });
  }
};

async function updateFeaturedProductsCache() {
  try {
    //lean() method is used to return plain javascript objects instead of full mongoose documents, this can significantly improve performance and reduce memory usage.
    const featuredProducts = await Product.find({ isFeatured: true }).lean(); // fetch all featured products which are marked as true
    await redis.set("featured_products", JSON.stringify(featuredProducts)); // update the redis cache with these new featured products
  } catch (error) {
    console.error("Error updating featured products cache:", error.message);
  }
}
