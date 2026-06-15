/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#256A36',
          50: '#E8F5EC',
          100: '#C5E4CE',
          200: '#9FD1AF',
          300: '#79BE90',
          400: '#3DA85A',
          500: '#2D9144',
          600: '#267A39',
          700: '#256A36',
          800: '#1C5229',
          900: '#133B1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
