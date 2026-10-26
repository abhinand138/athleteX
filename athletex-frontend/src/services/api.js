import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

// Request Interceptor: Attach Authorization Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 Unauthorized for Auto-Logout
let isHandling401 = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!isHandling401) {
        isHandling401 = true;
        const hadUser = localStorage.getItem("user") || localStorage.getItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        if (hadUser && !window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
          toast.error("Session expired. Please log in again.");
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
        }
        setTimeout(() => {
          isHandling401 = false;
        }, 3000);
      }
    }
    return Promise.reject(error);
  }
);
export const getMediaUrl = (path) => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  let baseUrl = import.meta.env.VITE_API_BASE_URL || api.defaults?.baseURL;

  // Auto-detect production backend when hosted on Render
  if (!baseUrl || baseUrl === "/api" || baseUrl === "http://localhost:8080/api") {
    if (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) {
      baseUrl = "https://athletex-backend-qi9g.onrender.com/api";
    } else {
      baseUrl = "http://localhost:8080/api";
    }
  }

  const hostRoot = baseUrl.replace(/\/api\/?$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${hostRoot}${cleanPath}`;
};

export default api;