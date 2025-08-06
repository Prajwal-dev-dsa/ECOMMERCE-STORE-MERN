import toast from "react-hot-toast";
import { create } from "zustand";
import axios from "../lib/axios";

// Zustand store for user authentication
// This store manages user state, including login, signup, logout, and checking authentication status.
export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });
    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }
    try {
      const response = await axios.post("/auth/signup", {
        name,
        email,
        password,
      });
      set({ user: response?.data?.user, loading: false });
      toast.success("Signup successful");
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Signup failed");
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await axios.post("/auth/login", { email, password });
      set({ user: response?.data?.user, loading: false });
      toast.success("Login successful");
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Login failed");
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await axios.post("/auth/logout");
      set({ user: null, loading: false });
      toast.success("Logout successful");
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      set({ user: response?.data, checkingAuth: false });
    } catch (error) {
      set({ checkingAuth: false });
      toast.error(
        error?.response?.data?.message || "Authentication check failed"
      );
    }
  },
}));
