import { Request, Response } from "express";
import User from "../modals/User";

/**
 * @route GET /api/users
 * @desc Get all users except current user (for new conversation)
 * @access Private
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get query params for search
    const { search } = req.query;

    // Build query
    const query: any = { _id: { $ne: userId } };

    // Add search filter if provided
    if (search && typeof search === "string") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("name avatar bio isOnline lastSeen")
      .sort({ name: 1 })
      .limit(50);

    res.status(200).json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @route GET /api/users/:id
 * @desc Get single user by ID
 * @access Private
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "name avatar bio isOnline lastSeen"
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
