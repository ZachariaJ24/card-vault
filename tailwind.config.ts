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
            background: "#060d18",
            foreground: "#f0f8ff",
            divider: "rgba(0,180,255,0.12)",
            focus: "#00b4ff",
            overlay: "rgba(6,13,24,0.8)",
            content1: "#0a1628",
            content2: "#0f1d32",
            content3: "#162540",
            content4: "#64748b",
            primary: {
              50: "#e6f8ff",
              100: "#b3ecff",
              200: "#80dfff",
              300: "#4dd2ff",
              400: "#26c8ff",
              500: "#00b4ff",
              600: "#0088cc",
              700: "#005c99",
              800: "#003066",
              900: "#000433",
              DEFAULT: "#00b4ff",
              foreground: "#060d18",
            },
            secondary: {
              50: "#fef9ec",
              100: "#fdf0c4",
              200: "#fce499",
              300: "#fad66e",
              400: "#f9cb4e",
              500: "#f59e0b",
              600: "#d97706",
              700: "#b45309",
              800: "#92400e",
              900: "#78350f",
              DEFAULT: "#f59e0b",
              foreground: "#060d18",
            },
            success: {
              DEFAULT: "#22c55e",
              foreground: "#060d18",
            },
            danger: {
              DEFAULT: "#ef4444",
              foreground: "#f0f8ff",
            },
            warning: {
              DEFAULT: "#f59e0b",
              foreground: "#060d18",
            },
            default: {
              50: "#060d18",
              100: "#0a1628",
              200: "#0f1d32",
              300: "#162540",
              400: "#64748b",
              500: "#94a3b8",
              DEFAULT: "#162540",
              foreground: "#f0f8ff",
            },
          },
        },
      },
    }),
  ],
};

export default config;
