import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        onyx: {
          DEFAULT: "#0B0B0E",
          raised: "#17161B",
          line: "rgba(241,234,217,0.08)",
        },
        cobalt: {
          DEFAULT: "#3D46FF",
          soft: "#7A81FF",
          deep: "#1B1F80",
        },
        stub: {
          DEFAULT: "#F1EAD9",
          dim: "#DFD5BC",
        },
        bone: {
          DEFAULT: "#F1EAD9",
          muted: "#9A9488",
          faint: "#58534A",
        },
      },
      fontFamily: {
        sans: ["Grotesque", "sans-serif"],
        display: ["Lucidity", "Grotesque", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        grotesque: ["Grotesque", "sans-serif"],
        lucidity: ["Lucidity", "sans-serif"], // <-- Ajout de la classe font-lucidity
      },
      backgroundImage: {
        "night-glow":
          "radial-gradient(120% 120% at 12% -10%, rgba(61,70,255,0.14) 0%, rgba(11,11,14,0) 55%), radial-gradient(85% 85% at 100% 0%, rgba(241,234,217,0.05) 0%, rgba(11,11,14,0) 50%)",
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
