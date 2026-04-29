/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        card: '#111827',
        accent: {
          green: '#A3FF12',
          purple: '#C084FC',
        }
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #A3FF12 0%, #C084FC 100%)',
      },
      backdropBlur: {
        'xl': '20px',
      }
    },
  },
  plugins: [],
}
