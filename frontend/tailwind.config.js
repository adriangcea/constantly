/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "c-black":   "#030202",
        "c-dark":    "#1b1b1b",
        "c-gray":    "#BEBEBE",
        "c-light":   "#E2E2E2",
        "c-white":   "#FAFBFB",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
