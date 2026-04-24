# Plan: VS Code Extension — Local LangServer First, Bundled Fallback

## Status

**Not implemented.** The stub exists in [`tools/vscode/src/extension.ts:50-58`](../../tools/vscode/src/extension.ts) — `localLangServPath` is hardcoded to `null`, so the bundled server is always used.

## Goal

When the XMLUI VS Code extension activates, it should:
1. Try to find and use a **locally installed** `xmlui-langserver` binary (e.g. from a workspace `node_modules` or a global install).
2. Fall back to the **bundled** `dist/server.js` when no local server is found.

This lets developers working on the language server itself get live updates without rebuilding the extension.

## Background

- The extension entry point is [`tools/vscode/src/extension.ts`](../../tools/vscode/src/extension.ts).
- The bundled server is [`tools/vscode/src/server.ts`](../../tools/vscode/src/server.ts), which re-exports `xmlui/language-server`.
- The core language server lives in [`xmlui/src/language-server/server.ts`](../../xmlui/src/language-server/server.ts) and is exported from the `xmlui` package as `./language-server`.
- Currently only one VS Code config key exists: `XMLUILanguageService.trace.server` (tracing only).

## Implementation Steps

### 1. Add a VS Code configuration setting

In [`tools/vscode/package.json`](../../tools/vscode/package.json), add a new property under `contributes.configuration.properties`:

```json
"XMLUILanguageService.localServerPath": {
  "scope": "machine-overridable",
  "type": "string",
  "default": "",
  "description": "Absolute path to a local xmlui language server script (e.g. /path/to/node_modules/xmlui/dist/nodejs/server.js). When set, the extension uses this server instead of the bundled one. Leave empty to always use the bundled server."
}
```

This gives users an explicit escape hatch in addition to the auto-detection logic below.

### 2. Implement auto-detection of the local server

Replace the body of `getPathToLangServer()` in [`tools/vscode/src/extension.ts`](../../tools/vscode/src/extension.ts) with logic that:

1. **Check explicit config first** — read `XMLUILanguageService.localServerPath` from VS Code workspace config. If the value is non-empty and the file exists on disk, return it immediately.

2. **Probe workspace `node_modules`** — look for the language server script relative to the first open workspace folder:
   ```
   <workspaceFolder>/node_modules/xmlui/dist/nodejs/server.js
   ```
   If that file exists, return its path.

3. **Fall back to bundled** — return `context.asAbsolutePath(path.join('dist', 'server.js'))`.

Example implementation sketch:

```typescript
import * as fs from 'fs';
import { workspace } from 'vscode';

function getPathToLangServer(context: ExtensionContext): string {
  // 1. Explicit config override
  const config = workspace.getConfiguration('XMLUILanguageService');
  const explicitPath = config.get<string>('localServerPath', '').trim();
  if (explicitPath && fs.existsSync(explicitPath)) {
    console.log('[xmlui] Using configured local lang server:', explicitPath);
    return explicitPath;
  }

  // 2. Workspace node_modules probe
  const folders = workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    const candidate = path.join(
      folders[0].uri.fsPath,
      'node_modules', 'xmlui', 'dist', 'nodejs', 'server.js'
    );
    if (fs.existsSync(candidate)) {
      console.log('[xmlui] Using workspace local lang server:', candidate);
      return candidate;
    }
  }

  // 3. Bundled fallback
  const bundled = context.asAbsolutePath(path.join('dist', 'server.js'));
  console.log('[xmlui] Using bundled lang server:', bundled);
  return bundled;
}
```

### 3. Log which server is active (status bar / output channel)

- The existing `console.log` calls become visible in the "XMLUI Language Service" output channel.
- Optionally show a brief VS Code information notification on first activation indicating which server was chosen (local vs bundled). This aids debugging.

### 4. Handle server restarts on config change

Listen for `workspace.onDidChangeConfiguration` filtered to `XMLUILanguageService.localServerPath`. When the setting changes:
- Stop the current `LanguageClient`.
- Re-run `getPathToLangServer()`.
- Start a new `LanguageClient` with the new path.

### 5. Tests / verification

- Unit-test `getPathToLangServer` by mocking `fs.existsSync` and `workspace.workspaceFolders`.
- Manual QA:
  - Extension with no xmlui in `node_modules` → should use bundled server.
  - Extension opened in a workspace that has xmlui installed → should detect and use local server.
  - `localServerPath` set to a valid path → should use that path.
  - `localServerPath` set to a non-existent path → should fall through to bundled server (log a warning).

## Files to Change

| File | Change |
|------|--------|
| [`tools/vscode/src/extension.ts`](../../tools/vscode/src/extension.ts) | Replace `getPathToLangServer` body; add config-change listener |
| [`tools/vscode/package.json`](../../tools/vscode/package.json) | Add `XMLUILanguageService.localServerPath` config property |

No changes needed to the bundled server (`server.ts`) or the core language server package.

## Open Questions

- Should the workspace probe also check parent directories (monorepo root)? The current plan only checks `workspaceFolders[0]`.
- Should there be a priority setting for cases where multiple workspace folders exist?
- Should the local server be launched via `node` (TransportKind.ipc, as today) or via a separate TCP socket to allow reuse across multiple VS Code windows?
