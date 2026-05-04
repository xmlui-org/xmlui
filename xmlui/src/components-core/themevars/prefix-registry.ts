/**
 * Theme-variable namespace prefix registry.
 *
 * ## Convention
 *
 * XMLUI core components use unqualified `ComponentName` segments in theme
 * variable names:
 *
 *   `--xmlui-backgroundColor-Button`       ← core (unchanged)
 *
 * Extension package components **must** prefix `ComponentName` with a
 * short, stable `PackagePrefix_` token declared here:
 *
 *   `--xmlui-backgroundColor-Animations_Button`  ← xmlui-animations
 *   `--xmlui-backgroundColor-Pdf_Viewer`         ← xmlui-pdf
 *
 * The prefix token is PascalCase; the separator is `_` (not `-`) to avoid
 * ambiguity with the existing `-`-delimited segment convention.
 *
 * ## Canonical prefix table
 *
 * The table below is the single source of truth for all packages in this
 * monorepo.  Third-party packages outside the `xmlui-*` umbrella must
 * declare their prefix in their own `Extension.themeNamespacePrefix` field
 * and ensure it does not collide with any entry here.
 *
 * | npm package             | Prefix       |
 * |-------------------------|--------------|
 * | xmlui-animations        | Animations   |
 * | xmlui-calendar          | Calendar     |
 * | xmlui-crm-blocks        | Crm          |
 * | xmlui-devtools          | Devtools     |
 * | xmlui-docs-blocks       | Docs         |
 * | xmlui-echart            | Echart       |
 * | xmlui-gauge             | Gauge        |
 * | xmlui-grid-layout       | GridLayout   |
 * | xmlui-masonry           | Masonry      |
 * | xmlui-pdf               | Pdf          |
 * | xmlui-react-flow        | ReactFlow    |
 * | xmlui-recharts          | Recharts     |
 * | xmlui-search            | Search       |
 * | xmlui-spreadsheet       | Spreadsheet  |
 * | xmlui-tiptap-editor     | Tiptap       |
 * | xmlui-website-blocks    | Websites     |
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Describes a registered theme-variable namespace prefix entry. */
export interface ThemeVarPrefixEntry {
  /** npm package name (e.g. `"xmlui-animations"`). */
  packageName: string;
  /**
   * Canonical PascalCase prefix used in theme variable names
   * (e.g. `"Animations"`).
   */
  prefix: string;
}

// ---------------------------------------------------------------------------
// Built-in prefix registry for monorepo packages
// ---------------------------------------------------------------------------

/**
 * Canonical prefix table for all first-party extension packages.
 * The analyzer and the LSP use this to validate theme variable names in
 * extension package SCSS files (Phase 1 of plan #02).
 */
export const BUILTIN_THEME_PREFIX_REGISTRY: ReadonlyArray<ThemeVarPrefixEntry> = [
  { packageName: "xmlui-animations",     prefix: "Animations"  },
  { packageName: "xmlui-calendar",       prefix: "Calendar"    },
  { packageName: "xmlui-crm-blocks",     prefix: "Crm"         },
  { packageName: "xmlui-devtools",       prefix: "Devtools"    },
  { packageName: "xmlui-docs-blocks",    prefix: "Docs"        },
  { packageName: "xmlui-echart",         prefix: "Echart"      },
  { packageName: "xmlui-gauge",          prefix: "Gauge"       },
  { packageName: "xmlui-grid-layout",    prefix: "GridLayout"  },
  { packageName: "xmlui-masonry",        prefix: "Masonry"     },
  { packageName: "xmlui-pdf",            prefix: "Pdf"         },
  { packageName: "xmlui-react-flow",     prefix: "ReactFlow"   },
  { packageName: "xmlui-recharts",       prefix: "Recharts"    },
  { packageName: "xmlui-search",         prefix: "Search"      },
  { packageName: "xmlui-spreadsheet",    prefix: "Spreadsheet" },
  { packageName: "xmlui-tiptap-editor",  prefix: "Tiptap"      },
  { packageName: "xmlui-website-blocks", prefix: "Websites"    },
];

// ---------------------------------------------------------------------------
// Registry access helpers
// ---------------------------------------------------------------------------

const _byPackage = new Map<string, ThemeVarPrefixEntry>(
  BUILTIN_THEME_PREFIX_REGISTRY.map((e) => [e.packageName, e]),
);

const _byPrefix = new Map<string, ThemeVarPrefixEntry>(
  BUILTIN_THEME_PREFIX_REGISTRY.map((e) => [e.prefix, e]),
);

/** Look up a prefix entry by npm package name. Returns `undefined` if not registered. */
export function getPrefixByPackage(packageName: string): ThemeVarPrefixEntry | undefined {
  return _byPackage.get(packageName);
}

/** Look up a prefix entry by prefix token. Returns `undefined` if not registered. */
export function getEntryByPrefix(prefix: string): ThemeVarPrefixEntry | undefined {
  return _byPrefix.get(prefix);
}

/**
 * Validate a theme variable `ComponentName` segment against an expected prefix.
 *
 * Returns `true` when:
 *  - `expectedPrefix` is `undefined` (core component, no prefix expected), or
 *  - `componentSegment` starts with `${expectedPrefix}_`.
 *
 * Returns `false` otherwise.
 */
export function hasCorrectPrefix(
  componentSegment: string,
  expectedPrefix: string | undefined,
): boolean {
  if (expectedPrefix === undefined) {
    // Core component — no prefix allowed.
    return !componentSegment.includes("_");
  }
  return componentSegment.startsWith(`${expectedPrefix}_`);
}
