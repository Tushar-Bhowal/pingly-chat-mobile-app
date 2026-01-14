import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../modals/User";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

const testUsers = [
  {
    name: "Alan George",
    email: "test1@test.com",
    password: "test123",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Hey there! I'm using Pingly",
    isVerified: true,
  },
  {
    name: "Jasmine Fernandez",
    email: "test2@test.com",
    password: "test123",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Available for chat 💬",
    isVerified: true,
  },
  {
    name: "Joseph Alex",
    email: "test3@test.com",
    password: "test123",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    bio: "Coffee lover ☕",
    isVerified: true,
  },
  {
    name: "Milan Christopher",
    email: "test4@test.com",
    password: "test123",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    bio: "At work 🏢",
    isVerified: true,
  },
  {
    name: "Princy Xavier",
    email: "test5@test.com",
    password: "test123",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    bio: "Living life to the fullest! 🌟",
    isVerified: true,
  },
  {
    name: "Sarah Johnson",
    email: "test6@test.com",
    password: "test123",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    bio: "Designer & Artist 🎨",
    isVerified: true,
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const salt = await bcrypt.genSalt(10);

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = new User({
        ...userData,
        password: hashedPassword,
      });

      await user.save();
      console.log(`Created user: ${userData.name} (${userData.email})`);
    }

    console.log("\n✅ Seed completed!");
    console.log("\nTest credentials:");
    console.log("Emails: test1@test.com, test2@test.com ... test6@test.com");
    console.log("Password: test123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seedUsers();
