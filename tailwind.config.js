/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dashboard: {
          bg: '#0F172A',
          card: '#1E293B',
          accent: '#3B82F6',
          'accent-hover': '#2563EB',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          text: {
            primary: '#F8FAFC',
            secondary: '#94A3B8',
            accent: '#60A5FA'
          }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};