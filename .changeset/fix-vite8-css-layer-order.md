---
"xmlui": patch
---

Fix CSS @layer cascade order being inverted under Vite 8 / Rolldown. Per-module CSS chunks (e.g. one containing only `@layer components { ... }`) could be loaded before the main entry CSS, causing the browser to derive a wrong layer order in which `components` ranked lower than `base`. This made the CSS reset (transparent background on `button`) override component styles like `Button` solid-primary background. The xmlui build pipeline now declares the canonical layer order (`reset, base, components, themes, dynamic`) inline at the top of every generated `index.html` and prepends it to every emitted CSS asset, guaranteeing a deterministic cascade regardless of chunk load order.
