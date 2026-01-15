import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server as SocketIOServer, Socket } from "socket.io";
import { registerUserEvents } from "./userEvents";
dotenv.config();

let io: SocketIOServer;

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function initializeSocket(server: any): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // allow all origins
    },
  }); // socket io server instance

  // auth middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          console.error("JWT verification failed:", err.message);
          return next(new Error("Authentication error: Invalid token"));
        }
        // JWT payload contains { userId, user: { id, name, email, avatar, isVerified } }
        socket.data.userId = decoded.userId;
        socket.data.user = decoded.user;
        next();
      }
    );
  });

  // when socket connect, register events
  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId;
    const userName = socket.data.user?.name || "Unknown";
    console.log("User connected:", userId, "-", userName);

    // Join user's own room (for direct notifications)
    socket.join(userId);

    // Join all conversation rooms the user is part of
    try {
      const Conversation = (await import("../modals/Conversation")).default;
      const conversations = await Conversation.find({
        participants: userId,
      }).select("_id");

      conversations.forEach((conversation) => {
        socket.join(conversation._id.toString());
      });
      console.log(
        `User ${userName} joined ${conversations.length} conversation rooms`
      );
    } catch (error: any) {
      console.log("Error joining conversations:", error.message);
    }

    // Register events
    registerUserEvents(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId, "-", userName);
    });
  });

  return io;
}
