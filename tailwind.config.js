/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        grove: {
          50: '#f2f8f1',
          100: '#dcefd9',
          500: '#2f6b45',
          700: '#214f35',
          900: '#143321'
        },
        marigold: '#e9a93a',
        clay: '#b75f31',
        ink: '#17231b'
      },
      boxShadow: {
        soft: '0 16px 48px rgba(23, 35, 27, 0.12)'
      }
    }
  },
  plugins: []
};
