# Language Server (LSP)

## Overview

The XMLUI language server provides IDE support for `.xmlui` files in VS Code. It runs as a separate Node.js process launched by the VS Code extension via IPC. All LSP services share a single `Project` instance (document store + metadata).

**Key directories:**
```
xmlui/src/language-server/
├── server.ts                    ← Node.js entry point
├── server-common.ts             ← Capability registration + handler wiring
├── xmlui-metadata-generated.js  ← Build artifact: component metadata for LSP
├── services/
│   ├── completion.ts            ← Component/prop/event completions
│   ├── hover.ts                 ← Hover documentation
│   ├── diagnostic.ts            ← Error reporting
│   ├── format.ts                ← Document formatting (XmluiFormatter)
│   ├── definition.ts            ← Go-to-definition
│   ├── folding.ts               ← Code folding ranges
│   └── common/
│       ├── metadata-utils.ts    ← MetadataProvider, ComponentMetadataProvider
│       ├── syntax-node-utilities.ts ← AST traversal helpers
│       └── docs-generation.ts   ← Markdown doc generation
└── base/
    ├── text-document.ts         ← TextDocument wrapper with lazy parse cache
    ├── project.ts               ← Project container (documents + metadata)
    ├── project-document-manager.ts ← Multi-file document store
    └── document-store.ts        ← DocumentStore interface

tools/vscode/src/extension.ts    ← VS Code extension entry point (launches server)
```

---

## Declared Capabilities

```typescript
// server-common.ts onInitialize
capabilities: {
  textDocumentSync: TextDocumentSyncKind.Incremental,
  completionProvider: { resolveProvider: true, triggerCharacters: ["<", "/"] },
  hoverProvider: true,
  documentFormattingProvider: true,
  definitionProvider: true,
  foldingRangeProvider: true,
}
```

---

## MetadataProvider

**`MetadataProvider`** (in `services/common/metadata-utils.ts`) is the single source of component metadata for all LSP services.

### Initialization

```typescript
// server-common.ts
import collectedComponentMetadata from "./xmlui-metadata-generated.js";
const metaByComp = collectedComponentMetadata as ComponentMetadataCollection;
const metadataProvider = new MetadataProvider(metaByComp);
```

### Metadata Source

- **`xmlui-metadata-generated.js`** is generated at build time: `npm run gen:langserver-metadata`
- Script: `xmlui/scripts/get-langserver-metadata.js`
- Source: `dist/metadata/xmlui-metadata.js` (built framework metadata)
- Contains stripped-down `ComponentMetadata`: `description`, `status`, `props`, `events`, `apis`, `contextVars`, `allowArbitraryProps`, `shortDescription`, `nonVisual`
- **Must be regenerated** after any component metadata change to reflect in LSP

### API

```typescript
class MetadataProvider {
  componentNames(): string[]
  getComponent(name: string): ComponentMetadataProvider | null
}

class ComponentMetadataProvider {
  getProp(name: string): ComponentPropertyMetadata
  getAttr(name: string): metadata           // Smart: events, props, apis, layout, implicit
  getAttrForKind({ name, kind }): metadata  // Type-tagged lookup
  getAllAttributes(): TaggedAttribute[]     // Props + events + apis + layout + implicit
  getEvent(name: string): metadata
  getApi(name: string): metadata
  get contextVars(): Record<string, string>
}
```

### Implicit Props (Always Available)

| Prop | Type | Description |
|------|------|-------------|
| `inspect` | boolean | Enable component inspection |
| `data` | any | Specify data source |
| `when` | boolean | Conditional rendering |

---

## Document Management

### Two-Tier Document Store

1. **Open documents** (highest priority) — `TextDocuments` manager tracks files open in editor; receives incremental changes
2. **Disk cache** (fallback) — `ProjectDocumentManager` lazy-loads from disk on `get(uri)`

### Workspace Scan

On server init, scans root workspace for `**/*.xmlui` (excludes `node_modules`). All discovered files are available for Go-to-Definition even when not open.

### Document Lifecycle

```
User opens .xmlui → LSP didOpen → TextDocuments manages it
Hover/complete → project.documents.get(uri) → returns live doc with edits
File saved → disk cache invalidated via DidChangeWatchedFilesNotification
```

### Parse Caching

Each `TextDocument` lazily caches its `ParseResult`. Cache invalidated on content change. Services call `document.parse()` — only triggers parser when stale.

---

## Services Reference

### Completion (`completion.ts`)

**Entry point:** `handleCompletion(project, uri, position): XmluiCompletionItem[]`

**Trigger characters:** `<`, `/`

| Cursor Context | Completions Provided |
|----------------|---------------------|
| After `<` | All component names from `metadataProvider.componentNames()` |
| After `</` | Matching closing tag name only |
| After component name + space | All attributes for that component |
| Inside attribute key | All attributes for component |

**Attribute completions include:** props, events, apis, layout props, implicit props

**Sort order:**
- Props: `0xxx`
- Events: `1xxx`
- APIs: `2xxx`
- Within kind: alphabetical

**Resolution (on item select):**
```typescript
// handleCompletionResolve:
const meta = metadataProvider.getComponent(componentName);
const attrMeta = meta.getAttrForKind(attribute);
item.documentation = docGen.generateAttrDescription(attrMeta);
```

**Completion item data shape:**
```typescript
type XmluiCompletionData = {
  metadataAccessInfo: {
    componentName: string;
    attribute?: { name: string; kind: "prop" | "event" | "api" | "layout" | "implicit" };
  };
};
```

---

### Hover (`hover.ts`)

**Entry point:** `handleHover(project, uri, position): Hover | null`

| Token | Context | Hover Shows |
|-------|---------|-------------|
| Identifier | Tag name | Component description, status, props/events/apis summary |
| Identifier | Attribute key | Attribute description, type, default value, enum options |
| Other | xmlns declaration | "Namespace definition" placeholder |

**Flow:**
1. Parse document → get AST node at cursor offset
2. Walk ancestor chain to determine context (TagNameNode, AttributeKeyNode, etc.)
3. Look up metadata via `MetadataProvider`
4. Generate markdown via `docGen.generateCompNameDescription()` / `generateAttrDescription()`
5. Return `Hover { contents: { kind: MarkupKind.Markdown, value: markdown } }`

---

### Diagnostics (`diagnostic.ts`)

**Entry point:** `getDiagnostics(project, uri): Diagnostic[]`

**Trigger:** `connection.onDidChangeContent` (incremental, on every keystroke)

**Flow:**
1. Retrieve document, call `document.parse()`
2. Map `parseResult.errors` (type `ParserDiag[]`) to LSP `Diagnostic` objects
3. Use `contextPos`/`contextEnd` for the highlighted range
4. Send via `connection.sendDiagnostics({ uri, diagnostics })`

**`ParserDiag` → LSP `Diagnostic` mapping:**
```typescript
{
  range: { start: posToPos(diag.contextPos), end: posToPos(diag.contextEnd) },
  message: diag.message,
  code: diag.code,
  severity: DiagnosticSeverity.Error,
  source: "xmlui",
}
```

**Note:** The lint layer (`lint.ts`) — which checks for unrecognized props — is **not yet wired into the LSP** diagnostics pipeline.

---

### Formatting (`format.ts`)

**Entry point:** `handleDocumentFormatting(project, uri, options): TextEdit[]`

**Formatter:** `XmluiFormatter` (recursive descent over AST)

**Options respected:** `tabSize`, `insertSpaces`, `insertFinalNewline`

**Behavior:**
- Max line length: 80 (configurable)
- Max consecutive blank lines: 2
- Self-closing tags normalized
- Comments and script blocks preserved
- Error nodes preserved as-is (no formatting on broken markup)

**Returns:** Single `TextEdit` replacing entire document with formatted text.

---

### Definition (`definition.ts`)

**Entry point:** `handleDefinition(project, uri, position): Location | null`

**Current behavior:** Finds component file by name match (e.g., `Button` → `Button.xmlui`). Returns `Location` at offset 0 of that file.

**Known limitations:**
- Only matches by exact filename; no namespace-qualified lookup
- Returns file start, not the `<component>` tag position
- No cross-workspace support

---

### Folding (`folding.ts`)

**Entry point:** `handleFoldingRanges(project, uri): FoldingRange[] | null`

**Fold targets:**
- Paired element tags spanning 2+ lines
- Multi-line comments (kind: `"comment"`)
- Multi-line script blocks

**Algorithm:** Depth-first AST traversal; inner folds added before outer to avoid line-start conflicts.

---

## Patterns for Extension

### Adding a New Diagnostic Rule

1. Add detection logic to parser or new lint pass; push to `parseResult.errors`
2. LSP `getDiagnostics()` automatically includes it — no changes needed in language server

```typescript
// In parser or lint:
if (badCondition) {
  errors.push({ code: "MY_CODE", message: "...", pos, end, contextPos, contextEnd });
}
```

### Adding New Completions

1. Identify `SyntaxKind` of the trigger context in `handleCompletion()`
2. Add case to the context switch
3. Return `XmluiCompletionItem[]`; add `data.metadataAccessInfo` if docs needed on resolve

```typescript
case SyntaxKind.AttributeValueNode: {
  const attrMeta = componentMeta.getAttrForKind(attribute);
  if (attrMeta?.availableValues) {
    return attrMeta.availableValues.map(v => ({
      label: v.value ?? v,
      kind: CompletionItemKind.EnumMember,
    }));
  }
}
```

### Adding a New LSP Handler

1. Create `services/newfeature.ts` with `handleNewFeature(project, uri, ...): Result`
2. Register in `server-common.ts`:
   ```typescript
   connection.onNewFeature(({ textDocument, position }) =>
     handleNewFeature(project, textDocument.uri, position)
   );
   ```
3. Add capability to `onInitialize` result

### Updating Metadata Available to LSP

1. Modify `ComponentMetadata` in `xmlui/src/abstractions/ComponentDefs.ts`
2. Update `RestrictedComponentMetadata` in `services/common/metadata-utils.ts`
3. Update `xmlui/scripts/get-langserver-metadata.js` to include new field
4. Run `npm run gen:langserver-metadata` to regenerate `xmlui-metadata-generated.js`

---

## Key Data Structures

```typescript
// AST node (from parser)
interface Node {
  kind: SyntaxKind;
  pos: number;       // Excludes trivia
  end: number;
  children?: Node[];
  triviaBefore?: Node[];
}

// Document parse result (cached per document)
interface ParseResult {
  node: Node;           // Root ContentListNode
  errors: ParserDiag[]; // All syntax/transform errors
}

// Completion item with LSP resolve data
type XmluiCompletionItem = CompletionItem & {
  data?: { metadataAccessInfo: { componentName: string; attribute?: TaggedAttribute } };
};

// Tagged attribute (for metadata lookup)
type TaggedAttribute = {
  name: string;
  kind: "prop" | "event" | "api" | "layout" | "implicit";
};
```

---

## Build Workflow

```bash
# After changing component metadata:
npm run gen:langserver-metadata   # Regenerate xmlui-metadata-generated.js

# Build the VS Code extension:
cd tools/vscode
npm run build

# Debug the language server:
# Launch VS Code extension in debug mode; server logs go to "XMLUI Language Server" output channel
```

---

## Anti-patterns

- **Do not import from the framework at LSP runtime** — the LSP runs in Node.js without React; import only from the parsers, metadata types, and `vscode-languageserver` packages
- **Do not use `parseResult` without calling `document.parse()`** — each document caches its own parse result; calling the parser directly bypasses the cache and wastes CPU
- **Do not modify `xmlui-metadata-generated.js` by hand** — it is a build artifact regenerated by `npm run gen:langserver-metadata`; hand edits will be overwritten on the next build
- **Do not wire lint rules as diagnostics without performance testing** — lint runs a second pass over the AST; running it on every keystroke could cause typing lag

---

## Key Files

| File | Purpose |
|------|---------|
| `xmlui/src/language-server/server-common.ts` | Capability registration + handler wiring |
| `xmlui/src/language-server/services/completion.ts` | Completion provider |
| `xmlui/src/language-server/services/hover.ts` | Hover provider |
| `xmlui/src/language-server/services/diagnostic.ts` | Diagnostic reporter |
| `xmlui/src/language-server/services/format.ts` | Formatter (XmluiFormatter) |
| `xmlui/src/language-server/services/common/metadata-utils.ts` | MetadataProvider + ComponentMetadataProvider |
| `xmlui/src/language-server/services/common/docs-generation.ts` | Markdown doc generation |
| `xmlui/src/language-server/base/project-document-manager.ts` | Document store |
| `xmlui/scripts/get-langserver-metadata.js` | Metadata generation script |
| `tools/vscode/src/extension.ts` | VS Code extension entry point |
