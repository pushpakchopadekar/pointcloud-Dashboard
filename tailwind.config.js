/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: '#0B0E14',
          900: '#0F131B',
          850: '#12161F',
          800: '#171C27',
          700: '#232A38',
          600: '#333C4E',
        },
        scan: {
          cyan: '#4FD1C5',
          cyanDim: '#2B7A72',
          amber: '#F5A623',
          amberDim: '#8A5E14',
        },
        ink: {
          100: '#E6EAF0',
          300: '#A6B0C0',
          500: '#7A8699',
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        hud: '0 0 0 1px rgba(79,209,197,0.15), 0 0 24px rgba(79,209,197,0.06)',
      },
    },
  },
  plugins: [],
};
