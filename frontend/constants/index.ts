import { Platform } from "react-native";

export const API_BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:3000": "http://localhost:3000";

export const CLOUDINARY_CLOUD_NAME = "dxyw3gnjc"
export const CLOUDINARY_UPLOAD_PRESET = "chat-mobile-app"

