/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: { DEFAULT: '#14201b', soft: '#3b4a43', mute: '#6b7a73' },
        paper: { DEFAULT: '#f6f3ec', card: '#fffdf8', line: '#e4dfd2' },
        pine: { DEFAULT: '#1f5c47', dark: '#143f31', light: '#dcebe3' },
        ember: { DEFAULT: '#c4562b', light: '#fae6dc' },
      },
      boxShadow: { card: '0 1px 0 #e4dfd2, 0 12px 30px -18px rgba(20,32,27,.35)' },
    },
  },
  plugins: [],
};
