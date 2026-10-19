import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
  timeout: 90000, // 90 seconds timeout for LLM pipeline processing
});
