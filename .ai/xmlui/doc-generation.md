# XMLUI Documentation Generation — AI Reference

How the docs website content is auto-generated from component metadata. For contributors modifying or extending the generation pipeline.

---

## Overview

The documentation website (`website/`) is populated by auto-generated pages derived from component metadata. The generation pipeline lives in `xmlui/scripts/generate-docs/`. It reads the compiled metadata from `xmlui/dist/metadata/`, merges it with hand-written `.md` description files, and writes `.mdx` pages into `website/content/docs/`.

---

## Pipeline

```
createMetadata() in Component.tsx
        ↓
  npm run build:xmlui-metadata     →  xmlui/dist/metadata/xmlui-metadata.js
        ↓
  npm run generate-docs            →  node scripts/generate-docs/get-docs.mjs
        ↓
  DocsGenerator + MetadataProcessor
        ↓
  website/content/docs/pages/components/*.mdx   (component reference pages)
  website/content/docs/pages/extensions/*.mdx   (extension package pages)
  website/navSections/components.json           (navigation structure)
```

---

## Key Files

| File | Role |
|------|------|
| `get-docs.mjs` | Entry point — loads metadata, partitions by `isHtmlTag`, generates component + extension docs |
| `DocsGenerator.mjs` | Filters metadata by status, expands component data (display name, folder path, description refs), delegates to `MetadataProcessor` |
| `MetadataProcessor.mjs` | Reads hand-written `.md` files from `website/content/docs/`, injects metadata tables (props, events, APIs, context vars, theme vars, behaviors), writes `.mdx` output |
| `constants.mjs` | All magic strings: component states, file extensions, folder names, section names, table headers |
| `folders.mjs` | Path constants: `script`, `xmluiDist`, `projectRoot`, `docsRoot`, `navSections` |
| `components-config.json` | Config: which component statuses to exclude (default: `"in progress"`, `"deprecated"`), `cleanFolder` flag |
| `extensions-config.json` | Config: which extension packages to include/exclude by name |
| `pattern-utilities.mjs` | Shared iteration, file writing, export generation utilities |
| `build-pages-map.mjs` | Scans `website/content/docs/pages/` and generates a link-constant file for cross-references |
| `create-theme-files.mjs` | Generates per-component theme variable reference files |
| `generate-context-vars-summary.mjs` | Generates a summary page of all context variables across all components |
| `error-handling.mjs` | `withErrorHandling`, `handleNonFatalError`, `handleFatalError`, `validateDependencies` |
| `logger.mjs` | Leveled logging: `LOGGER_LEVELS.info`, `.warning`, `.error` |

---

## Commands

```bash
# Full pipeline: build metadata → generate docs → generate summaries
npm run generate-all-docs -w xmlui

# Individual steps
npm run build:xmlui-metadata -w xmlui     # compile metadata JS from source
npm run generate-docs -w xmlui            # run DocsGenerator + MetadataProcessor
npm run generate-docs-summaries -w xmlui  # generate summary/overview files
npm run export-themes -w xmlui            # generate theme variable files
npm run generate-context-vars-summary -w xmlui  # generate context vars summary

# From monorepo root (via Turborepo)
npm run generate-docs
```

---

## Metadata Flow

Component metadata declared via `createMetadata()` in `ComponentName.tsx` is compiled into `xmlui/dist/metadata/xmlui-metadata.js`. The generator imports this at runtime:

```javascript
import { collectedComponentMetadata } from "../../dist/metadata/xmlui-metadata.js";
```

### Partitioning

`get-docs.mjs` partitions metadata into:
- **Components** — entries where `isHtmlTag !== true` (standard XMLUI components)
- **HTML-tag components** — entries where `isHtmlTag === true` (excluded from doc generation)

### Filtering by status

`components-config.json` controls which statuses are excluded:
```json
{ "excludeComponentStatuses": ["in progress", "deprecated"] }
```

Valid statuses: `internal`, `experimental`, `stable`, `deprecated`

### Extension packages

`extensions-config.json` lists which packages to include:
```json
{
  "includeByName": ["xmlui-animations", "xmlui-recharts", ...],
  "excludeByName": []
}
```

Extension metadata is loaded dynamically from each package's `dist/metadata/` directory.

---

## MetadataProcessor Output Sections

For each component, the processor injects these sections into the `.mdx` file:

| Section | Source | Output |
|---------|--------|--------|
| Description | Hand-written `.md` in `website/content/docs/` | Preserved as-is |
| Props table | `metadata.props` | Markdown table: Name, Type, Default, Description |
| Events table | `metadata.events` | Markdown table: Name, Description |
| API table | `metadata.apis` | Markdown table: Name, Signature, Description |
| Context variables | `metadata.contextVars` | Markdown table: Name, Type, Description |
| Theme variables | `metadata.themeVars` via SCSS `parseScssVar` | Markdown table: Variable, Default |
| Behaviors | `collectedBehaviorMetadata` | Auto-evaluated via `canBehaviorAttachToComponent()` |

### Hand-written description files

Each component's prose lives in a `.md` file alongside its source code (e.g., `xmlui/src/components/Button/Button.md`). The generator reads these and merges the content into the generated `.mdx` page.

The files use **`%-` directives** as section markers. The processor extracts content between matched `START`/`END` pairs by regex (case-insensitive); content is trimmed of leading/trailing blank lines before injection.

| Directive | Name arg | Purpose |
|-----------|----------|---------|
| `%-DESC-START` … `%-DESC-END` | none | Main description text, primary usage examples |
| `%-PROP-START propName` … `%-PROP-END` | required | Per-property documentation and examples |
| `%-EVENT-START eventName` … `%-EVENT-END` | required | Per-event documentation |
| `%-API-START methodName` … `%-API-END` | required | Per-API-method documentation |
| `%-PART-START partName` … `%-PART-END` | required | Per-part documentation |
| `%-STYLE-START` … `%-STYLE-END` | none | Styling and theme variable usage notes |
| `%-CONTEXT_VAR-START varName` … `%-CONTEXT_VAR-END` | required | Per-context-variable documentation |
| `%-IMPORT-START` … `%-IMPORT-END` | none | MDX import statements injected into the generated file |
| `%-META …` (single line) | n/a | Internal annotation — stripped from output, not included |

```md
%-DESC-START

`Button` triggers actions when clicked.

```xmlui-pg copy display name="Example: basic"
<App>
  <Button label="Click me" />
</App>
```

%-DESC-END

%-PROP-START label

Sets the visible text of the button.

```xmlui-pg copy display name="Example: label"
<App>
  <Button label="I am the label" />
</App>
```

%-PROP-END
```

Rules enforced by `acceptSection()`:
- `%-PROP-START` without a name → error (name required)
- `%-EVENT-START` without a name → error (name required)
- All other directives allow an absent name

---

## Adding a New Component to Docs

1. Ensure `createMetadata()` is complete in `ComponentName.tsx`
2. Set `status: "stable"` (or `"experimental"`) — `"in progress"` components are excluded
3. Create `website/content/docs/components/ComponentName/ComponentName.md` with hand-written description and examples
4. Run `npm run generate-all-docs -w xmlui`
5. Verify output in `website/content/docs/pages/components/`

---

## Adding an Extension Package to Docs

1. Add package name to `extensions-config.json` → `includeByName`
2. Ensure the package has been built (`npm run build -w packages/xmlui-<name>`)
3. Create description files in `website/content/docs/extensions/<package-name>/`
4. Run `npm run generate-all-docs -w xmlui`

---

## Anti-Patterns

- Do NOT hand-edit files in `website/content/docs/pages/components/` — they are overwritten on every generation run
- Do NOT import metadata from source `.tsx` files in the generator — always use compiled `dist/metadata/` output
- Do NOT add components with `status: "in progress"` and expect them in docs — they are filtered out
