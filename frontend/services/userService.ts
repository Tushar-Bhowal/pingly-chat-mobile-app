import axios from "axios";
import { UserProps } from "../types";
import { API_BASE_URL } from "@/constants";

/**
 * Fetch all users except current user
 * @param accessToken - JWT token for authentication
 * @param search - Optional search query for name/email
 */
export const getUsersAPI = async (
  accessToken: string,
  search?: string
): Promise<{ users: UserProps[] }> => {
  const params = search ? { search } : {};

  const response = await axios.get(`${API_BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params,
  });

  return response.data;
};

/**
 * Fetch single user by ID
 * @param accessToken - JWT token for authentication
 * @param userId - User ID to fetch
 */
export const getUserByIdAPI = async (
  accessToken: string,
  userId: string
): Promise<{ user: UserProps }> => {
  const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data;
};
