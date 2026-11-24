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
        brand: {
          50: '#F7F3FB',
          100: '#F0EAF8',
          200: '#DFD1F0',
          300: '#C7B1E4',
          400: '#A47DD2',
          500: '#8656BF',
          600: '#6941A5', // Primary accent as specified: #6941A5
          700: '#563588',
          800: '#462B6F',
          900: '#3A245B',
        },
        surface: {
          app: '#F5F5F5',
          canvas: '#FFFFFF',
          sidebar: '#FBFBFB',
          panel: '#F7F7F8',
          border: '#E0E0E0',
          darkApp: '#1E1E1E',
          darkCanvas: '#252526',
          darkPanel: '#2D2D2D',
          darkBorder: '#3C3C3C',
        },
        onenote: {
          purple: '#6941A5',
          darkPurple: '#563588',
          tabHighlight: '#F0EAF8',
          textPrimary: '#242424',
          textSecondary: '#616161',
          textMuted: '#8A8A8A',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

