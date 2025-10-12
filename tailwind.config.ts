import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        sand: '#E8DAC7',
        milk: '#F7F4EF',
        flax: '#D6C9B8',
        graphite: '#333333',
        moss: '#6F7D5A',
        olive: '#6B7D4F',
        cream: '#F5F1E8'
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl2: '1rem'
      }
    }
  },
  plugins: []
} satisfies Config

