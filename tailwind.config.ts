import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0088CE", // Primary Blue — CTA, active states, links
          navy: "#0B132B", // Navy — headings, dark surfaces, footer
          teal: "#4ECDC4", // Teal/Cyan — secondary accents, badges
          gold: "#F4C430", // Accent Gold — highlights, special emphasis
        },
        background: "#F8FAFC", // Background Light
        surface: "#FFFFFF", // Surface White — cards, modals
        border: "hsl(214 32% 91%)",
        ring: "#0088CE",
        foreground: "#0B132B",
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        primary: {
          DEFAULT: "#0088CE",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#4ECDC4",
          foreground: "#0B132B",
        },
        accent: {
          DEFAULT: "#F4C430",
          foreground: "#0B132B",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        khmer: ["var(--font-kantumruy)", "var(--font-noto-khmer)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(11 19 43 / 0.04), 0 4px 16px -4px rgb(11 19 43 / 0.08)",
        "card-hover": "0 2px 4px 0 rgb(11 19 43 / 0.06), 0 12px 24px -8px rgb(11 19 43 / 0.12)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
