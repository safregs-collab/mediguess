/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", "[data-theme=\"dark\"]"],
  theme: {
    extend: {
      colors: {
        docw: {
          primary: "#0d9488",
          "primary-dark": "#0f766e",
          "primary-light": "#ccfbf1",
          blue: "#3b82f6",
          "blue-light": "#dbeafe",
          green: "#10b981",
          "green-light": "#dcfce7",
          violet: "#8b5cf6",
          "violet-light": "#ede9fe",
          sky: "#0ea5e9",
          "sky-light": "#e0f2fe",
          amber: "#f59e0b",
          "amber-light": "#fef3c7",
          red: "#ef4444",
          "red-light": "#fee2e2",
          emerald: "#22c55e",
          "emerald-light": "#dcfce7",
        },
        meta: {
          bg: "#0f172a",
          "bg-elevated": "#1e293b",
          "bg-card": "#1e293b",
          border: "#334155",
          "border-light": "#475569",
          text: "#e2e8f0",
          "text-secondary": "#94a3b8",
          "text-muted": "#64748b",
          accent: "#8b5cf6",
          "accent-light": "#a78bfa",
          "accent-bg": "rgba(139, 92, 246, 0.15)",
        },
        surface: {
          bg: "var(--bg)",
          card: "var(--card)",
          border: "var(--border)",
        },
        content: {
          DEFAULT: "var(--text)",
          secondary: "var(--text-secondary)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      borderRadius: {
        docw: "12px",
        "docw-sm": "8px",
      },
      boxShadow: {
        docw: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "docw-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "docw-dark": "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
        "docw-dark-lg": "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
      },
      keyframes: {
        "orb-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 15px) scale(0.95)" },
        },
        "meta-orb-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(20px, -20px) scale(1.05)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        pulse: {
          "0%, 100%": { boxShadow: "0 0 0 3px var(--primary-light)" },
          "50%": { boxShadow: "0 0 0 6px rgba(13, 148, 136, 0.15)" },
        },
        "modal-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "toast-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(-10px)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        "meta-fade-in": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "meta-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "meta-tab-enter": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.985)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "meta-inline-fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "meta-inline-slide-up": {
          from: { opacity: "0", transform: "translateY(20px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "orb-float": "orb-float 8s ease-in-out infinite",
        "meta-orb-float": "meta-orb-float 8s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease",
        "slide-up": "slide-up 0.3s ease",
        "slide-in": "slide-in 0.3s ease",
        "pop-in": "pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        shake: "shake 0.4s ease",
        pulse: "pulse 2s infinite",
        "modal-in": "modal-in 0.3s ease",
        "toast-in": "toast-in 0.3s ease",
        "toast-out": "toast-out 0.3s ease 2.7s",
        "confetti-fall": "confetti-fall 3s ease-out forwards",
        "meta-fade-in": "meta-fade-in 0.3s ease",
        "meta-spin": "meta-spin 0.8s linear infinite",
        "meta-tab-enter": "meta-tab-enter 0.25s cubic-bezier(0.22, 1, 0.36, 1) both",
        "meta-inline-fade-in": "meta-inline-fade-in 0.2s ease",
        "meta-inline-slide-up": "meta-inline-slide-up 0.25s ease",
      },
    },
  },
  plugins: [],
};
