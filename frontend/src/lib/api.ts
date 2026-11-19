import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("shophome_access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("shophome_refresh_token");
        if (refreshToken) {
          try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, JSON.stringify(refreshToken), {
              headers: { "Content-Type": "application/json" },
            });
            if (res.data?.data) {
              const { accessToken, refreshToken: newRefresh } = res.data.data;
              localStorage.setItem("shophome_access_token", accessToken);
              localStorage.setItem("shophome_refresh_token", newRefresh);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return api(originalRequest);
            }
          } catch (refreshErr) {
            localStorage.removeItem("shophome_access_token");
            localStorage.removeItem("shophome_refresh_token");
            localStorage.removeItem("shophome_user");
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
