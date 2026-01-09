/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        clinic: {
          primary: '#1d4ed8',
          secondary: '#0f172a',
          accent: '#22d3ee',
          surface: '#f8fafc',
        },
      },
      boxShadow: {
        panel: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [forms({ strategy: 'class' })],
}
