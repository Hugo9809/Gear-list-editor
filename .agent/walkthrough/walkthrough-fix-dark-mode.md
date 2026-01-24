
# Walkthrough - Dark Mode Revamp

The user requested a fix for the "horrible" dark mode.
The root cause was identified as poor contrast: the Primary Brand color (`0 21 137` / Deep Blue) was being used on a Dark Background (`11 16 32` / Navy), making elements invisible or muddy.

## Changes

### `app/src/index.css`

I completely overhauled the `:root[data-theme='dark']` configuration with a "Premium Midnight" palette.

#### 1. Surfaces
Switched to a cohesive Slate-based dark palette for better depth:
- **App Background**: `Slate-950` (`#020617`) - Deepest layer.
- **Base Surface**: `Slate-900` (`#0f172a`) - Sidebar/Cards.
- **Elevated**: `Slate-800` (`#1e293b`) - Modals/Dropdowns.

#### 2. Brand Colors (Vibrancy)
Replaced the invisible Deep Blue with **Electric Blue** (`Blue-400` / `#60a5fa`).
- This ensures high contrast against the dark background.
- Added a hover state (`Blue-300`) and active state (`Blue-500`).
- Changed button text color to **Dark Navy** (`Slate-900`) when on the bright blue button for 7:1+ contrast (Accessibility).

#### 3. Typography
Updated text colors to use the Slate scale (`Slate-100`, `Slate-400`, `Slate-500`) which provides a clean, neutral read against the blue-tinted dark background.

#### 4. Project Identity
Brightened all project tag colors (Green, Orange, Pink, etc.) to their "400" or "PASTEL" series so they glow against the dark theme rather than looking muddy.

## Verification Result
- **Previous State**: Unusable (Dark text on Dark bg).
- **New State**: High contrast, "Cyberpunk/Professional" aesthetic, highly legible.
