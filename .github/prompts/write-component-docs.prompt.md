---
agent: agent
description: Write or update hand-written component documentation for the docs website
---

# Write Component Documentation

## Before starting

1. Read `feature.md` at the repo root — if it specifies which component to document and any focus areas.
2. Read these reference files:
   - `.ai/xmlui/doc-generation.md` — how the doc pipeline works (always)
   - `.ai/xmlui/component-architecture.md` — understand the component's API structure (always)
3. Read the component's metadata:
   - `xmlui/src/components/ComponentName/ComponentName.tsx` — props, events, APIs, context vars
4. Check existing docs:
   - `website/content/docs/components/ComponentName/ComponentName.md` — may already exist
   - `website/content/docs/pages/components/ComponentName.mdx` — generated output (do NOT edit this)

## Implementation steps

### Step 1 — Create the description file

Create or update `website/content/docs/components/ComponentName/ComponentName.md`:

```markdown
The ComponentName component [brief description of purpose and when to use it].

## Usage

[Show the simplest possible example that demonstrates the core functionality]

<ComponentName prop="value">
  Content
</ComponentName>

## [Feature section]

[For each major feature, show a focused example with brief explanation]

## Related components

- [RelatedComponent](/docs/components/RelatedComponent) — how they work together
```

### Step 2 — Write focused examples

Each example should:
- Demonstrate one concept at a time
- Use realistic but minimal markup
- Show the output (describe what the user sees)
- Not duplicate the auto-generated props table

### Step 3 — Per-prop and per-event descriptions

If any prop or event in `createMetadata()` has a generic or missing `description`, update the metadata description string directly in `ComponentName.tsx`. These descriptions flow into the auto-generated tables.

### Step 4 — Generate and verify

```bash
# Build metadata and generate docs
npm run generate-all-docs -w xmlui

# Check the generated output
cat website/content/docs/pages/components/ComponentName.mdx
```

Verify:
- Description appears at the top
- Props/events/APIs tables are generated correctly
- Examples render (if the docs site is running)

### Step 5 — Add a changeset (if metadata descriptions were changed)

If you modified `description` strings in `createMetadata()`:
```yaml
---
"xmlui": patch
---
Improve documentation for ComponentName
```

## What NOT to do

- Do NOT edit files in `website/content/docs/pages/` — they are auto-generated
- Do NOT duplicate the props table in the description file — it is auto-generated
- Do NOT write implementation details — focus on usage and examples
- Do NOT include screenshots — use live examples in the docs site

## Commands

```bash
# Generate docs
npm run generate-all-docs -w xmlui

# Build metadata only
npm run build:xmlui-metadata -w xmlui

# Generate docs only (after metadata is built)
npm run generate-docs -w xmlui
```
