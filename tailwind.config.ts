import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'SF Mono'", "'Fira Code'", "Consolas", "monospace"],
      },
    },
  },
  plugins: [
    heroui({
      defaultTheme: "dark",
      themes: {
        dark: {
          colors: {
            background: "#0a0a0a",
            foreground: "#fafafa",
            divider: "#1a1a1a",
            focus: "#10b981",
            overlay: "rgba(0,0,0,0.7)",
            content1: "#111111",
            content2: "#161616",
            content3: "#1a1a1a",
            content4: "#a1a1aa",
            primary: {
              50: "#ecfdf5",
              100: "#d1fae5",
              200: "#a7f3d0",
              300: "#6ee7b7",
              400: "#34d399",
              500: "#10b981",
              600: "#059669",
              700: "#047857",
              800: "#065f46",
              900: "#064e3b",
              DEFAULT: "#10b981",
              foreground: "#000000",
            },
            secondary: {
              50: "#eff6ff",
              100: "#dbeafe",
              200: "#bfdbfe",
              300: "#93c5fd",
              400: "#60a5fa",
              500: "#3b82f6",
              600: "#2563eb",
              700: "#1d4ed8",
              800: "#1e40af",
              900: "#1e3a8a",
              DEFAULT: "#3b82f6",
              foreground: "#ffffff",
            },
            success: {
              50: "#ecfdf5",
              100: "#d1fae5",
              200: "#a7f3d0",
              300: "#6ee7b7",
              400: "#34d399",
              500: "#10b981",
              600: "#059669",
              DEFAULT: "#10b981",
              foreground: "#000000",
            },
            danger: {
              50: "#fef2f2",
              100: "#fee2e2",
              200: "#fecaca",
              300: "#fca5a5",
              400: "#f87171",
              500: "#ef4444",
              600: "#dc2626",
              DEFAULT: "#ef4444",
              foreground: "#ffffff",
            },
            warning: {
              50: "#fffbeb",
              100: "#fef3c7",
              200: "#fde68a",
              300: "#fcd34d",
              400: "#fbbf24",
              500: "#f59e0b",
              600: "#d97706",
              DEFAULT: "#f59e0b",
              foreground: "#000000",
            },
            default: {
              50: "#0a0a0a",
              100: "#111111",
              200: "#1a1a1a",
              300: "#262626",
              400: "#404040",
              500: "#737373",
              600: "#a3a3a3",
              DEFAULT: "#1a1a1a",
              foreground: "#fafafa",
            },
          },
        },
      },
    }),
  ],
};

export default config;
