/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
        /** Phase 3.5 — keep in sync with constants/palettes.ts (darkPalette). */
        runtable: {
          bg: '#111111',
          'bg-elevated': '#161616',
          card: '#202020',
          surface: '#252525',
          text: '#F4F1EA',
          muted: '#D8D3CB',
          faint: '#9A958C',
          border: '#3A3936',
          paper: '#FAF6EE',
          ink: '#2B2B2B',
          sepia: '#C4B8A8',
          'map-pad': '#141414',
          focus: '#F4F1EA',
          accent: '#F4F1EA',
          warning: '#D8D3CB',
        },
        /** Light mode tokens — lightPalette */
        runtableLight: {
          bg: '#F6F1E7',
          'bg-elevated': '#EFE7DA',
          card: '#FAF6EE',
          surface: '#F3ECDF',
          text: '#2B2B2B',
          muted: '#555555',
          faint: '#6E6E6E',
          border: '#D6CCBC',
          paper: '#FAF6EE',
          ink: '#2B2B2B',
          sepia: '#B5A892',
          'map-pad': '#EFE7DA',
          focus: '#2B2B2B',
          accent: '#2B2B2B',
          warning: '#555555',
        },
      },
      fontFamily: {
        pixel: ['PressStart2P_400Regular'],
        mono: ['IBMPlexMono_400Regular'],
        'mono-semibold': ['IBMPlexMono_600SemiBold'],
      },
      letterSpacing: {
        thermal: '0.25em',
        receipt: '0.12em',
      },
    },
  },
  plugins: [],
};
