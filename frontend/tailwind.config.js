/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A1628',
        'bg-secondary': '#0F2040',
        'bg-card': '#162035',
        'accent-blue': '#2563EB',
        'accent-gold': '#F59E0B',
        'text-primary': '#FFFFFF',
        'text-muted': '#94A3B8',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'blue-lg': '0 10px 25px -5px rgba(37, 99, 235, 0.25)',
      },
    },
  },
  plugins: [],
};
