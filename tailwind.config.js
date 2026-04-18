/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        navy: {
          50: "#EEF1F7",
          100: "#D9DEEB",
          200: "#A8B1C7",
          300: "#7884A1",
          400: "#4D5876",
          500: "#2C3552",
          600: "#1B2240",
          700: "#131A33",
          800: "#0E1428",
          900: "#0B1121",
          950: "#070B17",
        },
        gold: {
          50: "#FBF5E6",
          100: "#F4E5BE",
          200: "#EBD08C",
          300: "#E0BB5E",
          400: "#D4A853",
          500: "#BC9143",
          600: "#977234",
          700: "#705527",
          800: "#4A3819",
          900: "#2C210F",
        },
      },
      boxShadow: {
        "elev-1": "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 1px 2px rgba(0,0,0,0.4)",
        "elev-2":
          "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -8px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.35)",
        "elev-3":
          "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px -12px rgba(0,0,0,0.7), 0 8px 16px rgba(0,0,0,0.4)",
        "gold-glow": "0 0 0 1px rgba(212,168,83,0.35), 0 0 24px -8px rgba(212,168,83,0.4)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "scale-in": "scale-in 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
