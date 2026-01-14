import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { initializeSocket } from "./socket/socket";
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Database connected");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Initialize socket events after server is created
    initializeSocket(server);
  })
  .catch((error) => {
    console.log("Failed to start server:", error);
    process.exit(1);
  });
