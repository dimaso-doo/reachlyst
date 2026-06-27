import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#667085",
        line: "#e5e7eb",
        paper: "#f5f7fb",
        accent: {
          DEFAULT: "#1677ff",
          strong: "#0958d9"
        }
      },
      boxShadow: {
        reachlyst: "0 16px 42px rgba(15, 23, 42, 0.08)",
        "reachlyst-lg": "0 24px 70px rgba(15, 23, 42, 0.12)"
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
