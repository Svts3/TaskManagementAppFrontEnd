import axios from "axios";
import { isTokenExpired, refreshAccessToken, clearTokens } from "../utils/auth";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("accessToken");
    if (isTokenExpired(token)) {
      try {
        token = await refreshAccessToken();
      } catch (err) {
        clearTokens();
        window.location.href = "/sign-in";
        throw err;
      }
    }
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
