import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px rgba(168, 85, 247, 0.4)',
      },
      backgroundImage: {
        'gradient-purple-cyan': 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
        'gradient-dark': 'linear-gradient(180deg, #090909 0%, #0a0a0a 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
