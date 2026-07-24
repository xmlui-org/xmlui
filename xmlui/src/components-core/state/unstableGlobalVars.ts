/**
 * Lightweight module — no heavy component imports.
 *
 * `UNSTABLE_GLOBAL_VARS` starts with the routing keys that are injected into
 * every StateContainer. FrameworkGlobals.ts extends it at module-init time from
 * component metadata (`unstableChildInjectedVars`).
 *
 * Kept in a separate file so ContainerUtils and the optimizer (computedUses)
 * can import it without pulling in the full component-metadata tree and its
 * transitive SCSS dependencies — which would break Rolldown config bundling.
 */
export const UNSTABLE_GLOBAL_VARS = new Set<string>([
  "$pathname",
  "$routeParams",
  "$queryParams",
  "$queryString",
  "$linkInfo",
]);
