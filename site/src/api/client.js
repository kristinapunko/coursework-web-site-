import axios from "axios";

const DEFAULT_API_URL = import.meta.env.PROD
  ? "https://my-django-project-7203.onrender.com"
  : "http://127.0.0.1:8000";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let refreshRequest = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");
    const isAuthRequest = ["/api/login/", "/api/register/", "/api/token/refresh/"].some(
      (path) => originalRequest?.url?.includes(path)
    );

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      !refreshToken ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      if (!refreshRequest) {
        refreshRequest = axios
          .post(`${API_BASE_URL}/api/token/refresh/`, { refresh: refreshToken })
          .then(({ data }) => {
            localStorage.setItem("accessToken", data.access);
            if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
            return data.access;
          })
          .finally(() => {
            refreshRequest = null;
          });
      }
      const accessToken = await refreshRequest;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return Promise.reject(refreshError);
    }
  }
);

export default api;
