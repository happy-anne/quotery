import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,ts}',
    './nuxt.config.ts',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#ffffff',
        surface: '#f5f5f5',
        stone: '#f5f2ef',
        secondary: '#4e4e4e',
        muted: '#777169',
        'muted-soft': '#a8a29a',
        border: '#e5e5e5',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
} satisfies Config
