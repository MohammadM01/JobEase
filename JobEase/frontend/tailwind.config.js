/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          cream: '#f4f1ea',
          gold: '#c5a059',
          navy: '#1a2b4b',
          dark: '#101828',
          gray: '#d6d2c4',
          light: '#ffffff',
          accent: '#b08d55'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
      boxShadow: {
        'vintage': '0 4px 20px -2px rgba(26, 43, 75, 0.15)',
        'vintage-hover': '0 8px 30px -4px rgba(26, 43, 75, 0.2)',
      }
    },
  },
  plugins: [],
}
