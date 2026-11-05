/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'sans-serif'],
        display: ['"Space Grotesk"', '"DM Sans"', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#08070d',
          900: '#0e0c16',
          850: '#14111f',
          800: '#1b1829',
          700: '#262238',
          600: '#352f4e',
          500: '#4b4470',
        },
        volt: {
          DEFAULT: '#c6ff3d',
          300: '#dcff82',
          400: '#c6ff3d',
          500: '#a3e000',
        },
        iris: {
          DEFAULT: '#8f7dff',
          400: '#a89aff',
          500: '#7461f5',
        },
        mint: '#e4ffa0',
        live: '#ff4560',
        gold: '#ffc247',
        up: '#3ddc97',
        down: '#ff6b81',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.05) inset, 0 18px 40px -20px rgba(0,0,0,0.75)',
        glow: '0 0 0 1px rgba(198,255,61,0.6), 0 10px 28px -8px rgba(198,255,61,0.35)',
        float: '0 24px 60px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)',
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
