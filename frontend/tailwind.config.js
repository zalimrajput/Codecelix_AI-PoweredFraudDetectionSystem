/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0F17',
          secondary: '#111827',
          tertiary: '#1F2937',
          elevated: '#182234',
        },
        border: {
          subtle: '#1E293B',
          DEFAULT: '#334155',
          strong: '#475569',
        },
        surface: {
          DEFAULT: '#111827',
          hover: '#1F2937',
          active: '#374151',
        },
        // Semantic Fraud Status Colors
        status: {
          low: {
            DEFAULT: '#10B981', // Emerald
            bg: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.3)',
            text: '#34D399',
          },
          medium: {
            DEFAULT: '#F59E0B', // Amber
            bg: 'rgba(245, 158, 11, 0.12)',
            border: 'rgba(245, 158, 11, 0.3)',
            text: '#FBBF24',
          },
          high: {
            DEFAULT: '#F43F5E', // Crimson
            bg: 'rgba(244, 63, 94, 0.12)',
            border: 'rgba(244, 63, 94, 0.3)',
            text: '#FB7185',
          },
        },
        // Network Graph Entity Colors
        entity: {
          customer: '#3B82F6', // Blue
          device: '#10B981',   // Green
          ip: '#8B5CF6',       // Purple
          transaction: '#06B6D4', // Cyan
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
