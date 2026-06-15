import type { Config } from "tailwindcss";
import { tailwindColors, shadowDefinitions } from "./app/lib/colors";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: tailwindColors,
      boxShadow: shadowDefinitions,
      borderRadius: {
        xs: "4px",
        sm: "8px",
        base: "12px",
        md: "14px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "28px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
