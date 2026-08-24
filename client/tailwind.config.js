/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffbeb",
          100: "#fff3c4",
          200: "#ffe89a",
          300: "#ffe071",
          400: "#ffd43b",
          500: "#f0b429",
          600: "#c98a05",
          700: "#a37500",
          ink: "#14181f",
        },
      },
      boxShadow: {
        "elev-1": "0 1px 1px rgba(20,24,31,0.04), 0 2px 4px rgba(20,24,31,0.04), 0 6px 12px rgba(20,24,31,0.04)",
        "elev-2": "0 1px 2px rgba(20,24,31,0.07), 0 4px 10px rgba(20,24,31,0.04), 0 14px 28px rgba(20,24,31,0.07)",
        "elev-3": "0 2px 4px rgba(20,24,31,0.07), 0 8px 20px rgba(20,24,31,0.07), 0 24px 48px rgba(20,24,31,0.07), 0 40px 80px rgba(20,24,31,0.04)",
        "elev-4": "0 2px 6px rgba(20,24,31,0.11), 0 12px 28px rgba(20,24,31,0.07), 0 32px 64px rgba(20,24,31,0.11), 0 60px 120px rgba(20,24,31,0.07)",
        "inner-top": "inset 0 1px 0 rgba(255,255,255,0.9)",
      },
      transitionTimingFunction: {
        "out-3d": "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translate3d(0,0,0) rotate(0deg)" },
          "50%": { transform: "translate3d(0,-16px,0) rotate(-1.2deg)" },
        },
        "spin-slow": {
          from: { transform: "rotateX(-18deg) rotateY(0deg)" },
          to: { transform: "rotateX(-18deg) rotateY(360deg)" },
        },
      },
      animation: {
        floaty: "floaty 7s cubic-bezier(0.22,1,0.36,1) infinite",
        "spin-slow": "spin-slow 22s linear infinite",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".perspective-800": { perspective: "800px" },
        ".perspective-1200": { perspective: "1200px" },
        ".perspective-1600": { perspective: "1600px" },
        ".transform-3d": { "transform-style": "preserve-3d" },
        ".backface-hidden": { "backface-visibility": "hidden" },
      });
    },
  ],
};
