/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'float-bg': 'floatBackground 12s ease-in-out infinite',
        'float-icon': 'float 3s ease-in-out infinite',
        'card-enter': 'cardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        floatBackground: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(15px, -20px) scale(1.02)' },
          '50%': { transform: 'translate(-10px, 15px) scale(0.98)' },
          '75%': { transform: 'translate(-20px, -10px) scale(1.01)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        cardEnter: {
          'from': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
