import { API_URL } from "@/constant";
import axios from "axios";

// Set config defaults when creating the instance
export const AxiosInstance = axios.create({
  baseURL: API_URL
});

