/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1C2B4A',
        navyDeep: '#121D33',
        parchment: '#F6F1E6',
        parchmentDim: '#EDE5D3',
        burgundy: '#8B2635',
        burgundyDim: '#F1DCDC',
        brass: '#AD8A4E',
        brassLight: '#D9C495',
        sage: '#52654A',
        holidayPublic: '#B42318',
        holidayPublicHover: '#9B1C1C',
        holidayWeekend: '#9A6B2F',
        holidayWeekendHover: '#855C28',
        ink: '#2A2620',
        inkSoft: '#6B6455',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'parchment-grid':
          'radial-gradient(circle at 1px 1px, rgba(42, 38, 32, 0.07) 1px, transparent 0)',
        'masthead':
          'linear-gradient(135deg, #121D33 0%, #1C2B4A 55%, #243556 100%)',
      },
      backgroundSize: {
        grid: '18px 18px',
      },
      boxShadow: {
        slip: '0 1px 0 rgba(28, 43, 74, 0.08), 0 8px 24px rgba(18, 29, 51, 0.06)',
      },
    },
  },
  plugins: [],
}
