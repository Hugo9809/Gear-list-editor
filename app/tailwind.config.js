/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--v2-theme-brand)',
          hover: 'var(--v2-theme-brand-hover)',
          active: 'var(--v2-theme-brand-active)',
          foreground: 'var(--v2-theme-brand-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--v2-theme-secondary)',
          hover: 'var(--v2-theme-secondary-hover)',
          active: 'var(--v2-theme-secondary-active)',
          foreground: 'var(--v2-theme-secondary-foreground)'
        },
        surface: {
          app: 'var(--v2-theme-surface-app-bg)',
          base: 'var(--v2-theme-surface-base)',
          elevated: 'var(--v2-theme-surface-elevated)',
          muted: 'var(--v2-theme-surface-muted)',
          sunken: 'var(--v2-theme-surface-sunken)',
          input: 'var(--v2-theme-surface-input)',
          inverse: 'var(--v2-theme-surface-inverse)'
        },
        text: {
          primary: 'var(--v2-theme-text-primary)',
          secondary: 'var(--v2-theme-text-secondary)',
          muted: 'var(--v2-theme-text-muted)',
          inverse: 'var(--v2-theme-text-inverse)',
          link: 'var(--v2-theme-text-link)'
        },
        status: {
          success: 'var(--v2-theme-status-success)',
          'success-bg': 'var(--v2-theme-status-success-bg)',
          warning: 'var(--v2-theme-status-warning)',
          'warning-bg': 'var(--v2-theme-status-warning-bg)',
          error: 'var(--v2-theme-status-error)',
          'error-bg': 'var(--v2-theme-status-error-bg)',
          info: 'var(--v2-theme-status-info)',
          'info-bg': 'var(--v2-theme-status-info-bg)'
        },
        palette: {
          blue: 'var(--v2-palette-blue)',
          green: 'var(--v2-palette-green)',
          orange: 'var(--v2-palette-orange)',
          purple: 'var(--v2-palette-purple)',
          red: 'var(--v2-palette-red)',
          pink: 'var(--v2-palette-pink)',
          teal: 'var(--v2-palette-teal)',
          indigo: 'var(--v2-palette-indigo)'
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
