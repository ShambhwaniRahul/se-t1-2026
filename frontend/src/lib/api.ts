// base url for API requests, with interceptor to add auth token to headers
import axios from "axios";

const api = axios.create({
  // baseURL: "se-t1-2026.onrender.com/api/v1",
  baseURL: "http://localhost:8000/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;