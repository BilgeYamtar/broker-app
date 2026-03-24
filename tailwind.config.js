/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        maritime: {
          base: "#0a1628",
          surface: "#0f1f38",
          card: "#152040",
          border: "#1e3055",
          "border-light": "#2a4070",
          teal: "#2dd4a8",
          "teal-dim": "#1a8a6e",
          "teal-bg": "rgba(45, 212, 168, 0.1)",
          white: "#f0f4f8",
          muted: "#8899aa",
          danger: "#ef4444",
          "danger-bg": "rgba(239, 68, 68, 0.1)",
          warning: "#f59e0b",
          "warning-bg": "rgba(245, 158, 11, 0.1)",
          success: "#2dd4a8",
          "success-bg": "rgba(45, 212, 168, 0.1)",
        },
      },
      fontFamily: {
        sans: ["Inter", "Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
      },
    },
  },
  plugins: [],
};
