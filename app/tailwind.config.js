/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--v2-brand-primary) / <alpha-value>)',
          hover: 'rgb(var(--v2-brand-primary-hover) / <alpha-value>)',
          active: 'rgb(var(--v2-brand-primary-active) / <alpha-value>)',
          foreground: 'rgb(var(--v2-brand-primary-foreground) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'rgb(var(--v2-brand-secondary) / <alpha-value>)',
          hover: 'rgb(var(--v2-brand-secondary-hover) / <alpha-value>)',
          active: 'rgb(var(--v2-brand-secondary-active) / <alpha-value>)',
          foreground: 'rgb(var(--v2-brand-secondary-foreground) / <alpha-value>)'
        },
        surface: {
          app: 'rgb(var(--v2-surface-app-bg) / <alpha-value>)',
          base: 'rgb(var(--v2-surface-base) / <alpha-value>)',
          elevated: 'rgb(var(--v2-surface-elevated) / <alpha-value>)',
          muted: 'rgb(var(--v2-surface-muted) / <alpha-value>)',
          sunken: 'rgb(var(--v2-surface-sunken) / <alpha-value>)',
          input: 'rgb(var(--v2-surface-input) / <alpha-value>)',
          inverse: 'rgb(var(--v2-surface-inverse) / <alpha-value>)'
        },
        text: {
          primary: 'rgb(var(--v2-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--v2-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--v2-text-muted) / <alpha-value>)',
          inverse: 'rgb(var(--v2-text-inverse) / <alpha-value>)',
          link: 'rgb(var(--v2-text-link) / <alpha-value>)'
        },
        status: {
          success: 'rgb(var(--v2-status-success) / <alpha-value>)',
          'success-bg': 'rgb(var(--v2-status-success-bg) / <alpha-value>)',
          warning: 'rgb(var(--v2-status-warning) / <alpha-value>)',
          'warning-bg': 'rgb(var(--v2-status-warning-bg) / <alpha-value>)',
          error: 'rgb(var(--v2-status-error) / <alpha-value>)',
          'error-bg': 'rgb(var(--v2-status-error-bg) / <alpha-value>)',
          info: 'rgb(var(--v2-status-info) / <alpha-value>)',
          'info-bg': 'rgb(var(--v2-status-info-bg) / <alpha-value>)'
        },
        project: {
          blue: 'rgb(var(--v2-project-blue) / <alpha-value>)',
          green: 'rgb(var(--v2-project-green) / <alpha-value>)',
          orange: 'rgb(var(--v2-project-orange) / <alpha-value>)',
          purple: 'rgb(var(--v2-project-purple) / <alpha-value>)',
          red: 'rgb(var(--v2-project-red) / <alpha-value>)',
          pink: 'rgb(var(--v2-project-pink) / <alpha-value>)',
          teal: 'rgb(var(--v2-project-teal) / <alpha-value>)',
          indigo: 'rgb(var(--v2-project-indigo) / <alpha-value>)'
        }
      },
      borderRadius: {
        sm: 'var(--v2-radius-sm)',
        md: 'var(--v2-radius-md)',
        lg: 'var(--v2-radius-lg)',
        xl: 'var(--v2-radius-xl)',
        full: 'var(--v2-radius-full)'
      },
      boxShadow: {
        xs: 'var(--v2-shadow-xs)',
        sm: 'var(--v2-shadow-sm)',
        md: 'var(--v2-shadow-md)',
        lg: 'var(--v2-shadow-lg)',
        xl: 'var(--v2-shadow-xl)'
      },
      spacing: {
        xs: 'var(--v2-space-xs)',
        sm: 'var(--v2-space-sm)',
        md: 'var(--v2-space-md)',
        lg: 'var(--v2-space-lg)',
        xl: 'var(--v2-space-xl)',
        '2xl': 'var(--v2-space-2xl)',
        '3xl': 'var(--v2-space-3xl)'
      }
    }
  },
  plugins: []
};
