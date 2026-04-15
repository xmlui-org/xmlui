---
agent: agent
description: Refactor core XMLUI framework code
---

# Refactor $subject$

Refactor $subject$ so the result:
- has fewer lines than the original where possible
- can be read linearly without hopping between files
- has the right density of comments (not verbose, not absent)

## Before starting

Read `feature.md` at the repo root — it describes the subject, goals, files in scope, and any decisions already made.

## Reference docs by subsystem

Load only the docs that apply to the files being refactored:

| Subsystem | Files | Docs to read |
|---|---|---|
| Component rendering pipeline | `components-core/rendering/` | `xmlui/dev-docs/standalone-app.md` |
| State/container management | `components-core/containers/` | `xmlui/dev-docs/containers.md` |
| Theming / CSS | `components-core/theming/` | `xmlui/dev-docs/theming-styling.md` |
| Individual components | `components/ComponentName/` | `.ai/xmlui/components/metadata.md`, `.ai/xmlui/components/renderer.md`, `.ai/xmlui/components/native.md` |
| Parsers | `parsers/` | `xmlui/dev-docs/standalone-app.md` |
| Form infrastructure | `components/Form*/` | `xmlui/dev-docs/form-infrastructure.md` |
| Data / API operations | `components/APICall/`, `components/DataSource/` | `xmlui/dev-docs/data-operations.md` |
| User-defined components | `components-core/ud-components/` | `xmlui/dev-docs/ud-components.md` |

Always read the E2E testing conventions: `.ai/xmlui/testing/e2e.md`

## Planning

Analyze the current source code. Collect findings into a concise report sufficient for a human or AI to carry out the refactoring. Break the work into sequential steps, each small enough to verify with tests.

Record findings and the step-by-step plan in `feature.md` at the repo root (under a "Refactor Plan" section). Keep it concise — no executive summaries, no estimates.

## Refactor Flow

Assume all unit tests and E2E tests pass at the start.

For each step:
1. Implement the change.
2. Verify no TypeScript/lint errors (Problems pane in VS Code).
3. Add or update unit/E2E tests that cover the change.
4. Confirm new tests pass.
5. If applicable, run the full test suite for the affected component.
6. Update the step's status in `feature.md`.
7. Ask for approval before proceeding to the next step.

## Commands

Run all commands from the workspace root (`/Users/dotneteer/source/xmlui`):

```bash
# Type-check without full build (fast)
npx tsc --noEmit -p xmlui/tsconfig.json

# Unit tests (fast, ~40s for all)
npm run test:unit -w xmlui

# E2E — single component (fast feedback)
npx playwright test ComponentName.spec.ts --reporter=line

# E2E — stability check (run before declaring done)
npx playwright test ComponentName.spec.ts --workers=10

# Full build (slow, ~2 min — use only when no other way to verify)
npm run build:xmlui-standalone -w xmlui
```

**Never run all E2E tests without user confirmation** — it takes ~10 minutes.
