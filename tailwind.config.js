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
        clay: {
          bg: '#FFF7ED',
          card: '#FFFFFF',
          darkBg: '#0B0F19',
          darkCard: '#151D2E',
          darkSurface: '#1E293B',
          orange: '#FF6B35',
          coral: '#F97316',
          yellow: '#FFB800',
          green: '#10B981',
          teal: '#14B8A6',
          blue: '#3B82F6',
          indigo: '#6366F1',
          purple: '#8B5CF6',
          pink: '#EC4899',
        }
      },
      fontFamily: {
        heading: ['"Be Vietnam Pro"', 'sans-serif'],
        body: ['"Be Vietnam Pro"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'clay-sm': '3px 3px 6px rgba(0,0,0,0.06), -2px -2px 5px rgba(255,255,255,0.9), inset 1px 1px 1px rgba(255,255,255,0.6)',
        'clay-card': '8px 8px 16px rgba(249,115,22,0.08), -4px -4px 12px rgba(255,255,255,0.95), inset 2px 2px 4px rgba(255,255,255,0.8)',
        'clay-hover': '12px 12px 24px rgba(249,115,22,0.14), -6px -6px 16px rgba(255,255,255,1), inset 2px 2px 4px rgba(255,255,255,0.9)',
        'clay-pressed': 'inset 4px 4px 8px rgba(0,0,0,0.12), inset -2px -2px 6px rgba(255,255,255,0.7)',
        'clay-btn': '4px 6px 12px rgba(0,0,0,0.12), inset 1px 2px 2px rgba(255,255,255,0.4)',
        'clay-dark-card': '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'clay-dark-hover': '0 20px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 2px 0 rgba(255, 255, 255, 0.2)',
        'clay-dark-pressed': 'inset 0 3px 8px 0 rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
}
