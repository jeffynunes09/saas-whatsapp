import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
          light: '#DCF8C6',
        },
      },
    },
  },
  plugins: [],
};

export default config;
