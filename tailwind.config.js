/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.js',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        runtable: {
          bg: '#0B0F14',
          card: '#131A22',
          accent: '#7CFF6B',
          muted: '#94A3B8',
          warning: '#FFB020',
        },
      },
    },
  },
  plugins: [],
};
