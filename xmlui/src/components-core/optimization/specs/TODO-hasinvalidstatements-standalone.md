# TODO: `hasInvalidStatements` in Standalone Mode — Lost Narrowing for `<script>` with Imports

## Problem

A `<script>` block in an XMLUI component can import functions from a shared module:

```xml
<Component name="FileVersionsDrawer">
  <script>
    import { customConfirm, publishEvent } from "../../shared.xs";
  </script>
  ...
</Component>
```

The XMLUI scripting parser treats `import` statements as **invalid top-level statements**
(only `var` and `function` declarations are valid). This sets
`scriptCollected.hasInvalidStatements = true` on the component.

`hasInvalidStatements = true` is the guard in `computeUsesInternal` that blocks narrowing
for this component:

```ts
const ownHasScript = !!(node.scriptCollected?.hasInvalidStatements);
// → safeToNarrow = false → computedUses never set → full parentState always received
```

### Why it works in Vite mode but not in Standalone

| Mode | How `<script>` imports are handled | `hasInvalidStatements` | Narrowing |
|------|------------------------------------|------------------------|-----------|
| **Vite build** | `vite-xmlui-plugin.ts` calls `collectCodeBehindFromSourceWithImports` (async, resolves imports from disk) → imported functions are merged into `scriptCollected.functions` before parsing | `false` | ✅ works |
| **Standalone (browser-only)** | `xmlui-parser.ts` calls `collectCodeBehindFromSource` (sync, no file access) → `import` line is an unrecognized statement | `true` | ❌ blocked |

In standalone mode, every component that uses `<script>` with `import` loses narrowing.
In a typical app (like myworkdrive), this is **every modal, every page, the sidebar, the
context menu** — essentially the entire app. They all receive the full `parentState` and
re-render on any state change.

### Scale in myworkdrive (Vite mode is fine; standalone would lose all of these)

```
39 components with <script> imports from shared.xs across myworkdrive
→ in standalone mode: all 39 would have hasInvalidStatements=true → no narrowing
```

---

## Root Cause

The parser's `collectCodeBehindFromSource` function is synchronous and has no access to
the file system. It cannot resolve `import { fn } from "../../shared.xs"`. It therefore
treats the import statement as an unknown/invalid statement.

The **async** variant `collectCodeBehindFromSourceWithImports` (with a `ModuleFetcher`)
handles imports correctly, but it requires a way to fetch the referenced files —
something only Vite (via disk read) or a custom fetcher can provide.

---

## Two Independent Problems to Solve

### Problem A: Standalone mode — fetching imported modules in the browser

In standalone mode, the browser already **has** all `.xs` files available (it fetched them
as part of loading the app). There is a `_xsSourceFiles` map (populated in
`StandaloneApp`) that contains the source of every `.xs` file.

**Recommended approach:**
Use `collectCodeBehindFromSourceWithImports` with a fetcher that looks up files in
`_xsSourceFiles` at runtime. This would give standalone mode the same quality of
import resolution that Vite provides at build time.

Key challenge: `computeUsesForTree` runs synchronously, but
`collectCodeBehindFromSourceWithImports` is async. Options:
- Pre-resolve imports **before** `computeUsesForTree` is called, storing the result in
  `scriptCollected` (the same way the Vite plugin does via `preResolvedImports`).
- In `resolveRuntime` (where `_xsSourceFiles` is available), run a pre-pass that resolves
  imports for all components and patches their `scriptCollected` before analysis.

### Problem B: Truly invalid statements (non-import)

A component script may contain statements that are genuinely unsupported — top-level
`if`, `for`, function calls, etc. These correctly set `hasInvalidStatements = true` and
correctly block narrowing (dep set is incomplete).

**No fix needed** for these. The guard is intentional.
The only work needed is to **distinguish** import-caused invalidity (fixable) from
true invalidity (intentional guard).

One approach: add a separate flag `scriptCollected.hasUnresolvableImports` when the
only invalid statements are `import` lines, and leave `hasInvalidStatements` for
genuine parse failures.

---

## Impact Assessment

| Fix | Effort | Impact |
|-----|--------|--------|
| Standalone: pre-resolve imports before `computeUsesForTree` | Medium | Every app using `<script>` with imports in standalone mode gains full narrowing |
| Distinguish import-invalidity from genuine invalidity | Low | Enables targeted fix; improves diagnostics |
| Vite mode already works | — | No change needed |

---

## Related

- `computed-uses-specification.md` — "Code-Behind Transitive Analysis" section
- `history-bugs.md` — Bug 15, Bug 16 (code-behind scope issues)
- `TODO-ast-analysis-xs-files.md` — DONE: transitive analysis of resolved functions
- `vite-xmlui-plugin.ts:239` — `collectCodeBehindFromSourceWithImports` call (Vite path)
- `xmlui-parser.ts:59` — `collectCodeBehindFromSource` call (sync, no imports, Vite parse-time pass)
