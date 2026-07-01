# Mobile Chat App

A cross-platform real-time messaging app built with React Native and the MERN stack (MongoDB, Express, React Native, Node.js).

## Features

- **Authentication** — email/password signup and login secured with JWT access + refresh tokens, plus email OTP verification and a password reset flow (Nodemailer)
- **Direct & group conversations** — create 1:1 chats or named group conversations with multiple participants
- **Real-time layer** — authenticated Socket.io connections that auto-join each user to their conversation rooms for live delivery
- **Rich messaging UI** — message bubbles for text, images, video, audio, and file attachments, with reply, edit, delete, and read-receipt support built into the data model
- **Profile management** — editable name/bio and avatar upload via Cloudinary
- **Hardened API** — request validation with Zod, password hashing with bcrypt, security headers via Helmet, and rate limiting on auth/OTP endpoints

## Tech Stack

**Frontend**
- React Native (Expo, Expo Router) with TypeScript
- NativeWind (Tailwind CSS for React Native)
- Socket.io-client, Axios
- Expo Image Picker + Cloudinary for media uploads

**Backend**
- Node.js, Express 5, TypeScript
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT (access + refresh tokens), bcrypt, Zod validation
- Nodemailer for OTP emails, node-cache for in-memory caching/rate limiting
- Helmet for security headers

## Screenshots

<!-- Add screenshots or a screen recording below -->

| Welcome / Auth | Conversations | Chat |
| :---: | :---: | :---: |
| _screenshot here_ | _screenshot here_ | _screenshot here_ |

## How It Works

On login, the backend issues a short-lived JWT access token and a longer-lived refresh token, which the app stores and uses to silently re-authenticate without logging the user out. New accounts are verified via a 4-digit OTP emailed through Nodemailer before the account becomes active. Once authenticated, the app opens a Socket.io connection (token-verified on the backend) that joins the user's own room plus a room per conversation, laying the groundwork for instant message delivery, typing indicators, and read receipts.

## Running Locally

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)
- Expo Go app or an Android/iOS simulator

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/mobile-chat-app.git
cd mobile-chat-app
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

Start the server:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Update `API_BASE_URL` in `frontend/constants/index.ts` if your backend isn't running on `localhost:3000`, and set your own Cloudinary cloud name / upload preset there for media uploads.

Start the app:
```bash
npx expo start
```

Then open it in Expo Go, or run:
```bash
npm run android   # Android emulator
npm run ios       # iOS simulator
```
