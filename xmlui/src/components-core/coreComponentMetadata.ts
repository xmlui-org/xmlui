/**
 * Registry of engine-internal component metadata that is intentionally excluded
 * from the public `collectedComponentMetadata` (which drives IDE suggestions and
 * documentation). Algorithms that need to inspect *any* component — public or
 * internal — should combine this registry with `collectedComponentMetadata` (or
 * use the `getOptimizerMetadata` helper from `optimization/metadataLookup`).
 */
import { DataLoaderMd } from "./loader/DataLoaderMd";

export const coreComponentMetadata = {
  DataLoader: DataLoaderMd,
  // Future internal components (e.g. ApiBoundDataLoader) belong here.
};
