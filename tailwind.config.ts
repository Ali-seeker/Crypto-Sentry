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
        binance: {
          yellow: "var(--binance-yellow)",
          darkYellow: "var(--binance-yellow-dark)",
        },
        bg: {
          dark: "var(--bg-dark)",
          card: "var(--bg-card)",
        },
        status: {
          up: "var(--status-up)",
          down: "var(--status-down)",
        }
      },
    },
  },
  plugins: [],
};
export default config;
