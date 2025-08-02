import jwt from "jsonwebtoken";

import User from "../models/user.model.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken; // get the access token from cookies

    // if no access token provided
    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized access - No token provided" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password"); // excluding password

      // if user not found after decoding the token
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // if found, attach user to the request object so that we can use it in next middleware or any route handler and get all the details of the user.
      req.user = user;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Token expired, please login again" });
      } else throw error; // rethrow other errors for global error handler
    }
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminRoute = (req, res, next) => {
  // Check if the user is an admin
  if (req.user && req.user.role === "admin") {
    next(); // proceed to the next middleware or route handler
  } else {
    return res.status(403).json({ message: "Access denied - Admins only" });
  }
};
