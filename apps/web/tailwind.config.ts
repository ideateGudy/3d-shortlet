import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50, #f6f5f4)',
          100: 'var(--brand-100, #eae7e4)',
          200: 'var(--brand-200, #d5ceca)',
          300: 'var(--brand-300, #b7aca5)',
          400: 'var(--brand-400, #96867d)',
          500: 'var(--brand-500, #7d6c63)',
          600: 'var(--brand-600, #69574f)',
          700: 'var(--brand-700, #54443e)',
          800: 'var(--brand-800, #463934)',
          900: 'var(--brand-900, #3c322e)',
          accent: 'var(--brand-accent, #c5a880)',
          gold: 'var(--brand-gold, #dfb76c)',
        },
        space: {
          900: '#07090e',
          950: '#030508',
        },
      },
      borderRadius: {
        'glass-sm': '12px',
        'glass-md': '20px',
        'glass-lg': '28px',
        'glass-xl': '36px',
      },
      backdropBlur: {
        xs: '4px',
        glass: '20px',
      },
      boxShadow: {
        glass: 'var(--glass-shadow)',
        'glass-highlight': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        glow: '0 0 25px rgba(223, 183, 108, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
