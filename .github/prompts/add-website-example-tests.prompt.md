---
agent: agent
description: Create a Playwright test file for a website documentation markdown file
---

# Add Website Example Tests

Given a markdown filename (e.g. `generate-a-qr-code-from-user-input.md`), create a `@website`-tagged
test file in `xmlui/tests-e2e/` that covers every named `xmlui-pg` codefence in that file.

## Before starting

Read these files to understand the conventions:
- `xmlui/src/testing/website-example-utils.ts` — `getExampleSource`, `extractXmluiExample`
- `xmlui/tests-e2e/generate-a-qr-code-from-user-input.spec.ts` — canonical example of the target format
- `xmlui/tests-e2e/markup.spec.ts` — example with multiple `test.describe` blocks in one file

## Step 1 — Locate the markdown file

The markdown files live under:
```
website/content/docs/pages/
```

Resolve the full path from the provided filename and read the file.

## Step 2 — Discover all xmlui-pg codefences

Scan the markdown for every codefence whose opening line starts with ` ```xmlui-pg `.

For each codefence, record:
- Whether it has a `name="..."` attribute
- Its name value if present

**If any codefences have no `name` attribute**, stop and report them to the user:

```
The following xmlui-pg codefences in <filename> have no name attribute and cannot be tested yet:

  - Codefence at line <N>: (first line of content: "<preview>")
  - ...

Add a name="..." attribute to each before continuing.
```

Do NOT generate fallback names like `"example-1"`. The name must come from the markdown file itself.

Only proceed once every codefence that should be tested has a name.

## Step 3 — Create the spec file

Create `xmlui/tests-e2e/<markdown-filename-without-extension>.spec.ts`.

Follow this template exactly:

```typescript
import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/<relative-path-from-pages>/<filename>.md"),
);

test.describe("<example name>", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "<example name>");

  test("<describe what the initial state looks like>", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // assertions
  });

  // more tests…
});

// Repeat test.describe for each named codefence in the file
```

Rules:
- One `test.describe` per named codefence. The describe title = the codefence's `name` value exactly.
- Every `test.describe` must include `{ tag: "@website" }`.
- Read the markdown file once at module level with `getExampleSource`; call `extractXmluiExample` inside each describe block.
- If the markdown file is not directly under `website/content/docs/pages/` but in a subdirectory (e.g. `howto/`), use the correct relative path in `path.join`.

## Step 4 — Write meaningful tests

For each `test.describe` block, write tests that exercise the example's interactive behaviour.

**For each example, always include:**
- An "initial state" test — assert the rendered output before any interaction
- One test per interactive element (button, input, checkbox, radio, select, etc.) that changes visible state

**Test writing rules (from testing conventions):**
- Use `page.getByRole()` and `page.getByText()` — avoid CSS selectors
- Use `expect.poll()` for state assertions driven by async events
- Never use `waitForTimeout()`
- Assert `toBeFocused()` before keyboard interactions
- For API-backed examples, the `apiInterceptor` from `extractXmluiExample` wires the mock automatically — just pass it to `initTestBed`

If you cannot determine what meaningful assertions to write for a given example from reading its source alone, output a `test.todo` placeholder and note what information is needed.

## Step 5 — Verify

Check for TypeScript errors in the new file. Confirm:
- `getExampleSource` is called once at the top level, not inside a describe/test callback
- Every describe block has `{ tag: "@website" }`
- Example names in `extractXmluiExample` match the markdown exactly (copy-paste, do not paraphrase)
- Import paths use `../src/testing/...` (one level up from `tests-e2e/`)
- The markdown path uses `../../website/content/...` (two levels up)

## Step 6 — Run and fix the tests

Run the newly created spec file and fix any failures before finishing.

**Common failures to watch for:**
- **Strict-mode violations** (`resolved to N elements`): `getByText('X')` matches a substring in other visible text. Use `{ exact: true }` or a more specific locator such as `page.getByText('X', { exact: true })` or `page.locator('…').getByText('X')`.
- **Locator not found**: the rendered text differs from the data in the markdown (e.g. truncation, formatting). Inspect the page snapshot in the error output to find the actual text.
- **Timing issues**: if an assertion fails intermittently, wrap it in `expect.poll()` rather than adding `waitForTimeout()`.

Re-run the tests after each fix until all pass.
