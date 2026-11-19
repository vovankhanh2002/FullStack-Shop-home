import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: {
          50: "#FDFBF7",
          100: "#FAF9F6",
          200: "#F5F2EB",
          300: "#EAE5DB",
          400: "#DDD5C7",
        },
        wood: {
          50: "#F9F6F0",
          100: "#EFEBD9",
          200: "#D4A373",
          300: "#B67E55",
          400: "#A06A42",
          500: "#8C5E3C",
          600: "#70482B",
          700: "#55351E",
        },
        navy: {
          900: "#1E2A38",
          800: "#283455",
          700: "#32436D",
        },
        olive: {
          500: "#5F6F52",
          600: "#4D5C42",
        },
        charcoal: {
          500: "#6B7280",
          700: "#374151",
          900: "#1F2937",
          950: "#111827",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
