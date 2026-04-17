---
agent: agent
description: Audit an existing component for conventions, accessibility, and test coverage
---

# QA Review a Component

## Before starting

1. Read `feature.md` at the repo root — if it specifies which component to review and any focus areas.
2. Read `guidelines.md` at the repo root — all topic sections are relevant for a QA review.
3. Read these reference files:
   - `.ai/xmlui/components/qa-checklist.md` — the primary QA checklist (always, this drives the review)
   - `.ai/xmlui/component-architecture.md` — two-file pattern, metadata, renderer, native (always)
   - `.ai/xmlui/wrapcomponent.md` — wrapComponent config API (if component uses wrapComponent)
   - `.ai/xmlui/theming-styling.md` — CSS variables, SCSS conventions (visual components)
   - `.ai/xmlui/behaviors.md` — behavior attachment rules (always)
   - `.ai/xmlui/form-infrastructure.md` — form integration (form-related components)
   - `.ai/xmlui/option-components.md` — option pattern (Select, AutoComplete, RadioGroup)
   - `.ai/xmlui/testing-conventions.md` — E2E and unit test patterns (always)
   - `.ai/xmlui/accessibility.md` — accessibility audit checklist (always)
   - `.ai/xmlui/error-handling.md` — error boundary patterns (always)
4. Read the component's full source:
   - `ComponentName.tsx` — metadata and renderer
   - `ComponentNameNative.tsx` — React implementation
   - `ComponentName.module.scss` — styles
   - `ComponentName.spec.ts` — existing tests

## Review workflow

### Step 1 — File structure audit

From `.ai/xmlui/components/qa-checklist.md` § 1:
- [ ] No `index.ts` in the component folder
- [ ] Correct file naming pattern
- [ ] Single-file for non-visual, dual-file for complex components

### Step 2 — Metadata audit

From `.ai/xmlui/components/qa-checklist.md` § 2:
- [ ] All props, events, APIs, contextVars, themeVars declared
- [ ] `defaultValue` references `defaultProps.<prop>`, never a literal
- [ ] Event helpers match `lookupEventHandler()` strings
- [ ] `themeVars: parseScssVar(styles.themeVars)` present for visual components
- [ ] `parts` declared for multi-element components
- [ ] `nonVisual: true` for non-visual components

### Step 3 — Renderer audit

From `.ai/xmlui/components/qa-checklist.md` § 3:
- [ ] No React hooks in the renderer
- [ ] All props extracted with correct `extractValue.*` calls
- [ ] Events wired with `lookupEventHandler`
- [ ] `style={layoutCss}` passed to the native component
- [ ] No defaults applied in the renderer (native handles defaults)

### Step 4 — Native component audit

From `.ai/xmlui/components/qa-checklist.md` § 4+:
- [ ] `forwardRef` + `memo` used
- [ ] `defaultProps` exported and used for defaults
- [ ] No `useImperativeHandle` (use `registerComponentApi`)
- [ ] `updateState` called when state changes
- [ ] Cleanup in `useEffect` returns

### Step 5 — Theming and styling audit

- [ ] SCSS module follows naming conventions from `.ai/xmlui/components/styling.md`
- [ ] Theme variables use `createThemeVar` pattern
- [ ] `:export { themeVars }` block present
- [ ] No hardcoded colors or sizes that should be theme variables

### Step 6 — Accessibility audit

From `.ai/xmlui/accessibility.md`:
- [ ] Semantic HTML elements used where possible
- [ ] ARIA roles and states correct
- [ ] Keyboard navigation works (Tab, Enter/Space, Escape)
- [ ] Focus indicator visible
- [ ] `aria-label` on elements without visible text

### Step 7 — Test coverage audit

- [ ] E2E tests exist for all props, events, and user interactions
- [ ] `test.describe("Accessibility")` block present
- [ ] Tests pass with `--workers=10`
- [ ] No flaky patterns (missing `toBeFocused()` before keyboard, missing `toBeVisible()` waits)

### Step 8 — Report findings

Produce a concise report:
```
## QA Report: ComponentName

### Findings
1. [ISSUE] Description — severity (critical/moderate/low)
2. [OK] Area — passes review

### Recommended fixes
1. Fix description — file and location
```

### Step 9 — Apply fixes (when requested)

If the user wants fixes applied:
1. Fix each issue one at a time
2. Verify after each fix (TypeScript errors, test pass)
3. Run full component tests after all fixes
4. Add a changeset if any fix changes public behavior

## Commands

```bash
# Run component tests
npx playwright test ComponentName.spec.ts --reporter=line

# Parallel stability
npx playwright test ComponentName.spec.ts --workers=10

# Type-check
npx tsc --noEmit -p xmlui/tsconfig.json
```
