/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--v2-brand-primary)",
          "primary-hover": "var(--v2-brand-primary-hover)",
          "primary-active": "var(--v2-brand-primary-active)",
          "primary-foreground": "var(--v2-brand-primary-foreground)",
          secondary: "var(--v2-brand-secondary)",
          "secondary-hover": "var(--v2-brand-secondary-hover)",
          "secondary-active": "var(--v2-brand-secondary-active)",
          "secondary-foreground": "var(--v2-brand-secondary-foreground)"
        },
        surface: {
          app: "var(--v2-surface-app)",
          base: "var(--v2-surface-base)",
          elevated: "var(--v2-surface-elevated)",
          muted: "var(--v2-surface-muted)",
          sunken: "var(--v2-surface-sunken)",
          input: "var(--v2-surface-input)",
          inverse: "var(--v2-surface-inverse)"
        },
        text: {
          primary: "var(--v2-text-primary)",
          secondary: "var(--v2-text-secondary)",
          muted: "var(--v2-text-muted)",
          inverse: "var(--v2-text-inverse)",
          link: "var(--v2-text-link)"
        },
        status: {
          success: "var(--v2-status-success)",
          "success-bg": "var(--v2-status-success-bg)",
          warning: "var(--v2-status-warning)",
          "warning-bg": "var(--v2-status-warning-bg)",
          error: "var(--v2-status-error)",
          "error-bg": "var(--v2-status-error-bg)",
          info: "var(--v2-status-info)",
          "info-bg": "var(--v2-status-info-bg)"
        }
      }
    }
  },
  plugins: []
};
