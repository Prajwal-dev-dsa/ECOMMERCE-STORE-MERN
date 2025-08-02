import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({
      _id: { $in: req.user.cartItems }, // fetch products based on cart items
    });

    // map through products and add quantity from user's cart
    const cartItems = products.map((product) => {
      // find the corresponding item in user's cart
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return {
        ...product.toJSON(), // convert mongoose document to plain object
        quantity: item.quantity, // add quantity from user's cart
      };
    });
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart products:", error.message);
    res.status(500).json({ message: "Error fetching cart products" });
  }
};
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body; // productId should be passed in the request body
    const user = req.user; // getting user from the request object

    // Check if the product already exists in the cart for the user
    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1; // Increment quantity if product already exists
    } else {
      user.cartItems.push(productId);
    }
    await user.save();
    res.status(201).json(user.cartItems);
  } catch (error) {
    console.error("Error adding product to cart:", error.message);
    res.status(500).json({ message: "Error adding product to cart" });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body; // productId should be passed in the request body
    const user = req.user; // getting user from the request object

    if (!productId) {
      user.cartItems = []; // Remove all items if no productId is provided
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    res.status(201).json(user.cartItems);
  } catch (error) {
    console.error("Error deleting product from cart:", error.message);
    res.status(500).json({ message: "Error deleting product from cart" });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params; // productId passed in the params
    const { quantity } = req.body; // quantity from request body
    const user = req.user; // getting user from request object

    // check if product exists in user's cart
    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (!existingItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Update the quantity or remove the item if quantity is 0
    if (quantity === 0) {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
      await user.save();
      return res.status(200).json(user.cartItems);
    }
    existingItem.quantity = quantity; // update quantity
    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    console.error("Error updating product quantity in cart:", error.message);
    res
      .status(500)
      .json({ message: "Error updating product quantity in cart" });
  }
};
