import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server as SocketIOServer, Socket } from "socket.io";
import { registerUserEvents } from "./userEvents";
dotenv.config();

export function initializeSocket(server: any): SocketIOServer {
  const io = new SocketIOServer(server, {
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
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    const userName = socket.data.user?.name || "Unknown";
    console.log("User connected:", userId, "-", userName);
    //register events
    registerUserEvents(io, socket);
    socket.on("disconnect", () => {
      // user logs out
      console.log("User disconnected:", userId, "-", userName);
    });
  });

  return io;
}
