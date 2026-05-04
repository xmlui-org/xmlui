/**
 * Theme-variable namespace utilities — public barrel.
 *
 * Phase 1 of plan #02 adds `themeNamespacePrefix` to extension packages
 * and the lint rule that validates SCSS variable names.  This barrel will
 * grow as those phases land.
 */

export type { ThemeVarPrefixEntry } from "./prefix-registry";
export {
  BUILTIN_THEME_PREFIX_REGISTRY,
  getPrefixByPackage,
  getEntryByPrefix,
  hasCorrectPrefix,
} from "./prefix-registry";
