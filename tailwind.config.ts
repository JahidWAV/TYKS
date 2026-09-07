import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0D",
        surface: "#131318",
        "surface-raised": "#1C1C24",
        "surface-hair": "rgba(255,255,255,0.07)",
        indigo: {
          DEFAULT: "#4B4FA8",
          soft: "#6D71C4",
          dim: "#33355F",
        },
        gold: {
          DEFAULT: "#C9A227",
          soft: "#E3C669",
          deep: "#8C7220",
        },
        ink: {
          DEFAULT: "#F6F5F2",
          muted: "#9C9AA3",
          faint: "#5C5A63",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "night-glow":
          "radial-gradient(110% 110% at 10% -10%, rgba(75,79,168,0.16) 0%, rgba(10,10,13,0) 55%), radial-gradient(80% 80% at 95% 0%, rgba(201,162,39,0.10) 0%, rgba(10,10,13,0) 50%)",
        "metal-sheen":
          "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 28%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.05) 70%, rgba(255,255,255,0.12) 100%)",
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
