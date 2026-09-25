/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          dark: "#1D4ED8",
          soft: "rgb(var(--primary-soft) / <alpha-value>)"
        },
        canvas: {
          DEFAULT: "rgb(var(--canvas) / <alpha-value>)",
          dark: "#0B1120"
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          dark: "#111827"
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          dark: "#F8FAFC",
          darkSoft: "#94A3B8"
        },
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          dark: "#1E293B"
        },
        success: "#16A34A",
        danger: "#DC2626",
        warn: "#D97706"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"]
      },
      maxWidth: {
        shell: "1320px"
      },
      container: {
        center: true,
        padding: { DEFAULT: "1rem", md: "1.5rem", lg: "2rem" },
        screens: { "2xl": "1320px" }
      },
      borderRadius: {
        card: "16px",
        soft: "12px",
        pill: "999px"
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)",
        lift: "0 2px 4px rgba(15, 23, 42, 0.05), 0 16px 32px rgba(15, 23, 42, 0.1)",
        glow: "0 0 0 1px rgba(37, 99, 235, 0.08), 0 20px 60px -20px rgba(37, 99, 235, 0.35)",
        pop: "0 24px 48px -12px rgba(2, 6, 23, 0.25)"
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
        "fade-up": "fade-up 0.4s ease-out both",
        "scale-in": "scale-in 0.3s ease-out both",
        "slide-in-right": "slide-in-right 0.35s ease-out both",
        "toast-in": "toast-in 0.3s ease-out both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite"
      },
      transitionDuration: {
        DEFAULT: "250ms"
      }
    }
  },
  plugins: []
};