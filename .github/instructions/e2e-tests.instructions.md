---
applyTo: "**/*.spec.ts"
---

# XMLUI E2E Test Rules

These rules apply whenever editing Playwright test files (`.spec.ts`).

## Reference documentation

| Topic | AI Doc |
|-------|--------|
| E2E & unit test patterns | `.ai/xmlui/testing-conventions.md` |
| Detailed E2E conventions | `.ai/xmlui/testing/e2e.md` |
| Accessibility testing | `.ai/xmlui/accessibility.md` |

Verified rules: `guidelines.md` at the repo root (Topics 23, 24).

## Critical patterns

- **Always `toBeFocused()` before keyboard presses** — the #1 cause of flaky tests
- **Use `expect.poll()` for state assertions** — never `waitForTimeout()`
- **Prefer `getByRole()` and `getByTestId()`** over CSS selectors
- **Run `--workers=10` before committing** — tests that pass at `--workers=1` but fail at 10 have a race condition
- **Include `test.describe("Accessibility")`** in every interactive component spec

## Event testing pattern

```typescript
test("fires event", async ({ initTestBed, page }) => {
  await initTestBed(`<Component onEvent="{setState('key', 'value')}" />`);
  // trigger the event
  await expect.poll(() => page.evaluate(() => window.testState?.key)).toBe("value");
});
```

## Key prohibitions

- Do NOT use `{ delay: N }` for keyboard input — find the correct `toBeFocused()` assertion
- Do NOT use `waitForTimeout()` — use `toBeVisible()`, `toBeFocused()`, or `expect.poll()`
- Do NOT use CSS pseudo-class selectors (`:focus`, `:hover`) — they don't work in Playwright

## Prompt files

- **Add E2E tests**: use `#add-e2e-tests`
- **Fix a bug with regression test**: use `#fix-bug`
