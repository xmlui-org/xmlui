---
agent: agent
description: Review a component's source code against QA conventions and fix the issues found
---

# Review and Fix a Component

## Before starting

1. Read `guidelines.md` at the repo root — focus on Topics 4–5 (component architecture), 7 (theming/SCSS), 9 (behaviors), 23 (testing), 24 (accessibility).
2. Read these reference files:
   - `.ai/xmlui/components/qa-checklist.md` — primary checklist driving this entire review (always)
   - `.ai/xmlui/component-architecture.md` — two-file pattern, metadata, renderer, native (always)
   - `.ai/xmlui/wrapcomponent.md` — wrapComponent config API (if component uses wrapComponent)
   - `.ai/xmlui/theming-styling.md` — CSS variables, SCSS conventions (visual components)
   - `.ai/xmlui/behaviors.md` — behavior attachment rules (always)
   - `.ai/xmlui/accessibility.md` — ARIA, keyboard nav, per-component audit (always)
   - `.ai/xmlui/testing-conventions.md` — E2E and unit test patterns (always)
   - `.ai/xmlui/form-infrastructure.md` — form integration (form components only)
   - `.ai/xmlui/option-components.md` — option pattern (Select, AutoComplete, RadioGroup only)
3. Read the component's full source:
   - `ComponentName.tsx` — metadata and renderer
   - `ComponentNameNative.tsx` or `ComponentNameReact.tsx` — React implementation
   - `ComponentName.module.scss` — styles (if present)
   - `ComponentName.spec.ts` — existing E2E tests (read, do not modify content)
   - Any unit test files under `xmlui/tests/` for this component (read, do not modify content)

## Implementation steps

### Step 1 — Full source audit

Run the complete `.ai/xmlui/components/qa-checklist.md` checklist against all component files.
Produce a structured findings report covering all 9 sections:

1. File Structure
2. Metadata
3. Renderer
4. Native Component (structure, refs, props interface, classnames, state & effects)
5. SCSS / Theming
6. Parts & Accessibility
7. E2E Tests
8. Types & Linting
9. Registration

For each finding, record:
- **Section** (number and name from the checklist)
- **File** where the issue appears
- **Issue** — one sentence describing the violation
- **Fix** — one sentence describing the required change

Mark the `*Native.tsx` → `*React.tsx` rename as a dedicated File Structure finding if it applies.

### Step 2 — Present findings and request approval

**Stop here.** Show the user the complete findings report before making any changes.
Ask: "Do you approve these changes? Are there any items you want to skip or adjust?"

Wait for explicit user approval before proceeding. Incorporate any feedback.

### Step 3 — Rename Native → React (if applicable)

If the implementation file is named `ComponentNameNative.tsx`:

1. Search `xmlui/src/` for **every** file that imports `ComponentNameNative` (not just the co-located metadata file).
2. Rename the file: `ComponentNameNative.tsx` → `ComponentNameReact.tsx`.
3. Update all import paths found in step 3.1 — this includes the metadata file, any barrel files, and the component registry.
4. **Do not rename** any import references inside test files (`.spec.ts`, `.test.ts`), **unless** the test file itself imports the implementation file by name — update only those import path strings, not test logic.
5. Verify the rename with a final grep: no remaining references to `ComponentNameNative` should exist outside test assertion strings.

### Step 4 — Apply approved fixes

Apply all other approved fixes from the findings report in dependency order:

- Registration fixes before renderer fixes.
- Props interface fixes before classnames/ref fixes.
- SCSS variable fixes before metadata `defaultThemeVars` fixes.
- Accessibility fixes last (they may depend on structural changes).

Rules while editing:
- Do **not** alter E2E test files (`*.spec.ts`) or unit test files (`*.test.ts`, `xmlui/tests/**`) beyond import path corrections from the rename in Step 3.
- Do **not** add, remove, or reword test assertions.
- Do **not** introduce new abstractions, helpers, or features beyond what the checklist requires.

### Step 5 — Lint and type check

After all edits, run:

```bash
cd xmlui && npx tsc --noEmit
```

Fix every TypeScript error before proceeding. Repeat until the output is clean.

### Step 6 — Run tests

Run the component's tests:

```bash
# Unit tests (if any exist under xmlui/tests/)
npx vitest run --reporter=verbose <ComponentName>

# E2E tests
npx playwright test --grep <ComponentName>
```

All tests must pass. If a test fails:
- Investigate whether the failure is caused by a bug introduced during this review's fixes.
- Fix the regression without changing test assertions.
- If a pre-existing test was already broken before this review, report it to the user and do not attempt to fix it silently.

### Step 7 — Propose QA checklist improvements (if any)

If during the review you encountered patterns, anti-patterns, or edge cases not covered by `.ai/xmlui/components/qa-checklist.md`, propose additions or corrections:

- List each proposed change with the target section, the exact text to add/modify, and the rationale.
- **Do not edit** `.ai/xmlui/components/qa-checklist.md` until the user explicitly approves.
- If the user approves, apply the updates to the checklist file.

### Step 8 — Final checklist sign-off

Re-run the full qa-checklist mentally and confirm every approved item is resolved. Report any items that could not be fixed and why.

### Step 9 — Update component review tracker

Update [xmlui/src/components/component-review.md](../../../../xmlui/src/components/component-review.md):
- Find the component in the appropriate table (core or extension package)
- Change its status from `⏳` to `✅`
- Example: `| Button | ✅ |`

## Commands

```bash
# Type check
cd xmlui && npx tsc --noEmit

# Run unit tests for a specific component
cd xmlui && npx vitest run --reporter=verbose <ComponentName>

# Run E2E tests for a specific component (run from workspace root)
npx playwright test xmlui/src/components/<ComponentName>/<ComponentName>.spec.ts --reporter=line

# Run the style-spec E2E tests if present
npx playwright test xmlui/src/components/<ComponentName>/<ComponentName>-style.spec.ts --reporter=line

# Verify no remaining Native imports after rename
grep -r "ComponentNameNative" xmlui/src/
```

## Key warnings / Absolute rules

- **Always get user approval** before making any file changes (Step 2 is a hard gate).
- **Never modify test logic** — only import path strings may change due to the Native→React rename.
- **No new features** — only fix what the checklist identifies as a violation.
- **Rename only after grepping all importers** — a partial rename silently breaks the build.
- **No linting errors allowed** — TypeScript must pass `--noEmit` before declaring done.
- **All tests must pass** — a regression introduced by this review is a blocker, not acceptable technical debt.
