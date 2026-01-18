---
name: ui-ux-design-patterns
description: UI/UX design patterns for web applications. Accessibility, interaction, performance, responsive layout, and visual quality checks. Use when designing UI, reviewing components, or checking for UX issues.
---

# UI/UX Design Patterns

Design guide for web applications. Contains accessibility rules, interaction patterns, performance guidelines, and visual quality checks.

## When to Apply

- Designing new UI components or pages
- Reviewing code for UX issues
- Building views or modals
- Implementing accessibility requirements

## Rule Categories by Priority

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Accessibility | CRITICAL |
| 2 | Touch & Interaction | CRITICAL |
| 3 | Performance | HIGH |
| 4 | Layout & Responsive | HIGH |
| 5 | Typography & Color | MEDIUM |
| 6 | Animation | MEDIUM |

---

## 1. Accessibility (CRITICAL)

- **Color Contrast**: Minimum 4.5:1 ratio for normal text.
- **Focus States**: Visible focus rings on all interactive elements. NEVER set `outline: none` without a high-contrast alternative.
- **Alt Text**: Descriptive `alt` text for meaningful images.
- **ARIA Labels**: `aria-label` for icon-only buttons.
- **Keyboard Navigation**: Tab order matches visual order.
- **Form Labels**: Every `<input>` must have an associated `<label>`.

```css
/* ❌ BAD */
button:focus { outline: none; }

/* ✅ GOOD */
button:focus { 
  outline: 2px solid var(--v2-brand-primary); 
  outline-offset: 2px; 
}
```

---

## 2. Touch & Interaction (CRITICAL)

- **Touch Target Size**: Minimum 44x44px touch targets on mobile.
- **Hover vs Tap**: Use `click`/`tap` for primary interactions, not hover alone.
- **Loading Buttons**: Disable button during async operations.
- **Error Feedback**: Clear error messages near the problem.
- **Cursor Pointer**: Add `cursor: pointer` to all clickable elements.

```css
.clickable-card {
  cursor: pointer;
  transition: background-color var(--v2-transition-fast);
}
.clickable-card:hover {
  background-color: var(--v2-surface-muted);
}
```

---

## 3. Performance (HIGH)

- **Image Optimization**: Use WebP, `srcset`, lazy loading.
- **Reduced Motion**: Check `prefers-reduced-motion`.
- **Content Jumping**: Reserve space for async content (skeleton loaders).

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 4. Layout & Responsive (HIGH)

- **Viewport Meta**: `width=device-width, initial-scale=1`.
- **Readable Font Size**: Minimum 16px body text on mobile.
- **Horizontal Scroll**: Ensure content fits viewport width.
- **Z-Index Scale**: Use defined scale (`--v2-z-dropdown`, `--v2-z-modal`, etc.).

---

## 5. Typography & Color (MEDIUM)

- **Line Height**: Use 1.5-1.75 for body text (`--v2-line-height-normal`).
- **Line Length**: Limit to 65-75 characters per line.
- **Use CSS Variables**: Always use `var(--v2-brand-primary)`, never hardcoded hex.

---

## 6. Animation (MEDIUM)

- **Duration**: Use 150-300ms for micro-interactions (`--v2-transition-fast`).
- **Transform Only**: Use `transform`/`opacity`, not `width`/`height`.
- **Loading States**: Skeleton screens or spinners for async content.

```css
.button {
  transition: background-color var(--v2-transition-fast), 
              transform var(--v2-transition-fast);
}
.button:active {
  transform: scale(0.98);
}
```

---

## Pre-Delivery Checklist

### Visual Quality
- [ ] All icons are SVGs (no emojis as UI icons).
- [ ] Hover states don't cause layout shift.
- [ ] Uses CSS variables (not hardcoded colors).

### Interaction
- [ ] All clickable elements have `cursor: pointer`.
- [ ] Hover states provide clear visual feedback.
- [ ] Transitions are smooth (150-300ms).
- [ ] Focus states visible for keyboard navigation.

### Theme Support
- [ ] Works in Light, Dark, and Pink modes.
- [ ] Text has sufficient contrast in all modes.
- [ ] Borders visible in all themes.

### Layout
- [ ] No content hidden behind fixed headers.
- [ ] Responsive at 375px, 768px, 1024px, 1440px.
- [ ] No horizontal scroll on mobile.

### Accessibility
- [ ] All images have `alt` text.
- [ ] Form inputs have labels.
- [ ] Color is not the only indicator.
- [ ] `prefers-reduced-motion` respected.
