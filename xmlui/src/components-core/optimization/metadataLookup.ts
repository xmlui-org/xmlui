/**
 * Unified optimizer metadata lookup that searches both the engine-internal
 * registry (`coreComponentMetadata`) and the public component registry
 * (`collectedComponentMetadata`), so callers no longer need explicit
 * `if (type === "DataLoader")` guards.
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
