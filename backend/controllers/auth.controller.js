import jwt from "jsonwebtoken";
import redis from "../lib/redis.js";

import User from "../models/user.model.js";

// function to generate access and refresh tokens
const generateToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

// function to store refresh token in redis
const storeRefreshToken = async (userId, refreshToken) => {
  try {
    await redis.set(
      `refreshToken:${userId}`,
      refreshToken,
      "EX",
      60 * 60 * 24 * 7
    ); // Store for 7 days
  } catch (error) {
    console.error("Error storing refresh token in Redis:", error);
  }
};

// function to set cookies for access and refresh tokens
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Ensures the cookie is sent over HTTPS in production
    sameSite: "strict", // Helps prevent CSRF attacks
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email }); // finding user by email

    // if user already exists
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create a new user
    const user = await User.create({
      name,
      email,
      password,
    });

    //authentication token generation
    const { accessToken, refreshToken } = generateToken(user._id); // generate tokens
    storeRefreshToken(user._id, refreshToken); // store refresh token in redis
    setCookies(res, accessToken, refreshToken); // set cookies for access and refresh tokens
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if both provided or not
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    //find user by email
    const user = await User.findOne({ email });

    // compare password if user exists
    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateToken(user._id); // generate tokens
      storeRefreshToken(user._id, refreshToken); // store refresh token in redis
      setCookies(res, accessToken, refreshToken); // set cookies for access and refresh tokens
      res.status(200).json({
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const logout = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  try {
    // check if refresh token exists
    if (refreshToken) {
      // verify the refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      redis.del(`refreshToken:${decoded.userId}`); // Remove the refresh token from Redis
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  // check if refresh token exists
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }
  try {
    // verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const userId = decoded.userId;

    // Check if the refresh token exists in Redis
    const storedRefreshToken = await redis.get(`refreshToken:${userId}`);
    if (storedRefreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate new tokens
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    // set new access token in cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({ message: "Token refreshed", accessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
