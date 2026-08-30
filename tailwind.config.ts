import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        sidebar: "#111827",
        rgu: {
          purple: "#7C2D87",
          blue: "#0EA5E9",
          green: "#84CC16",
          orange: "#F97316",
          dark: "#581C87",
        },
        primary: {
          DEFAULT: "#7C2D87",
          light: "#A855F7",
          dark: "#581C87",
        },
        accent: {
          DEFAULT: "#0EA5E9",
          light: "#38BDF8",
          dark: "#0284C7",
        },
        card: {
          DEFAULT: "#111827",
          secondary: "#172033",
        },
        border: "#1E293B",
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
