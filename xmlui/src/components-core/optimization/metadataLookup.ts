/**
 * Unified optimizer metadata lookup used by the browser runtime and tests.
 *
 * Reads from `metadataRegistry` — the single live registry backed by the
 * generated snapshot and populated at module-load time by
 * `components/collectedComponentMetadata.ts`. Node-safe: this module no longer
 * imports the `.tsx` barrel; tests that mutate `collectedComponentMetadata.X`
 * are mutating `metadataRegistry.X` directly (same object reference), so
 * mutations are observable here as before.
 *
 * `defaultMetadataLookup` in `xmlui-parser.ts` is now a re-export alias of
 * this function — both read from the same registry, resolving the
 * two-function split described in issue #13 of the optimizer-metadata review.
 */
import { metadataRegistry } from "../../language-server/metadataRegistry";
import { coreComponentMetadata } from "../coreComponentMetadata";
import type { OptimizerMetadataView } from "../../abstractions/ComponentDefs";

export function getOptimizerMetadata(type: string): OptimizerMetadataView | undefined {
  if (type in coreComponentMetadata) {
    return coreComponentMetadata[type];
  }
  return metadataRegistry[type];
}
