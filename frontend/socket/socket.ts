import { API_BASE_URL } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

const ACCESS_TOKEN_KEY = "access_token";

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  // Get the ACCESS token (not refresh token)
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    throw new Error("No token found. User must login first.");
  }

  if (!socket || !socket.connected) {
    socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket"], // Use websocket for React Native
    });

    // Wait for connection
    await new Promise<void>((resolve, reject) => {
      socket?.on("connect", () => {
        console.log("Socket connected:", socket?.id);
        resolve();
      });
      socket?.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
        reject(error);
      });
      // Timeout after 10 seconds
      setTimeout(() => {
        if (!socket?.connected) {
          reject(new Error("Socket connection timeout"));
        }
      }, 10000);
    });
  }

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected");
  }
}
