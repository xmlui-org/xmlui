/**
 * Lightweight module — no heavy component imports.
 *
 * `UNSTABLE_GLOBAL_VARS` is populated at module-init time by FrameworkGlobals.ts
 * (which reads `unstableChildInjectedVars` from all component metadata objects).
 *
 * Kept in a separate file so ContainerUtils and the optimizer (computedUses)
 * can import it without pulling in the full component-metadata tree and its
 * transitive SCSS dependencies — which would break Rolldown config bundling.
 */
export const UNSTABLE_GLOBAL_VARS = new Set<string>();
