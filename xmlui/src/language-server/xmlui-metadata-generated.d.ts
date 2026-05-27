// Ambient typing for the auto-generated `xmlui-metadata-generated.js` snapshot.
// The runtime file is a single `export default { ... }` JS object keyed by
// component-type-name; declaring it here lets call sites (xmlui-parser,
// vite-xmlui-plugin, server-common, optimization/metadataLookup) drop their
// `@ts-ignore` shims and `as Record<string, ...>` narrowing casts.

import type { ComponentMetadata } from "../abstractions/ComponentDefs";

declare const collectedComponentMetadata: Record<string, ComponentMetadata>;
export default collectedComponentMetadata;
