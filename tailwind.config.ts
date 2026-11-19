import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: "#FCFBF8",
          100: "#FAF7F0",
          200: "#F4EFE2",
          300: "#ECE3CE",
          400: "#E2D3B3",
        },
        emerald: {
          deep: "#0B3D2E",
          hover: "#082F24",
          light: "#E7F2EE",
          border: "#BBD5CB",
          muted: "#166534",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#EADCA6",
          dark: "#A68218",
          shimmer: "#FDF4D4",
          border: "#DFC775",
        },
        maroon: {
          DEFAULT: "#8B1E1E",
          light: "#FBEBEB",
          border: "#E8B3B3",
        },
        charcoal: {
          DEFAULT: "#2B2B2B",
          muted: "#5A5A5A",
          light: "#8C8C8C",
          border: "#E5E1D8",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 4px 20px -2px rgba(11, 61, 46, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        "luxury-lg": "0 10px 30px -4px rgba(11, 61, 46, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.05)",
        gold: "0 0 15px rgba(201, 162, 39, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
