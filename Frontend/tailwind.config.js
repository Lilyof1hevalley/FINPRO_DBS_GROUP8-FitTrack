/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#080C14',
          card: '#0F1523',
          elevated: '#151D2E',
          border: '#1E2A3D',
        },
        accent: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          light: '#4ADE80',
          glow: 'rgba(34,197,94,0.15)',
        },
        text: {
          primary: '#F0F4FF',
          secondary: '#8B9BB4',
          muted: '#4A5568',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
