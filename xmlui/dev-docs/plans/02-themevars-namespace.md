# Theme Variable Namespacing for Extension Packages

**Date:** 2026-04-24  
**Status:** Proposal

---

## Problem

Theme variable names follow the convention:

```
property[-part][-ComponentName][-variant][--state]
```

The `ComponentName` segment is unqualified — `Button` is just `Button`, regardless of which package defines it. Extension packages using the same component names as core (or as each other) share the same CSS variable resolution space. A user setting `backgroundColor-Button` in their theme would affect all `Button` components across all packages simultaneously, with no way to target them independently.

---

## Options Considered

### Option A: Namespace the ComponentName segment ✅ Recommended

Extend the naming convention so extension packages prefix their component name with a short package-derived token:

```
backgroundColor-Button               ← core (unchanged, backward compatible)
backgroundColor-Animations_Button    ← xmlui-animations package
backgroundColor-Pdf_Viewer           ← xmlui-pdf package
```

**Rules:**
- Core components use unqualified names — no change to existing convention.
- Extension packages **must** prefix `ComponentName` with a `PackagePrefix_` token (PascalCase prefix, underscore separator, PascalCase component name).
- The prefix is a short, stable identifier derived from the package name (e.g., `xmlui-animations` → `Animations`).
- The prefix is declared in the extension package's metadata so tooling can validate and enforce it.

**CSS variable form:** `--xmlui-backgroundColor-Animations_Button`

**Pros:**
- Fully disambiguates core and extension theme variables.
- Users can theme each independently.
- No changes to the SCSS `createThemeVar` / `parseScssVar` pipeline — the namespace is just part of the `ComponentName` string.
- Non-breaking for core.

**Cons:**
- Extension packages already shipping with bare component names in theme vars would need a migration.
- User-facing theme files must use the namespaced form when targeting extension components.

---

### Option B: Scoped CSS variable injection per registry

Inject theme variables scoped to a DOM subtree owned by each extension package, using a nested `ThemeScope` layer per package.

**Pros:** No naming changes for component authors.  
**Cons:** Significant architectural complexity. Components from different packages nested inside each other produce unpredictable scope boundaries. Does not align with the current flat `--xmlui-*` injection model.

---

### Option C: Convention only

Declare it the extension author's responsibility. Core owns unqualified names; packages must pick unique component names or accept the collision.

**Pros:** Zero implementation cost.  
**Cons:** Fragile. Collisions are hard to debug and will occur in practice as the extension ecosystem grows.

---

## Recommendation

Adopt **Option A**.

### Naming convention update

```
property[-part]-[PackagePrefix_]ComponentName[-variant][--state]
```

| Segment | Rule |
|---------|------|
| Core `ComponentName` | PascalCase, no prefix — `Button`, `Input`, `Text` |
| Extension `ComponentName` | `PackagePrefix_ComponentName` — `Animations_Button`, `Pdf_Viewer` |
| `PackagePrefix` | Short PascalCase token declared in the package's metadata |

### Package prefix registry (proposed)

| Package | Prefix |
|---------|--------|
| `xmlui-animations` | `Animations` |
| `xmlui-pdf` | `Pdf` |
| `xmlui-echart` | `Echart` |
| `xmlui-recharts` | `Recharts` |
| `xmlui-tiptap-editor` | `Tiptap` |
| `xmlui-calendar` | `Calendar` |
| `xmlui-search` | `Search` |
| `xmlui-masonry` | `Masonry` |
| `xmlui-gauge` | `Gauge` |
| `xmlui-react-flow` | `ReactFlow` |

### Implementation steps

1. Define `themeNamespacePrefix` in each extension package's root metadata/config.
2. Update `.ai/xmlui/theming-styling.md` and `guidelines.md` with the extended convention.
3. Add a lint rule (or `parseScssVar` validation) that checks extension package theme vars carry the correct prefix.
4. Migrate existing extension package theme vars to use the prefix (coordinate with changeset).
5. Document in the user-facing theming guide that extension component theme variables use the `PackagePrefix_ComponentName` form.

---

## Open Questions

- Should the underscore `_` separator be the canonical choice, or would a different delimiter (e.g., `-`) be less surprising? Note that `-` is already used as the segment separator in the convention, so `_` avoids ambiguity in the parser.
- Should the framework enforce the prefix at registration time, or rely on linting only?
- For third-party (community) packages not under the `xmlui-*` umbrella, how is prefix uniqueness guaranteed?
