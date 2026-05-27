/**
 * Unified optimizer metadata lookup that searches both the engine-internal
 * registry (`coreComponentMetadata`) and the public component registry
 * (`collectedComponentMetadata`), so callers no longer need explicit
 * `if (type === "DataLoader")` guards.
 *
 * IMPORTANT: this module imports the **live** `components/collectedComponentMetadata.ts`
 * barrel (the same object every component's metadata is registered into), not the
 * pre-generated `language-server/xmlui-metadata-generated.js` snapshot. Tests
 * mutate the barrel to register extension components on the fly and expect
 * `getOptimizerMetadata` to observe those mutations.
 *
 * NOT safe to import from the `xmlui-parser.ts` / language-server path — the
 * barrel transitively imports every `.tsx` component, which language-server
 * (Node.js, no bundler) cannot resolve. The parser keeps its own local lookup
 * that reads from `xmlui-metadata-generated.js`.
 */
import { collectedComponentMetadata } from "../../components/collectedComponentMetadata";
import { coreComponentMetadata } from "../coreComponentMetadata";
import type { OptimizerMetadataView } from "../../abstractions/ComponentDefs";

export function getOptimizerMetadata(type: string): OptimizerMetadataView | undefined {
  if (type in coreComponentMetadata) {
    return (coreComponentMetadata as Record<string, OptimizerMetadataView>)[type];
  }
  return (collectedComponentMetadata as Record<string, OptimizerMetadataView>)[type];
}
