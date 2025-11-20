import type { Config } from 'tailwindcss';

const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['variant', '&:is(.dark *)'],
  theme: {
    extend: {
      colors: {
        studio: {
          header: 'var(--studio-header-bg)',
          sidebar: {
            bg: 'var(--studio-sidebar-bg)',
            border: 'var(--studio-sidebar-border)',
          },
          primary: {
            DEFAULT: 'var(--studio-primary)',
            hover: 'var(--studio-primary-hover)',
            border: 'var(--studio-card-border)',
          },
          card: {
            bg: 'var(--studio-card-bg)',
            border: 'var(--studio-card-border)',
            accent: 'var(--studio-card-accent)',
          },
          status: {
            running: 'var(--studio-status-running)',
            stopped: 'var(--studio-status-stopped)',
            pending: 'var(--studio-status-pending)',
            error: 'var(--studio-status-error)',
          },
          tag: {
            bg: 'var(--studio-tag-bg)',
            text: 'var(--studio-tag-text)',
            selectedBg: 'var(--studio-tag-selected-bg)',
            selectedText: 'var(--studio-tag-selected-text)',
          },
        },
      },
      borderRadius: {
        sharp: '2px',
        studio: '4px',
      },
      backgroundImage: {
        'studio-header-gradient':
          'linear-gradient(90deg, var(--studio-header-gradient-from), var(--studio-header-gradient-to))',
        'studio-button':
          'linear-gradient(135deg, var(--studio-button-gradient-from), var(--studio-button-gradient-to))',
        'studio-button-dark':
          'linear-gradient(135deg, var(--studio-button-dark-from), var(--studio-button-dark-to))',
      },
      boxShadow: {
        'studio-card': 'var(--studio-card-hover-shadow)',
      },
    },
  },
} satisfies Config;

export default config;
