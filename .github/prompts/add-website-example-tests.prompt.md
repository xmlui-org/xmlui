---
agent: agent
description: Create a Playwright test file for a website documentation markdown file
---

# Add Website Example Tests

Given a markdown filename (e.g. `generate-a-qr-code-from-user-input.md`), create a `@website`-tagged
test file in `xmlui/tests-e2e/` that covers every named eligible `xmlui-pg` codefence in that file.

## Before starting

Read these files to understand the conventions:
- `xmlui/src/testing/website-example-utils.ts` — `getExampleSource`, `extractXmluiExample`
- `xmlui/tests-e2e/how-to-examples/add-a-dropdown-menu-to-a-button.spec.ts` — canonical reference spec
- `xmlui/tests-e2e/how-to-examples/align-items-to-row-ends-with-spacefiller.spec.ts` — example with multiple `test.describe` blocks

## Step 1 — Locate the markdown file

The markdown files live anywhere under:
```
website/content/docs/pages/
```
(including subdirectories like `howto/`, `styles-and-themes/`, etc. — but never under `reference/`)

Resolve the full path from the provided filename and read the file.

## Step 2 — Discover eligible xmlui-pg codefences

Scan the markdown for every codefence whose opening line starts with ` ```xmlui-pg `.

Ignore any `xmlui-pg` codefence whose opening fence appears between a `<pre>` tag and its matching
`</pre>` tag. Those are documentation literals and must not generate tests.

For each codefence, record:
- Whether it has a `name="..."` attribute and its value if present
- Whether it has an `id="..."` attribute and its value if present

**If any codefences have no `name` attribute**, stop and report them to the user:

```
The following xmlui-pg codefences in <filename> have no name attribute and cannot be tested yet:

  - Codefence at line <N>: (first line of content: "<preview>")
  - ...

Add a name="..." attribute to each before continuing.
```

Do NOT generate fallback names like `"example-1"`. The name must come from the markdown file itself.

**If any codefences have a `name` but no `id` attribute**, you must add an `id` attribute to each codefence before writing tests. The `id` should be a slug derived from the `name` using these rules:
- Convert to lowercase
- Replace spaces with hyphens
- Remove or replace any characters not in `[a-z0-9-]`
- Collapse multiple consecutive hyphens into a single hyphen

Examples: `"A literal property"` → `id="a-literal-property"`, `"Declaring a variable with <variable>"` → `id="declaring-a-variable-with-variable"`

Only proceed once every eligible codefence has both a `name` and an `id` attribute.

## Step 2b — Validate all `---api` sections

For every eligible codefence that contains a `---api` section, extract the text between `---api` and the next `---` (or end of codefence) and attempt to parse it as JSON.

If parsing fails because of multiline JSON string literals (most commonly the `initialize` field containing raw newlines), normalize that markdown `---api` JSON first by rewriting those string values to a single-line JSON string. Then parse again.

Example normalization:

Before (invalid JSON):
```json
{
  "apiUrl": "/api",
  "initialize": "$state.items = [
    { id: 1, name: 'Anna', active: true }
  ]",
  "operations": {}
}
```

After (valid JSON):
```json
{
  "apiUrl": "/api",
  "initialize": "$state.items = [{ id: 1, name: 'Anna', active: true }]",
  "operations": {}
}
```

A valid `---api` section is a single JSON object matching the `ApiInterceptorDefinition` shape:
```json
{
  "apiUrl": "...",
  "initialize": "...",
  "operations": { ... }
}
```

**Invalid forms include (but are not limited to):**
- Strings with embedded literal newlines (e.g. `"initialize": "$state.x = [\n  ...\n]"`) — `JSON.parse` rejects bare newlines inside string values
- Non-JSON preamble lines such as `POST /route\n---\n{body}`
- Any other content that causes `JSON.parse` to throw

Do NOT work around invalid JSON by duplicating the source example inside the spec file (for example, hardcoding app markup or manually constructing `apiInterceptor`). Tests must use `extractXmluiExample`.

**If any `---api` section is still not valid JSON after normalization**, do not duplicate source code. Instead, create a placeholder failing test for each affected example so the gap is visible in CI:

```
test("TODO: fix invalid ---api JSON for <example name>", async () => {
  expect(
    "Invalid ---api JSON in <filename> for <example name>; fix markdown before enabling this test"
  ).toBe("");
});
```

Also report every affected example to the user:

```
The following examples in <filename> still have a `---api` section that `extractXmluiExample`
cannot parse after JSON normalization:

  - "<example name>" (line <N>): <reason, e.g. "multiline string literal in JSON" or
    "---api content is not a JSON object">
  - ...

Please fix the `---api` section(s) in the markdown file so they contain valid JSON
and then replace the placeholder failing test(s).
```

## Step 3 — Determine the spec file path

Spec files mirror the markdown's subdirectory relative to `website/content/docs/pages/`, placed
under `xmlui/tests-e2e/`, with one renaming convention:

| Markdown location | Spec location |
|-------------------|---------------|
| `pages/howto/<name>.md` | `tests-e2e/how-to-examples/<name>.spec.ts` |
| `pages/<name>.md` | `tests-e2e/pages/<name>.spec.ts` |
| `pages/<subdir>/<name>.md` | `tests-e2e/pages/<subdir>/<name>.spec.ts` |

Create the spec file at the path determined above. Follow this template exactly:

```typescript
import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/<relative-path-from-pages>/<filename>.md"),
);

test.describe("<example name>", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "<example id>");

  test("<describe what the initial state looks like>", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // assertions
  });

  // more tests…
});

// Repeat test.describe for each named codefence in the file
```

Import path depth depends on spec location:
- `tests-e2e/how-to-examples/` → `../../src/testing/...` and `../../../website/...`
- `tests-e2e/pages/` → `../../src/testing/...` and `../../../website/...`
- `tests-e2e/pages/<subdir>/` → `../../../src/testing/...` and `../../../../website/...`

Rules:
- One `test.describe` per named eligible codefence. The describe title = the codefence's `name` value exactly (for human readability).
- The `extractXmluiExample` second argument = the codefence's `id` value (for stable lookup, resilient to name changes).
- Every `test.describe` must include `{ tag: "@website" }`.
- Read the markdown file once at module level with `getExampleSource`; call `extractXmluiExample` inside each describe block.
- Never copy-paste the original example markup or API JSON into the spec file.

## Step 4 — Write meaningful tests

For each `test.describe` block, write tests that exercise the example's interactive behaviour.

**Classify each example first:**

- **Interactive** — the codefence body contains an event handler attribute (`onClick`, `onChange`,
  `onSubmit`, etc.), a `---api` section, or any of these interactive components: `NavLink`,
  `Select`, `ToneSwitch`. Write a full test suite.
- **Display-only** — none of the above. Write only an initial-state test and add a
  comment `// display-only example — no interaction to test` above the describe block.

**For interactive examples, always include:**
- An "initial state" test — assert the rendered output before any interaction
- One test per interactive element (button, input, checkbox, radio, select, etc.) that changes visible state

**Test writing rules (from testing conventions):**
- Use `page.getByRole()` and `page.getByText()` — avoid CSS selectors
- Use `expect.poll()` for state assertions driven by async events
- Never use `waitForTimeout()`
- Assert `toBeFocused()` before keyboard interactions
- For API-backed examples, the `apiInterceptor` from `extractXmluiExample` wires the mock automatically — just pass it to `initTestBed`

If you cannot determine what meaningful assertions to write for a given eligible example from reading its source alone, output a `test.todo` placeholder and note what information is needed.

## Step 5 — Verify

Check for TypeScript errors in the new file. Confirm:
- `getExampleSource` is called once at the top level, not inside a describe/test callback
- Every describe block has `{ tag: "@website" }`
- The first argument to `extractXmluiExample` is the `id` value from the markdown codefence (not the `name` string) — copy-paste the exact id value
- Example names in describe titles match the markdown exactly (copy-paste, do not paraphrase)
- Import paths use the correct depth for the spec file's location (see Step 3 path table)
- Display-only examples have the `// display-only example — no interaction to test` comment

## Step 6 — Run and fix the tests

Run the newly created spec file from the `xmlui/` directory and fix any failures before finishing.

```bash
# Single worker for easy debugging (run from xmlui/)
npm run test:e2e-website-examples -- tests-e2e/pages/<name>.spec.ts --workers=1 --reporter=line

# Parallel stability check before committing
npm run test:e2e-website-examples -- tests-e2e/pages/<name>.spec.ts --workers=10
```

For specs under `how-to-examples/`, replace the path accordingly:
```bash
npm run test:e2e-website-examples -- tests-e2e/how-to-examples/<name>.spec.ts --workers=1 --reporter=line
```

**Common failures to watch for:**
- **Strict-mode violations** (`resolved to N elements`): `getByText('X')` matches a substring in other visible text. Use `{ exact: true }` or a more specific locator such as `page.getByText('X', { exact: true })` or `page.locator('…').getByText('X')`.
- **Locator not found**: the rendered text differs from the data in the markdown (e.g. truncation, formatting). Inspect the page snapshot in the error output to find the actual text.
- **Timing issues**: if an assertion fails intermittently, wrap it in `expect.poll()` rather than adding `waitForTimeout()`.

Re-run the tests after each fix until all pass.
