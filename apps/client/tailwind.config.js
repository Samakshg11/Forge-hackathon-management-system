/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          raised: 'var(--bg-surface-raised)',
        },
        border: {
          subtle: 'var(--border-subtle)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          'primary-hover': 'var(--accent-primary-hover)',
          secondary: 'var(--accent-secondary)',
        },
        status: {
          success: 'var(--status-success)',
          warning: 'var(--status-warning)',
          danger: 'var(--status-danger)',
        },
        role: {
          admin: 'var(--role-admin)',
          organizer: 'var(--role-organizer)',
          judge: 'var(--role-judge)',
          participant: 'var(--role-participant)',
        },
      },
      fontFamily: {
        display: ['Geist', 'Inter Display', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        glow: '0 0 24px rgba(255, 90, 31, 0.35)',
        'glow-subtle': '0 0 16px rgba(91, 140, 255, 0.25)',
      },
      animation: {
        aurora: 'aurora 20s linear infinite',
        glow: 'glow 10s ease-in-out infinite alternate',
        marquee: 'marquee 25s linear infinite',
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: '50% 50%, 50% 50%' },
          to: { backgroundPosition: '350% 50%, 350% 50%' },
        },
        glow: {
          '0%': { opacity: 0.5, filter: 'blur(20px)' },
          '100%': { opacity: 1, filter: 'blur(40px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
