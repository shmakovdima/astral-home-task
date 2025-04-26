import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      config.baseURL = "";

      if (config.url && !config.url.startsWith("/api")) {
        config.url = `/api${config.url}`;
      }
    }

    return config;
  },
  (error) => {
    console.error("Axios request error:", error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios response error:", error);
    return Promise.reject(error);
  },
);

export const api = axiosInstance;
