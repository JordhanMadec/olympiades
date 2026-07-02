/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        surface: {
          50:  '#07070d',
          100: '#0d0d16',
          200: '#13131e',
          300: '#1a1a28',
          400: '#222234',
          500: '#2c2c40',
          600: '#38384f',
        },
        'surface-border': '#1f1f2e',
        'surface-border-light': '#2a2a3f',
        'text-muted': '#6b7280',
      },
    },
  },
  plugins: [],
}
