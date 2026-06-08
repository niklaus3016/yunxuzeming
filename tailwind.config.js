/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          150: '#f2f2f2',
          450: '#9ca3af',
          750: '#374151',
        },
        red: {
          650: '#dc2626',
        },
      },
      boxShadow: {
        '3xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
