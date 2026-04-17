---
agent: agent
description: Diagnose and fix a component bug with regression tests
---

# Fix a Bug

## Before starting

1. Read `feature.md` at the repo root — it describes the bug, affected component, and reproduction steps (if any).
2. Read `guidelines.md` at the repo root — focus on rules from Topics 4, 17, 23.
3. Read the affected component's source:
   - `xmlui/src/components/ComponentName/ComponentName.tsx` — metadata and renderer
   - `xmlui/src/components/ComponentName/ComponentNameNative.tsx` — React implementation
   - `xmlui/src/components/ComponentName/ComponentName.spec.ts` — existing tests
4. Read docs relevant to the bug's domain:
   - `.ai/xmlui/component-architecture.md` — always, to understand the component structure
   - `.ai/xmlui/error-handling.md` — if the bug involves error states or ErrorBoundary
   - `.ai/xmlui/inspector-debugging.md` — if the bug needs trace-level debugging
   - `.ai/xmlui/testing-conventions.md` — for writing the regression test
   - `.ai/xmlui/behaviors.md` — if the bug involves behaviors (form, validation, tooltip, etc.)
   - `.ai/xmlui/container-state.md` — if the bug involves state management
   - `.ai/xmlui/rendering-pipeline.md` — if the bug involves rendering order or lifecycle

## Diagnosis workflow

### Step 1 — Reproduce

If the user provided reproduction markup:
1. Create a test case using `initTestBed` with the provided markup
2. Run it to confirm the failure:
```bash
npx playwright test ComponentName.spec.ts -g "regression test name" --reporter=line
```

If no reproduction was provided:
1. Read the component source to understand the expected behavior
2. Write a minimal `initTestBed` test that demonstrates the issue
3. Confirm it fails

### Step 2 — Diagnose

Trace through the component code to identify the root cause:
1. Check the renderer (`ComponentName.tsx`): Is the prop being extracted correctly? Is the event handler wired?
2. Check the native component (`ComponentNameNative.tsx`): Is the logic correct? Are React hooks used properly?
3. Check the SCSS (`ComponentName.module.scss`): Is the styling applied correctly?
4. If the bug involves state: check `updateState` calls and container reducer flow
5. If the bug involves behaviors: check whether `shouldApply()` returns the right value

### Step 3 — Fix

Apply the minimal change needed to fix the issue. Do not refactor surrounding code unless it is directly related to the bug.

### Step 4 — Write regression test

Add a test in `ComponentName.spec.ts` that:
1. Reproduces the original bug scenario
2. Verifies the fix
3. Test name should describe the issue, e.g., `"does not crash when value is undefined"`

```typescript
test("does not <describe the bug>", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName ...reproduction markup.../>`);
  // Assert the correct behavior
});
```

### Step 5 — Verify stability

```bash
# Run the component's full test suite
npx playwright test ComponentName.spec.ts --reporter=line

# Verify parallel stability
npx playwright test ComponentName.spec.ts --workers=10
```

### Step 6 — Add a changeset

Create `.changeset/<unique-name>.md`:
```yaml
---
"xmlui": patch
---
Fix: <brief description of the bug fix>
```
Verify: `npx changeset status`

## Commands

```bash
# Run specific test
npx playwright test ComponentName.spec.ts -g "test name" --reporter=line

# Run all component tests
npx playwright test ComponentName.spec.ts --reporter=line

# Parallel stability check
npx playwright test ComponentName.spec.ts --workers=10

# Unit tests (if relevant)
npm run test:unit -w xmlui

# Type-check
npx tsc --noEmit -p xmlui/tsconfig.json
```

## Key warnings

- Fix the bug, not the symptoms — understand the root cause before applying changes
- Do not refactor code unrelated to the bug
- Always write a regression test — the fix is not complete without one
- Never run all E2E tests without user confirmation
