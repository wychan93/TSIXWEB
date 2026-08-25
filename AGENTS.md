# Repository Guide

## Structure
- This is a dependency-free single-page site: `index.html` loads root-level `style.css` and deferred `script.js`; there is no build step, package manifest, test suite, formatter, or CI configuration.
- Section IDs in `index.html` are the navigation contract for header, footer, and CTA hash links. Keep links and IDs synchronized when sections change.
- `script.js` depends directly on `#site-header`, `#nav-menu`, `.menu`, `.hero`, `.stage`, `.browser`, and `.reveal`; renaming or removing those selectors requires updating the script.
- Portfolio images are local files under `assets/`; keep explicit `width` and `height` attributes on content images to prevent layout shift.

## Responsive And Motion Behavior
- Mobile navigation switches at `760px` in CSS and in JavaScript's `matchMedia` query; change both sides together.
- Preserve the menu state contract: `.open` controls the panel, `body.menu-open` locks scrolling, `inert` removes hidden/background content from focus order, and the button's label and `aria-expanded` reflect state.
- Mobile navigation is usable without JavaScript because the base CSS leaves links visible; only `.js #nav-menu` becomes the off-canvas panel.
- Reveal content is visible by default and hidden only under `.js`; JavaScript applies `.is-revealed`, while `.hero-ready` starts the short hero entrance. Reduced-motion CSS restores all final states and stops decorative animation.
- Responsive layouts have explicit breakpoints at `1024px`, `900px` (tablet hero only), `760px`, and `480px`; verify both sides of each boundary.

## Verification
- Load `index.html` directly in a browser; all runtime resources are local and relative.
- There are no automated checks. Use `node --check script.js` for JavaScript syntax.
- Before finishing interaction or layout changes, verify keyboard-only mobile navigation (including Escape and focus return), every hash link, no-JavaScript content, scroll reveals, fine-pointer effects, 200% zoom, short landscape screens, `prefers-reduced-motion: reduce`, and forced colors.
