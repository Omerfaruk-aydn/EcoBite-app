import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2E7D32',
          secondary: '#4CAF50',
          light: '#A5D6A7',
          accent: '#8BC34A',
          surface: '#F1F8E9',
        },
        neutral: {
          bg: '#F4F4F4',
          card: '#FFFFFF',
          text: '#1C1C1E',
          muted: '#6B7280',
          border: '#E5E7EB',
        },
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        heading: ['Nunito', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
    },
  },
  plugins: [],
} satisfies Config
