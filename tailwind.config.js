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
          bg: '#000000',
          card: '#0F0F0F',
          surface: '#161616',
          text: '#FFFFFF',
          muted: '#CFCFCF',
          faint: '#8B8B8B',
          border: '#2A2A2A',
          paper: '#ECEAE4',
          ink: '#0A0A0A',
          focus: '#FFFFFF',
          /** Deprecated token: maps to neutral focus for fewer churned imports */
          accent: '#FFFFFF',
          warning: '#CFCFCF',
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
