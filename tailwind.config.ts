import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Urban daylight palette: crisp blue-whites with a vivid civic accent.
        // Rail line colors below remain independent wayfinding tokens.
        base: '#F4F8FC',
        surface: '#FFFFFF',
        elevated: '#E5F0FC',
        hairline: '#B8CAE0',
        accent: '#006DCC',
        ink: {
          primary: '#102A43',
          secondary: '#3D5F7A',
          tertiary: '#6B8298',
        },
        line: {
          kelana: '#E91E8C',
          ampang: '#D99A35',
          mrt: '#087A55',
          monorail: '#23C875',
          ktm: '#F23D4F',
          putrajaya: '#F4C430',
        },
        severity: {
          critical: '#E0475A',
          warning: '#F2994A',
          info: '#2F6FED',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-space-grotesk)'],
      },
    },
  },
  plugins: [],
};

export default config;
