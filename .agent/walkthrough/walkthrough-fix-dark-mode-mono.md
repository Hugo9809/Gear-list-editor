
# Walkthrough - Neutral Dark Mode

The user requested to remove the "blue" tint from the backgrounds and switch to a strict "Dark Gray / Black" and "White Text" aesthetic.

## Changes

### `app/src/index.css`

I completely replaced the `:root[data-theme='dark']` configuration with a **Neutral Zinc Monochrome** palette.

#### 1. Black & Gray Surfaces
Removed all saturation (blue tint) from the background colors:
- **App Background**: `Pure Black` (`#000000`).
- **Sidebar/Base**: `Zinc-900` (`#18181b`) - Very dark gray.
- **Cards/Elevated**: `Zinc-800` (`#27272a`).

#### 2. High Contrast Text
- **Primary Text**: `Pure White` (`#ffffff`) - Ensures maximum contrast against the black/gray background.
- **Secondary Text**: `Zinc-400` (`#a1a1aa`) - Neutral gray for subtitles, no blue tint.

#### 3. Accents
- Kept the **Electric Blue** (`Blue-400`) *only* for interactive elements (Buttons, Links, Focus rings) to maintain brand identity without coloring the entire interface.

## Verification Result
- **Result**: The app now features a modern, clean, monochromatic dark mode with stark contrast, satisfying the "Dark Gray/Black with White Text" requirement.
