import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a1a',
        surface: '#1a1a2e',
        'surface-light': '#2a2a4a',
        type: {
          fire: '#ff6b35',
          water: '#3b82f6',
          grass: '#22c55e',
          electric: '#facc15',
          psychic: '#ec4899',
          ice: '#67e8f9',
          dragon: '#8b5cf6',
          dark: '#6b7280',
          fairy: '#f472b6',
          fighting: '#ef4444',
          ghost: '#a855f7',
          steel: '#94a3b8',
          flying: '#93c5fd',
          poison: '#a855f7',
          ground: '#d97706',
          rock: '#a16207',
          bug: '#84cc16',
          normal: '#d1d5db',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
