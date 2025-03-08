import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
