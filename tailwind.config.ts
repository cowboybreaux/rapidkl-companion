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
        // RapidKL civic palette: paper-white surfaces, aqua elevation, navy structure.
        base: '#F1EAEE',
        surface: '#FFFFFF',
        elevated: '#A8DADC',
        hairline: '#457B9D',
        accent: '#9B1B30',
        ink: {
          primary: '#1B3A57',
          secondary: '#457B9D',
          tertiary: '#9B1B30',
        },
        line: {
          kelana: '#2F6FED',
          ampang: '#F2994A',
          mrt: '#2FB380',
          monorail: '#F2C94C',
          ktm: '#E0475A',
          putrajaya: '#7C5CFC',
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
