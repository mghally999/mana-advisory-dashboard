import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        bg: "hsl(var(--bg))",
        surface: "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",
        "surface-3": "hsl(var(--surface-3))",
        ink: "hsl(var(--ink))",
        muted: "hsl(var(--muted))",
        soft: "hsl(var(--soft))",
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        gold: "hsl(var(--gold))",
        "gold-soft": "hsl(var(--gold-soft))",
        "gold-bg": "hsl(var(--gold-bg))",
        marine: "hsl(var(--marine))",
        interior: "hsl(var(--interior))",
        mana: "hsl(var(--mana))",
        engineering: "hsl(var(--engineering))",
        success: "hsl(var(--success))",
        warn: "hsl(var(--warn))",
        danger: "hsl(var(--danger))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-up": "fade-up 0.5s ease forwards",
        "count-up": "count-up 0.9s ease forwards",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--gold) / 0.4)" },
          "50%": { boxShadow: "0 0 0 8px hsl(var(--gold) / 0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
