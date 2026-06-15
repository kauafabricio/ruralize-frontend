/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: "#2c4a24",
        },
        secondary: "#f5eee0",
        accent: "#b0cdba",
        muted: "#a1ba9b",
        "base-clean": "#ffffff",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(44, 74, 36, 0.03)",
        sm: "0 2px 4px rgba(44, 74, 36, 0.05)",
        md: "0 4px 20px rgba(44, 74, 36, 0.05)",
        lg: "0 8px 24px rgba(44, 74, 36, 0.08)",
        xl: "0 16px 48px rgba(44, 74, 36, 0.1)",
        glow: "0 0 20px rgba(44, 74, 36, 0.1)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-inter)", "monospace"],
      },
    },
  },
  plugins: [],
};
