/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#090a0f',
          800: '#12151e',
          700: '#1a1e2e',
          600: '#252a3e',
        },
        gold: {
          400: '#ffd700',
          500: '#f5c518',
          600: '#d4a914',
        },
        accent: {
          crimson: '#ff453a',
          emerald: '#32d74b',
          sapphire: '#0a84ff',
          violet: '#bf5af2'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
