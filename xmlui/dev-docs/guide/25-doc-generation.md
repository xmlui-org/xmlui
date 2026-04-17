# 25. Documentation Generation

## Why This Matters

The XMLUI documentation website is not hand-written page by page. Component reference pages — props tables, events, APIs, context variables, theme variables, and behavior attachments — are all auto-generated from the same `createMetadata()` declarations that power the framework at runtime. Understanding this pipeline is essential when adding new components, extension packages, or when the generated output looks wrong.

---

## The Big Picture

Every XMLUI component declares its API through `createMetadata()` in its `ComponentName.tsx` file. When you run the doc generation pipeline, these metadata declarations are compiled into a single JavaScript bundle, then a Node.js script reads that bundle and produces `.mdx` pages for the documentation website.

```
ComponentName.tsx  →  createMetadata()
                          ↓
                   build:xmlui-metadata
                          ↓
              dist/metadata/xmlui-metadata.js
                          ↓
                   generate-docs (Node.js)
                          ↓
         website/content/docs/pages/components/*.mdx
```

The hand-written parts — component descriptions, usage examples, conceptual explanations — live in `website/content/docs/` as plain Markdown files. The generator merges these with the auto-generated metadata tables to produce the final `.mdx` pages.

---

## Running the Pipeline

From the `xmlui/` workspace:

```bash
# Full pipeline: compile metadata → generate docs → generate summaries
npm run generate-all-docs

# Or step by step:
npm run build:xmlui-metadata         # Step 1: compile metadata from source
npm run generate-docs                # Step 2: generate .mdx pages
npm run generate-docs-summaries      # Step 3: generate overview pages
```

From the monorepo root (via Turborepo):

```bash
npm run generate-docs
```

Additional generation scripts:

```bash
npm run export-themes -w xmlui                    # Theme variable reference files
npm run generate-context-vars-summary -w xmlui     # Cross-component context variable summary
```

---

## Pipeline Architecture

### Entry point: `get-docs.mjs`

This is the main script. It:

1. Imports compiled metadata from `dist/metadata/xmlui-metadata.js`
2. Partitions components: standard XMLUI components vs. HTML-tag wrappers (excluded)
3. Instantiates `DocsGenerator` for core components
4. Loads extension package configs and dynamically imports their metadata
5. Generates extension package documentation

### `DocsGenerator`

Responsible for:

- **Filtering** components by status (e.g., excluding `"in progress"` and `"deprecated"`)
- **Expanding** component data: computing display names, resolving description file paths, handling `specializedFrom` relationships (where one component inherits from another)
- **Delegating** to `MetadataProcessor` for actual file generation

### `MetadataProcessor`

The workhorse. For each component it:

1. Reads the hand-written description file from `website/content/docs/`
2. Generates metadata tables for props, events, APIs, context variables
3. Evaluates which behaviors can attach to the component (using `canBehaviorAttachToComponent()`)
4. Generates theme variable tables from SCSS data
5. Writes the combined `.mdx` output

### Configuration files

**`components-config.json`** controls which components are included:

```json
{
  "excludeComponentStatuses": ["in progress", "deprecated"],
  "cleanFolder": true
}
```

Valid component statuses: `internal`, `experimental`, `stable`, `deprecated`. Only `stable` and `experimental` components appear in the generated docs by default.

**`extensions-config.json`** controls which extension packages are documented:

```json
{
  "includeByName": ["xmlui-animations", "xmlui-recharts", "xmlui-tiptap-editor", ...],
  "excludeByName": []
}
```

---

## What Gets Generated

For each component, the generator produces an `.mdx` page containing:

| Section | Source | Description |
|---------|--------|-------------|
| Title and status badges | `metadata.displayName`, `metadata.status` | Component name, deprecation warnings, experimental disclaimers |
| Description | Hand-written `.md` file | Preserved verbatim from `website/content/docs/` |
| Props table | `metadata.props` | Auto-generated: name, type, available values, default, description |
| Events table | `metadata.events` | Auto-generated: name, description |
| API methods | `metadata.apis` | Auto-generated: name, signature, description |
| Context variables | `metadata.contextVars` | Auto-generated: name, type, description |
| Theme variables | SCSS `parseScssVar` output | Auto-generated: variable name, default value |
| Behaviors | `canBehaviorAttachToComponent()` evaluation | Lists which behaviors auto-attach |

### Navigation structure

The generator also writes `website/navSections/components.json`, which drives the sidebar navigation on the docs website. `build-pages-map.mjs` scans all generated pages and produces link constants for cross-referencing between articles.

---

## Writing Description Files: `%-` Directives

Each component has a hand-written `.md` file alongside its source code (e.g., `xmlui/src/components/Button/Button.md`). This file contains prose descriptions and code examples. The generator extracts sections from it using **`%-` directives** — simple START/END markers that the processor matches by regex.

The general form is:

```
%-<SECTION>-START [optional-name]
... content ...
%-<SECTION>-END
```

### Supported directives

| Directive | Name argument | Injected into |
|-----------|--------------|--------------|
| `%-DESC-START` / `%-DESC-END` | none | Top of the component page, before the props table |
| `%-PROP-START propName` / `%-PROP-END` | required | Below the auto-generated row for that prop |
| `%-EVENT-START eventName` / `%-EVENT-END` | required | Below the auto-generated row for that event |
| `%-API-START methodName` / `%-API-END` | required | Below the auto-generated row for that API method |
| `%-PART-START partName` / `%-PART-END` | required | Below the auto-generated row for that part |
| `%-STYLE-START` / `%-STYLE-END` | none | Styling/theme variables section |
| `%-CONTEXT_VAR-START varName` / `%-CONTEXT_VAR-END` | required | Below the context variable row |
| `%-IMPORT-START` / `%-IMPORT-END` | none | MDX import declarations at the top of the file |
| `%-META …` (single line) | n/a | Stripped from output entirely — internal notes only |

### Example layout

```md
%-DESC-START

`Button` triggers actions when clicked. Supports icons, labels, and multiple visual variants.

```xmlui-pg copy display name="Example: basic usage"
<App>
  <Button label="Save" />
</App>
```

%-DESC-END

%-PROP-START label

Sets the visible text shown inside the button.

```xmlui-pg copy display name="Example: label"
<App>
  <Button label="I am the label" />
  <Button label="With icon" icon="save" />
</App>
```

%-PROP-END

%-EVENT-START click

Fires when the button is clicked.

%-EVENT-END
```

### Important rules

- `%-PROP-START` and `%-EVENT-START` **require** the name argument. Omitting it is an error.
- Matching is case-insensitive and whitespace around section content is trimmed.
- `%-META` lines are stripped silently; they're useful for author notes that should not appear in docs.
- Never put directive markers inside code blocks — the regex can't distinguish them.

---

## Adding a New Component to the Docs

1. **Complete the metadata** — ensure `createMetadata()` in `ComponentName.tsx` has all props, events, APIs, context variables, and theme variables declared
2. **Set the status** — use `status: "stable"` or `"experimental"`. Components with `"in progress"` status are excluded from generation
3. **Write the description file** — create `website/content/docs/components/ComponentName/ComponentName.md` with a human-readable description and usage examples
4. **Run the pipeline** — `npm run generate-all-docs -w xmlui`
5. **Verify** — check the generated `.mdx` in `website/content/docs/pages/components/`

### Specialized components

If your component is a specialization of another (e.g., `PasswordBox` specializes `TextBox`), set `specializedFrom: "TextBox"` in metadata. The generator will:
- Place the docs in the parent component's folder
- Add a "specialized from" link at the top of the page

---

## Adding an Extension Package to the Docs

1. Add the package name to `extensions-config.json` → `includeByName`
2. Build the extension: `npm run build -w packages/xmlui-<name>`
3. Create description files in `website/content/docs/extensions/<package-name>/`
4. Run `npm run generate-all-docs -w xmlui`
5. Verify output in `website/content/docs/pages/extensions/`

---

## Supporting Scripts

### `create-theme-files.mjs`

Generates per-component theme variable reference files. Reads `collectedThemes` and `collectedComponentMetadata` from the compiled metadata, then writes one file per component listing all its theme variables with their default values.

### `generate-context-vars-summary.mjs`

Collects all context variables across all components and generates a single summary page. Groups variables by name and lists which components expose each one. Useful for finding all components that provide `$data`, `$error`, etc.

### `build-pages-map.mjs`

Scans the `website/content/docs/pages/` directory tree, extracts article IDs from Markdown headings (both explicit `[#id]` and auto-generated), and writes a JavaScript file of `export const` link constants. These enable type-safe cross-references between documentation articles.

### `generate-summary-files.mjs`

Currently a stub that generates overview pages. The actual summary generation for components is handled by `DocsGenerator`.

---

## Error Handling

The generation pipeline uses a structured error handling approach:

- **Fatal errors** (missing metadata bundle, broken config) halt the pipeline via `handleFatalError()`
- **Non-fatal errors** (missing description file, unresolved component) are logged as warnings and skipped
- **Validation** via `validateDependencies()` checks that required inputs exist before processing

The `logger.mjs` module provides leveled logging (`info`, `warning`, `error`). Set log levels at the top of each script.

---

## Key Takeaways

- Component docs are generated from the same `createMetadata()` that the framework uses at runtime — there is a single source of truth
- Never hand-edit files in `website/content/docs/pages/` — they are overwritten on every generation run
- The pipeline must be run after any metadata change: `npm run generate-all-docs -w xmlui`
- Component status controls visibility: only `stable` and `experimental` components appear in generated docs
- Hand-written descriptions in `website/content/docs/` are merged with auto-generated tables — write descriptions there, not in the generated output
- Extension package documentation follows the same pattern but is controlled by `extensions-config.json`
