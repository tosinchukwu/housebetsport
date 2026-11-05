/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'ui-sans-serif', 'sans-serif'],
        display: ['Sora', 'Figtree', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#021118',
          900: '#041a23',
          850: '#062330',
          800: '#08303f',
          700: '#0d3f52',
          600: '#155369',
          500: '#1f6b84',
        },
        aqua: {
          DEFAULT: '#3ee6f5',
          300: '#8af2fb',
          400: '#3ee6f5',
          500: '#17c9db',
        },
        mint: '#c3f8ee',
        live: '#ff3e6c',
        gold: '#ffb648',
        up: '#34d399',
        down: '#ff6b81',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(62,230,245,0.5), 0 8px 24px -8px rgba(62,230,245,0.35)',
      },
      keyframes: {
        flash: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '20%': { opacity: '1' },
          '100%': { opacity: '0.0', transform: 'translateY(0)' },
        },
        tint: {
          '0%': { backgroundColor: 'var(--tint)' },
          '100%': { backgroundColor: 'transparent' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.7)' },
        },
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        flash: 'flash 1.6s ease-out forwards',
        tint: 'tint 1.4s ease-out forwards',
        pulseDot: 'pulseDot 1.4s ease-in-out infinite',
        floatIn: 'floatIn 0.35s ease-out both',
      },
    },
  },
  plugins: [],
}
