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
        accent: {
          DEFAULT: "var(--accent)",
          bright: "var(--accent-bright)",
          teal: "var(--accent-teal)",
        },
        binance: {
          yellow: "var(--binance-yellow)",
          darkYellow: "var(--binance-yellow-dark)",
        },
        bg: {
          void: "var(--bg-void)",
          dark: "var(--bg-void)",
          panel: "var(--bg-panel)",
          card: "var(--bg-card)",
        },
        neon: {
          cyan: "var(--neon-cyan)",
          magenta: "var(--neon-cyan)",
          purple: "var(--neon-cyan)",
          violet: "var(--neon-violet)",
          green: "var(--neon-green)",
          amber: "var(--neon-amber)",
          red: "var(--neon-red)",
        },
        status: {
          up: "var(--status-up)",
          down: "var(--status-down)",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "JetBrains Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      keyframes: {
        "glitch-shift": {
          "0%": { "clip-path": "inset(0 0 85% 0)", transform: "translate(-2px, -1px)" },
          "20%": { "clip-path": "inset(40% 0 43% 0)", transform: "translate(2px, 1px)" },
          "40%": { "clip-path": "inset(80% 0 5% 0)", transform: "translate(-1px, 2px)" },
          "60%": { "clip-path": "inset(20% 0 60% 0)", transform: "translate(2px, -2px)" },
          "80%": { "clip-path": "inset(60% 0 20% 0)", transform: "translate(-2px, 1px)" },
          "100%": { "clip-path": "inset(0 0 0 0)", transform: "translate(0, 0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.9" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "ticker-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "grid-move": {
          "0%": { "background-position": "0 0" },
          "100%": { "background-position": "0 100%" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "33%": { transform: "translateY(-12px) translateX(6px)" },
          "66%": { transform: "translateY(6px) translateX(-6px)" },
        },
        "matrix-fall": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
          "95%": { opacity: "0.97" },
        },
      },
      animation: {
        "glitch-shift": "glitch-shift 3.5s infinite linear alternate-reverse",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "ticker-scroll": "ticker-scroll 160s linear infinite",
        "grid-move": "grid-move 20s linear infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "matrix-fall": "matrix-fall 6s linear infinite",
        "blink": "blink 1s step-end infinite",
        "flicker": "flicker 4s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
