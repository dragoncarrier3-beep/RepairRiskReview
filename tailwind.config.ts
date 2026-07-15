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
        navy: {
          950: "#050e1f",
          900: "#0a1c3e",
          800: "#0f2a56",
          700: "#163a70",
          600: "#1e4d8c",
        },
        brand: {
          blue: "#1a5bb8",
          light: "#2b6fd1",
        },
        risk: {
          excellent: "#16a34a",
          low: "#65a30d",
          moderate: "#ea580c",
          high: "#dc2626",
          severe: "#991b1b",
          warn: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-source-sans)", "Segoe UI", "sans-serif"],
        display: ["var(--font-source-sans)", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(10,28,62,0.08), 0 4px 16px rgba(10,28,62,0.06)",
        elev: "0 8px 30px rgba(10,28,62,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
