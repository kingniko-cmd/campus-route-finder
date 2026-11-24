/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          50: "#f1f5fb",
          100: "#dfe8f5",
          200: "#c2d2ea",
          300: "#94b0d8",
          400: "#5f86bf",
          500: "#3b64a2",
          600: "#2b4d85",
          700: "#223d6b",
          800: "#1b3055",
          900: "#12213f",
          950: "#0b1630",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.05)",
        pop: "0 10px 40px rgba(15,23,42,0.18)",
      },
      keyframes: {
        "page-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "modal-in": {
          "0%": { opacity: "0", transform: "scale(0.96) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "60%": { opacity: "1", transform: "scale(1.01)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "row-flash": {
          "0%": { backgroundColor: "#dbeafe" },
          "100%": { backgroundColor: "rgba(219,234,254,0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "100%": { transform: "scale(1.55)", opacity: "0" },
        },
      },
      animation: {
        "page-in": "page-in 0.28s ease-out both",
        "toast-in": "toast-in 0.25s ease-out both",
        "modal-in": "modal-in 0.2s ease-out both",
        "fade-in": "fade-in 0.2s ease-out both",
        "pop-in": "pop-in 0.4s ease-out both",
        "row-flash": "row-flash 1.1s ease-out both",
        "pulse-ring": "pulse-ring 1.2s ease-out infinite",
      },
    },
  },
  plugins: [],
};
