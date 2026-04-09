import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  plugins: [
    heroui({
      defaultTheme: "dark",
      themes: {
        dark: {
          colors: {
            background: "#09090b",
            foreground: "#fafafa",
            divider: "#27272a",
            focus: "#3b82f6",
            overlay: "rgba(0,0,0,0.6)",
            content1: "#18181b",
            content2: "#1c1c1f",
            content3: "#27272a",
            content4: "#a1a1aa",
            primary: {
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
            secondary: {
              50: "#fefce8",
              100: "#fef9c3",
              200: "#fef08a",
              300: "#fde047",
              400: "#facc15",
              500: "#eab308",
              600: "#ca8a04",
              700: "#a16207",
              800: "#854d0e",
              900: "#713f12",
              DEFAULT: "#eab308",
              foreground: "#09090b",
            },
            success: {
              DEFAULT: "#22c55e",
              foreground: "#ffffff",
            },
            danger: {
              DEFAULT: "#ef4444",
              foreground: "#ffffff",
            },
            warning: {
              DEFAULT: "#f59e0b",
              foreground: "#09090b",
            },
            default: {
              50: "#09090b",
              100: "#18181b",
              200: "#27272a",
              300: "#3f3f46",
              400: "#52525b",
              500: "#71717a",
              DEFAULT: "#27272a",
              foreground: "#fafafa",
            },
          },
        },
      },
    }),
  ],
};

export default config;
