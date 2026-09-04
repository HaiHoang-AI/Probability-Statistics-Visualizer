/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        ink: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        }
      },
      fontFamily: {
        heading: ['"Be Vietnam Pro"', 'sans-serif'],
        body: ['"Be Vietnam Pro"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'cartoon-sm': '2px 2px 0px #0F172A',
        'cartoon': '4px 4px 0px #0F172A',
        'cartoon-lg': '6px 6px 0px #0F172A',
        'cartoon-dark-sm': '2px 2px 0px #0284C7',
        'cartoon-dark': '4px 4px 0px #0284C7',
        'cartoon-dark-lg': '6px 6px 0px #0284C7',
      }
    },
  },
  plugins: [],
}
