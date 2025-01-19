/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'], 
      },
      colors: {
        background: {
          DEFAULT: '#121417',
          lighter: '#1A1D21',
          darker: '#0A0B0C',
        },
        surface: {
          DEFAULT: '#202326',
          hover: '#2A2D31',
          active: '#323538',
          border: '#383B3E',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#3B82F6',
          dark: '#1E40AF',
        },
        mainWhite: {
          DEFAULT: '#E5E7EB',
          muted: '#9CA3AF',
          subtle: '#6B7280',
        }
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translate(-50%, -20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translate(-50%, 0)'
          }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out'
      }
    }
  },
  plugins: [],
}
