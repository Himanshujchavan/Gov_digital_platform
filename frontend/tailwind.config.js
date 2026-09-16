/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maha: {
          blue: '#003366',
          darkBlue: '#002244',
          lightBlue: '#e6f0fa',
          orange: '#FF9933',
          green: '#138808',
          gold: '#D4AF37'
        }
      }
    },
  },
  plugins: [],
}
