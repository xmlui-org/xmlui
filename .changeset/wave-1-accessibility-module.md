---
"xmlui": patch
---

Wave 1 — Accessibility module Phase 1: linter + ComponentMetadata a11y block

Adds `components-core/accessibility/` with `A11yDiagnostic` type, `A11yCode` union, and `lintComponentDef()` implementing seven Phase 1 rules: `missing-accessible-name`, `icon-only-button-no-label`, `modal-no-title`, `form-input-no-label`, `duplicate-landmark`, `redundant-aria-role`, and `missing-skip-link` (stub). Adds the `a11y` block to `ComponentMetadata` for ARIA role, accessible name prop declarations, and landmark metadata. Documents `"a11y"` XsLog kind in `inspectorUtils.ts` and `strictAccessibility` global in `standalone.ts`. See `dev-docs/plans/05-enforced-accessibility.md`.
