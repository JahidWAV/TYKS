import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0D0B1A",
        surface: "#151228",
        "surface-raised": "#1B1733",
        indigo: {
          DEFAULT: "#6366f1",
          soft: "#8385f5",
        },
        amber: {
          DEFAULT: "#FFB238",
          soft: "#FFCB7A",
        },
        ink: {
          DEFAULT: "#F5F3FF",
          muted: "#9A93B8",
          faint: "#5F5880",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "night-glow":
          "radial-gradient(120% 120% at 15% 0%, rgba(99,102,241,0.25) 0%, rgba(13,11,26,0) 55%), radial-gradient(90% 90% at 90% 10%, rgba(255,178,56,0.12) 0%, rgba(13,11,26,0) 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
