import axios from "axios";

const axiosInstance = axios.create({
  // we creating a dynamic base url based on the environment.
  baseURL:
    import.meta.mode === "development" ? "http://localhost:3000/api" : "/api",
  withCredentials: true, // send cookies to the server
});

export default axiosInstance;
