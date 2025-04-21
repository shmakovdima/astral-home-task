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
      // In development, we want to use the mock service worker
      config.baseURL = "";

      // Ensure the URL starts with /api
      if (config.url && !config.url.startsWith("/api")) {
        config.url = `/api${config.url}`;
      }

      console.log("Axios request config:", config);
    }

    return config;
  },
  (error) => {
    console.error("Axios request error:", error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Axios response:", response);
    return response;
  },
  (error) => {
    console.error("Axios response error:", error);
    return Promise.reject(error);
  },
);

export const api = axiosInstance;
