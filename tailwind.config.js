/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        command: {
          bg: '#0B0F17',
          surface: '#111827',
          card: '#161F30',
          border: '#1F293D',
          hover: '#26334D',
          text: '#F3F4F6',
          muted: '#94A3B8',
          accent: '#0284C7',
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'cascade-wave': 'cascade 2s infinite ease-in-out',
      },
      keyframes: {
        cascade: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.98)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
};
