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
      },
      keyframes: {
        reviewDrift: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        },
        aiSweep: {
          "0%": { transform: "translateX(-100%)" },
          "48%, 100%": { transform: "translateX(100%)" }
        },
        aiFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        }
      },
      animation: {
        reviewDrift: "reviewDrift 54s linear infinite",
        aiSweep: "aiSweep 8s linear infinite",
        aiFloat: "aiFloat 7s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
