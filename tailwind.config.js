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
          950: 'rgb(var(--ink-950) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          850: 'rgb(var(--ink-850) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
        },
        volt: {
          DEFAULT: 'rgb(var(--volt) / <alpha-value>)',
          300: 'rgb(var(--volt-300) / <alpha-value>)',
          400: 'rgb(var(--volt) / <alpha-value>)',
          500: 'rgb(var(--volt-500) / <alpha-value>)',
        },
        iris: {
          DEFAULT: 'rgb(var(--iris) / <alpha-value>)',
          400: 'rgb(var(--iris-400) / <alpha-value>)',
          500: 'rgb(var(--iris-500) / <alpha-value>)',
        },
        mint: 'rgb(var(--mint) / <alpha-value>)',
        live: 'rgb(var(--live) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        up: 'rgb(var(--up) / <alpha-value>)',
        down: 'rgb(var(--down) / <alpha-value>)',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.05) inset, 0 18px 40px -20px rgba(4,10,16,0.75)',
        glow: '0 0 0 1px rgb(var(--volt) / 0.6), 0 10px 28px -8px rgb(var(--volt) / 0.35)',
        float: '0 24px 60px -20px rgba(4,10,16,0.85), 0 0 0 1px rgba(255,255,255,0.06)',
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
