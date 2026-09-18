/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#F1F4F7',
        navy: {
          deep: '#0F2A43',
          mid: '#17405F',
        },
        teal: {
          DEFAULT: '#0EA5A0',
          dark: '#0B8480',
          tint: '#E4F6F5',
        },
        ink: '#10202F',
        slate: '#5B6B7A',
        border: '#E2E8EE',
        status: {
          green: '#1FAA59',
          greenTint: '#E7F7ED',
          amber: '#C7860A',
          amberTint: '#FBF1DC',
          red: '#D64545',
          redTint: '#FBE8E8',
          grey: '#8B99A6',
          greyTint: '#EEF1F4',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,42,67,.06)',
      },
    },
  },
  plugins: [],
};
