---
agent: agent
description: Update an existing Playwright test file when a website documentation markdown file has changed
---

# Update Website Example Tests

Given a markdown filename (e.g. `generate-a-qr-code-from-user-input.md`), update the matching
`@website`-tagged spec file in `xmlui/tests-e2e/` so it reflects the current set of named
`xmlui-pg` codefences in that file.

Use this prompt when:
- Examples have been added or removed from an existing article
- An example's `name` attribute has changed
- An example's content has changed enough that existing tests need to be rewritten

For brand-new articles with no spec file yet, use `#add-website-example-tests` instead.

## Before starting

Read these files to understand the conventions:
- `xmlui/src/testing/website-example-utils.ts` — `getExampleSource`, `extractXmluiExample`
- `xmlui/tests-e2e/how-to-examples/add-a-dropdown-menu-to-a-button.spec.ts` — canonical reference spec

## Step 1 — Locate both files

**Markdown file** lives anywhere under:
```
website/content/docs/pages/
```
(including subdirectories like `howto/`, `styles-and-themes/`, etc. — but never under `reference/`)

**Spec file** location mirrors the markdown subdirectory:

| Markdown location | Spec location |
|-------------------|---------------|
| `pages/howto/<name>.md` | `tests-e2e/how-to-examples/<name>.spec.ts` |
| `pages/<name>.md` | `tests-e2e/pages/<name>.spec.ts` |
| `pages/<subdir>/<name>.md` | `tests-e2e/pages/<subdir>/<name>.spec.ts` |

Read both files in full before proceeding.

## Step 2 — Inventory the markdown

Scan the markdown for every codefence whose opening line starts with ` ```xmlui-pg `.

For each codefence, record:
- Whether it has a `name="..."` attribute
- Its name value if present
- Whether it is **interactive** (body contains an event handler attribute like `onClick`, `onChange`,
  `onSubmit`, etc., a `---api` section, or any of these interactive components: `NavLink`,
  `Select`, `ToneSwitch`) or **display-only**

**If any codefences have no `name` attribute**, stop and report them to the user:

```
The following xmlui-pg codefences in <filename> have no name attribute and cannot be tested yet:

  - Codefence at line <N>: (first line of content: "<preview>")
  - ...

Add a name="..." attribute to each before continuing.
```

Do NOT generate fallback names. The name must come from the markdown file itself.

## Step 2b — Validate all `---api` sections

For every codefence that contains a `---api` section, extract the text between `---api` and the next `---` (or end of codefence) and attempt to parse it as JSON.

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

**If any `---api` section is not valid JSON**, stop immediately and report every affected example to the user. Do NOT work around the problem by hardcoding app markup or constructing the `apiInterceptor` manually:

```
The following examples in <filename> have a `---api` section that `extractXmluiExample`
cannot parse, so tests cannot be generated or updated for them yet:

  - "<example name>" (line <N>): <reason, e.g. "multiline string literal in JSON" or
    "---api content is not a JSON object">
  - ...

Please fix the `---api` section(s) in the markdown file so they contain valid JSON
before running this prompt again.
```

Only proceed once every `---api` section in the file is valid JSON.

## Step 3 — Inventory the spec file

Collect every `test.describe("...")` title from the existing spec file. These are the names
currently being tested.

## Step 4 — Compute the diff

Compare the two name sets:

| Situation | Action |
|-----------|--------|
| Name exists in markdown **and** spec | **Keep** — do not modify unless the example content changed (see Step 5) |
| Name exists in markdown but **not** in spec | **Add** — write a new `test.describe` block |
| Name exists in spec but **not** in markdown | **Remove** — delete the entire `test.describe` block |

**Possible renames**: if the counts of added and removed names are equal (e.g., 1 removed + 1
added), the example may have been renamed rather than replaced. Report this to the user before
acting:

```
It looks like the following examples may have been renamed:

  - Removed: "<old name>"
  - Added:   "<new name>"

If this is a rename, the existing tests can be preserved by updating the describe title and
the extractXmluiExample call. Should I treat this as a rename, or as an unrelated removal
and addition?
```

Wait for confirmation before proceeding on renames.

## Step 5 — Apply changes

Make only the changes identified in Step 4. Do not touch describe blocks that are unchanged.

### Adding a new describe block

Insert a new `test.describe` block at the position matching the example's order in the markdown.

For **interactive** examples, follow the full template:

```typescript
test.describe("<example name>", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "<example name>");

  test("<describe what the initial state looks like>", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // assertions
  });

  // more tests…
});
```

For **display-only** examples (no event handlers, no `---api`), write only an initial-state test:

```typescript
// display-only example — no interaction to test
test.describe("<example name>", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "<example name>");

  test("renders the initial state", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // assert key visible elements
  });
});
```

### Removing a stale describe block

Delete the entire `test.describe(...)` block including its closing `});`.

### Updating a renamed example

Change only:
1. The `test.describe("…")` title string
2. The `extractXmluiExample(markdown, "…")` name argument

Preserve all existing test cases inside the block. If the example content also changed
substantially, rewrite the test assertions to match the new content.

### Updating changed content

If a kept example's content changed (new interactive elements, different initial state, altered
API), update the affected test assertions. Do not rewrite tests that are still valid.

If a kept example changed from interactive to display-only (or vice versa), rewrite the block
accordingly and update the `// display-only example` comment.

## Test writing rules

**For interactive examples, always include:**
- An "initial state" test — assert the rendered output before any interaction
- One test per interactive element (button, input, checkbox, radio, select, etc.) that changes
  visible state

**Locator and assertion rules (from testing conventions):**
- Use `page.getByRole()` and `page.getByText()` — avoid CSS selectors
- Use `expect.poll()` for state assertions driven by async events
- Never use `waitForTimeout()`
- Assert `toBeFocused()` before keyboard interactions
- For API-backed examples, the `apiInterceptor` from `extractXmluiExample` wires the mock
  automatically — just pass it to `initTestBed`

If you cannot determine what meaningful assertions to write for a given new interactive example
from reading its source alone, output a `test.todo` placeholder and note what information is needed.

## Step 6 — Verify

Check for TypeScript errors in the updated file. Confirm:
- `getExampleSource` is still called once at module level, not inside a describe/test callback
- Every describe block (old and new) has `{ tag: "@website" }`
- Example names in `extractXmluiExample` match the markdown exactly (copy-paste, do not paraphrase)
- No stale describe blocks remain for names no longer in the markdown
- Display-only blocks have the `// display-only example — no interaction to test` comment
- Import paths use the correct depth for the spec file's location

## Step 7 — Run and fix

Run the updated spec file and fix any failures before finishing.

```bash
# Single worker for easy debugging
npx playwright test <spec-file> --workers=1 --reporter=line

# Parallel stability check before committing
npx playwright test <spec-file> --workers=10
```

**Common failures to watch for:**
- **Strict-mode violations** (`resolved to N elements`): use `{ exact: true }` or a more
  specific locator.
- **Locator not found**: the rendered text differs from the data in the markdown (e.g. truncation,
  formatting). Inspect the page snapshot in the error output to find the actual text.
- **Timing issues**: wrap intermittent assertions in `expect.poll()` rather than adding
  `waitForTimeout()`.

Re-run after each fix until all tests pass.
