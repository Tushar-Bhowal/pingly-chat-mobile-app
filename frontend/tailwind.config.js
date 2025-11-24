/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // Expo Router screens
    "./components/**/*.{js,jsx,ts,tsx}", // Your components
    "./screens/**/*.{js,jsx,ts,tsx}", // If you have a screens folder
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E4825D",
          light: "#EDAC94",
          dark: "#DA5725",
        },
        text: "#292524",
        rose: "#ef4444",
        otherBubble: "#FFF1BF",
        myBubble: "#FFE1CC",
        green: "#16a34a",
        // Neutral color scale
        neutral: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          350: "#CCCCCC",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
    },
  },
  plugins: [],
};
