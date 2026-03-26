import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        mist: "#f4f7fb",
        brand: "#0f766e",
        accent: "#f59e0b",
        panel: "#ffffff"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)"
      }
    },
  },
  plugins: [],
};

export default config;
