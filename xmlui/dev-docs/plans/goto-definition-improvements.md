# Plan: Improve Goto Definition in the XMLUI Language Server

**Date:** 2026-04-27  
**Status:** Proposal

---

## Problem

`handleDefinition` in [`xmlui/src/language-server/services/definition.ts`](../../xmlui/src/language-server/services/definition.ts) has two issues, both noted in its own TODO comment:

1. **Filename-only matching across the whole workspace.** The implementation iterates every `.xmlui` file known to the language server and returns the first one whose basename equals the component name. In a workspace that contains multiple XMLUI projects (e.g. a monorepo), different projects can have identically named components:

   ```
   common-root/
     xmlui-weather/
       src/MyButton.xmlui
     xmlui-hello-world/
       src/MyButton.xmlui
       Main.xmlui          ← user is here, types <MyButton/>
   ```

   The current code can resolve to `xmlui-weather/src/MyButton.xmlui`, which belongs to a different project.

2. **Range points to the start of the file.** After finding the target file, the returned `Location.range` is always `{ pos: 0, end: 0 }` — the very first character of the file. The cursor should instead land on the `<Component` open-tag identifier.

---

## Goal

1. **Project-scoped resolution** — resolve only against `.xmlui` files that belong to the same XMLUI project as the requesting document.
2. **Precise range** — return a range that positions the cursor on the `<Component>` tag name of the root element in the target file.

---

## Background

The language server uses a single `ProjectDocumentManager` that scans the entire workspace root and accumulates all `.xmlui` files into one flat URI map. There is no current notion of per-project scoping.

An XMLUI project is identified by a **root marker** file: either `Main.xmlui` or `config.json` at the project root directory. Every `.xmlui` file in a project is a descendant of that root. Two files belong to the same project when they share the same nearest marker-bearing ancestor directory.

A user-defined component (UDC) named `MyButton` lives in a file `MyButton.xmlui` within the project. The file's root element is always `<Component ...>`. The natural goto-definition target is the `Component` tag name of that open tag, not the beginning of the file.

Relevant code paths:
- `handleDefinition` — [`xmlui/src/language-server/services/definition.ts`](../../xmlui/src/language-server/services/definition.ts)
- `ProjectDocumentManager.scan()` — [`xmlui/src/language-server/base/project-document-manager.ts`](../../xmlui/src/language-server/base/project-document-manager.ts)
- `Project` — [`xmlui/src/language-server/base/project.ts`](../../xmlui/src/language-server/base/project.ts)
- LSP wiring — [`xmlui/src/language-server/server-common.ts`](../../xmlui/src/language-server/server-common.ts)

---

## Implementation Steps

### 1. Add `findProjectRoot` helper

Add a helper in `definition.ts` that walks up the file system from a document URI until it finds a directory containing `Main.xmlui` or `config.json`. This becomes the "project root" for that document. The function returns a URI prefix string (ending in `/`) suitable for `startsWith` comparisons.

```typescript
import * as fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

const PROJECT_ROOT_MARKERS = ["Main.xmlui", "config.json"];

function findProjectRoot(docUri: string): string {
  let dir = path.dirname(fileURLToPath(docUri));
  while (true) {
    for (const marker of PROJECT_ROOT_MARKERS) {
      if (fs.existsSync(path.join(dir, marker))) {
        return pathToFileURL(dir).toString() + "/";
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root — no marker found
    dir = parent;
  }
  // Fallback: use the document's own directory (safe degradation)
  return pathToFileURL(path.dirname(fileURLToPath(docUri))).toString() + "/";
}
```

`fs.existsSync` is acceptable here — the language server runs as a Node.js process, and `ProjectDocumentManager` already uses `fs.readFileSync` synchronously.

---

### 2. Add `findComponentTagRange` helper

Add a helper that parses a target document and returns the range of the `TagNameNode` inside the root `<Component>` element. This is where the cursor should land after goto-definition.

```typescript
import { SyntaxKind } from "../../parsers/xmlui-parser";

function findComponentTagRange(targetDoc: TextDocument): Range {
  const { parseResult: { node } } = targetDoc.parse();
  // The root element of every UDC file is <Component ...>
  const rootElement = node.children?.find(c => c.kind === SyntaxKind.ElementNode);
  if (rootElement) {
    const tagNameNode = rootElement.children?.find(c => c.kind === SyntaxKind.TagNameNode);
    if (tagNameNode) {
      return targetDoc.cursor.rangeAt({ pos: tagNameNode.pos, end: tagNameNode.end });
    }
  }
  // Fallback: start of file (current behaviour)
  return targetDoc.cursor.rangeAt({ pos: 0, end: 0 });
}
```

---

### 3. Update `handleDefinition` to use both helpers

Replace the candidate iteration loop in `handleDefinition`:

```typescript
// Before
const uris = project.documents.keys();
for (uri of uris) {
  const compName = path.basename(uri, ".xmlui");
  if (targetCompName === compName) {
    const targetDoc = project.documents.get(uri);
    return {
      uri,
      range: targetDoc.cursor.rangeAt({ pos: 0, end: 0 }),
    };
  }
}

// After
const projectRoot = findProjectRoot(uri);
for (const candidateUri of project.documents.keys()) {
  if (!candidateUri.startsWith(projectRoot)) continue;
  const compName = path.basename(fileURLToPath(candidateUri), ".xmlui");
  if (targetCompName !== compName) continue;
  const targetDoc = project.documents.get(candidateUri);
  if (!targetDoc) continue;
  return {
    uri: candidateUri,
    range: findComponentTagRange(targetDoc),
  };
}
```

Note: `uri` in the before-code was reused as the loop variable and shadowed the parameter — the after-code uses `candidateUri` to avoid that.

---

## Files to Change

| File | Change |
|------|--------|
| `xmlui/src/language-server/services/definition.ts` | Add `findProjectRoot`, `findComponentTagRange`; update `handleDefinition` loop; add `fs`, `fileURLToPath`, `pathToFileURL` imports |

No changes to `server-common.ts`, `project.ts`, or `ProjectDocumentManager` are required.

---

## Edge Cases

| Case | Behaviour |
|------|-----------|
| No project root marker found | `findProjectRoot` falls back to the document's own directory; resolution is scoped to that directory — degrades gracefully |
| Same component name in multiple files within one project | First match in iteration order wins — correct, because XMLUI does not support two UDCs with the same name in a single project |
| Built-in component (e.g. `<Button>`) | No `.xmlui` source file exists; `handleDefinition` returns `null` as today |
| Target file has no `<Component>` root element | `findComponentTagRange` falls back to `{ pos: 0, end: 0 }` — current behaviour |
| Document URI uses a non-`file://` scheme | `fileURLToPath` will throw; wrap with a try/catch and return `null` |

---

## Tests to Add

In `xmlui/tests/language-server/definition.test.ts` (create if it does not exist):

1. **Project-scoped resolution** — set up two projects each containing `MyButton.xmlui` using `Project.fromFileContents`. Confirm that goto-definition from a document in project A resolves to project A's `MyButton.xmlui`, not project B's.

2. **Range accuracy** — confirm that the returned `Location.range.start` is not `{ line: 0, character: 0 }` when the file has leading whitespace or XML declaration before the `<Component>` tag, and that it points to the `Component` identifier.

3. **Unknown component** — confirm `null` is returned when no matching file exists in the project.

4. **Built-in component** — confirm `null` is returned for a component with no `.xmlui` file anywhere in the store.
