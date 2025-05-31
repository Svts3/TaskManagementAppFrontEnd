import axios from "axios";

// Helper to decode JWT and check expiration
export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// Refresh the access token using the refresh token
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");
  console.log("[auth] Refreshing access token...");
  const response = await axios.post("http://localhost:8080/auth/refresh-token", { token: refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = response.data;
  localStorage.setItem("accessToken", accessToken);
  if (newRefreshToken) {
    localStorage.setItem("refreshToken", newRefreshToken);
  }
  return accessToken;
}

// Remove both tokens
export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

// No changes needed here for the duplicate key warning.
// The warning is about your task object construction elsewhere in your codebase (likely WorkspacePage.jsx or TaskModal.jsx).
