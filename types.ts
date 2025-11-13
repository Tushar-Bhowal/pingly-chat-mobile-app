import { Router } from "expo-router";
import { ReactNode } from "react";
import {
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

export type TypoProps = {
  size?: number;
  color?: string;
  fontWeight?: TextStyle["fontWeight"];
  children: any | null;
  style?: TextStyle;
  textProps?: TextProps;
};

// Added OTP and online status fields
export interface UserProps {
  email: string;
  name: string;
  avatar?: string | null;
  id?: string;
  phoneNumber?: string; // For OTP via phone
  isOnline?: boolean; // Real-time online status
  lastSeen?: string; // ISO timestamp of last activity
}

export interface UserDataProps {
  name: string;
  email: string;
  avatar?: any;
  phoneNumber?: string; // NEW: For registration with phone
}

export interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  inputRef?: React.RefObject<TextInput>;
  //   label?: string;
  //   error?: string;
}

export interface DecodedTokenProps {
  user: UserProps;
  exp: number;
  iat: number;
}

// ENHANCED: Added OTP verification method
export type AuthContextProps = {
  token: string | null;
  user: UserProps | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    avatar?: string,
    phoneNumber?: string // Optional phone during signup
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
  sendOTP: (email: string) => Promise<void>; // Send OTP to email
  verifyOTP: (email: string, otp: string) => Promise<void>; // Verify OTP
};

export type ScreenWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
  isModal?: boolean;
  showPattern?: boolean;
  bgOpacity?: number;
};

export type ResponseProps = {
  success: boolean;
  data?: any;
  msg?: string;
};

export interface ButtonProps extends TouchableOpacityProps {
  style?: ViewStyle;
  onPress?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export type BackButtonProps = {
  style?: ViewStyle;
  color?: string;
  iconSize?: number;
};

export type AvatarProps = {
  size?: number;
  uri: string | null;
  style?: ViewStyle;
  isGroup?: boolean;
  showOnlineIndicator?: boolean; // Show green dot for online users
};

export type HeaderProps = {
  title?: string;
  style?: ViewStyle;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

// Added unread count
export type ConversationListItemProps = {
  item: ConversationProps;
  showDivider: boolean;
  isGroup?: boolean;
  router: Router;
};

// Added unread messages tracking and typing indicator
export type ConversationProps = {
  _id: string;
  type: "direct" | "group";
  avatar: string | null;
  participants: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
    isOnline?: boolean; // Track participant online status
  }[];
  name?: string;
  lastMessage?: {
    _id: string;
    content: string;
    senderId: string;
    type: "text" | "image" | "file";
    attachment?: string;
    createdAt: string;
    isRead?: boolean; // Track if last message was read
  };
  unreadCount?: number; // Number of unread messages per conversation
  isTyping?: boolean; // Is someone typing in this conversation
  typingUsers?: string[]; // Array of user IDs currently typing
  createdAt: string;
  updatedAt: string;
};

// Added read status and delivery tracking
export type MessageProps = {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  content: string;
  attachement?: string | null;
  isMe?: boolean;
  createdAt: string;
  isRead?: boolean; // Has recipient read this message
  readBy?: string[]; // For group chats - array of user IDs who read
  deliveredAt?: string; // When message was delivered
  readAt?: string; //  When message was read
};

// For OTP verification flow
export type OTPVerificationProps = {
  email: string;
  otp: string;
  otpExpiry?: string; // ISO timestamp when OTP expires
};

// For typing indicator events
export type TypingIndicatorProps = {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean; // true when user starts typing, false when stops
};

// For real-time presence updates 
export type UserPresenceProps = {
  userId: string;
  isOnline: boolean;
  lastSeen?: string; // ISO timestamp
};

// For push notifications
export type NotificationProps = {
  id: string;
  type: "message" | "typing" | "presence";
  conversationId?: string;
  senderId?: string;
  senderName?: string;
  content?: string;
  timestamp: string;
  isRead: boolean;
};
