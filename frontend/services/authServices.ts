import axios from "axios";
import { API_BASE_URL } from "../constants";
import { UserProps, AuthResponse } from "../types";

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// API Functions

export const registerAPI = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/register", {
    name,
    email,
    password,
  });
  return response.data;
};

export const loginAPI = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/login", {
    email,
    password,
  });
  return response.data;
};

export const logoutAPI = async (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  await api.post(
    "/logout",
    { refreshToken },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};

export const refreshTokenAPI = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const response = await api.post("/refresh-token", { refreshToken });
  return response.data;
};

export const forgotPasswordAPI = async (
  email: string
): Promise<{ message: string }> => {
  const response = await api.post("/forgot-password", { email });
  return response.data;
};

export const verifyOTPAPI = async (
  email: string,
  otp: string
): Promise<{ message: string; verified: boolean }> => {
  const response = await api.post("/verify-otp", { email, otp });
  return response.data;
};

export const getMeAPI = async (accessToken: string): Promise<UserProps> => {
  const response = await api.get<{ user: UserProps }>("/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.user;
};
