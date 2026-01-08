import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProps, AuthContextProps } from "../types";
import {
  loginAPI,
  registerAPI,
  logoutAPI,
  refreshTokenAPI,
  getMeAPI,
  forgotPasswordAPI,
  verifyOTPAPI,
} from "../services/authServices";

// Storage keys
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Create context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuth();
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      // Try to get user with current token
      const userData = await getMeAPI(accessToken);
      setUser(userData);
    } catch (error) {
      // Token might be expired, try refresh
      await refreshToken();
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh access token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) return false;

      const tokens = await refreshTokenAPI(storedRefreshToken);
      await saveTokens(tokens.accessToken, tokens.refreshToken);

      const userData = await getMeAPI(tokens.accessToken);
      setUser(userData);
      return true;
    } catch (error) {
      await clearTokens();
      setUser(null);
      return false;
    }
  };

  // Save tokens to storage
  const saveTokens = async (accessToken: string, refreshToken: string) => {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  };

  // Clear tokens from storage
  const clearTokens = async () => {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  // Sign In
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await loginAPI(email, password);

      if (response.accessToken && response.refreshToken && response.user) {
        await saveTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up
  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      await registerAPI(name, email, password);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      if (accessToken && storedRefreshToken) {
        await logoutAPI(accessToken, storedRefreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  // Forgot Password
  const forgotPassword = async (email: string) => {
    try {
      await forgotPasswordAPI(email);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  // Verify OTP
  const verifyOTP = async (
    email: string,
    otp: string,
    flow?: "signup" | "forgot-password"
  ) => {
    try {
      setIsLoading(true);
      const response = await verifyOTPAPI(email, otp, flow);

      if (
        response &&
        response.accessToken &&
        response.refreshToken &&
        response.user
      ) {
        // If tokens are returned (signup flow), login the user
        await saveTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
      }

      return true;
    } catch (error: any) {
      console.log("error", error);
      let msg = error.response?.data?.message || "Something went wrong";
      Alert.alert("Verification Failed", msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        forgotPassword,
        verifyOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
