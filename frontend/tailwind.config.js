const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.orange,
        surface: {
          50: colors.slate['950'],
          100: colors.slate['900'],
          200: colors.slate['800'],
          300: colors.slate['700'],
          400: colors.slate['600'],
          500: colors.slate['500'],
          600: colors.slate['400'],
        },
        'surface-border': colors.slate['800'],
        'surface-border-light': colors.slate['700'],
        'text-muted': colors.gray['500'],
      },
    },
  },
  plugins: [],
};
