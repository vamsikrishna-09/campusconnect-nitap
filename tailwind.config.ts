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
        primary: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcdbff",
          300: "#8ec3ff",
          400: "#599fff",
          500: "#3277fc",
          600: "#1b57f0",
          700: "#1342dd",
          800: "#1536b3",
          900: "#17318c",
          950: "#0c1a4d",
        },
        navy: {
          800: "#0f172a",
          900: "#0a0f1d",
          950: "#060913",
        },
        accent: {
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        }
      },
    },
  },
  plugins: [],
};
export default config;
