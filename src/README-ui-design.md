UI Design System: Quick Start

- Purpose: Establish a global, consistent UI language across the app using tokens and CSS variables.
- What this adds:
  - A design tokens file (src/design-system/tokens.json) with colors, typography, spacing, radii, shadows, and breakpoints.
  - A global stylesheet (src/styles/global.css) that defines CSS variables and a dark theme variant.
- How to use:
  - Import src/styles/global.css in your main entry file.
  - Use CSS variables in components, e.g. color: var(--color-text); padding: var(--space-4).
- Next steps:
  1. Replace hard-coded colors with tokens in components.
  2. Wire a theme toggle to switch data-theme on the root element.
  3. Extend tokens for components (buttons, inputs, cards, etc.).
