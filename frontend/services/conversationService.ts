import axios from "axios";
import { API_BASE_URL } from "@/constants";
import { ConversationProps } from "../types";

export interface CreateConversationData {
  type: "direct" | "group";
  participants: string[];
  name?: string;
  description?: string;
  avatar?: string;
}

export interface CreateConversationResponse {
  conversation: ConversationProps;
  isNew: boolean;
}

/**
 * Create a new conversation (group or direct)
 */
export const createConversationAPI = async (
  accessToken: string,
  data: CreateConversationData
): Promise<CreateConversationResponse> => {
  const response = await axios.post(`${API_BASE_URL}/api/conversations`, data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

/**
 * Get all conversations for current user
 */
export const getConversationsAPI = async (
  accessToken: string
): Promise<{ conversations: ConversationProps[] }> => {
  const response = await axios.get(`${API_BASE_URL}/api/conversations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

/**
 * Get single conversation by ID
 */
export const getConversationByIdAPI = async (
  accessToken: string,
  conversationId: string
): Promise<{ conversation: ConversationProps }> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/conversations/${conversationId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data;
};
