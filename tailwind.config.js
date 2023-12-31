/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '400': '400px',
        '600': '600px',
      },
      fontFamily: {
        'game': "'Special Elite', cursive",
      },
      skew: {
        '20': '20deg',
      }
    },
  },
  plugins: [],
}