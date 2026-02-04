/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colorblind-friendly palette (Paul Tol)
        status: {
          safe: '#228833',       // Blue-Green
          'safe-light': '#e8f5ea',
          testing: '#FF8800',    // Orange
          'testing-light': '#fff4e6',
          reaction: '#EE6677',   // Reddish-Pink
          'reaction-light': '#fdeef0',
        },
        primary: {
          50: '#f0f9f4',
          100: '#dcf0e3',
          200: '#b9e1c7',
          300: '#8bcea5',
          400: '#5ab57f',
          500: '#228833',
          600: '#1e7a2e',
          700: '#1a6327',
          800: '#174e21',
          900: '#13411c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
