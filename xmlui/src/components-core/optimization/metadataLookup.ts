/**
 * Unified optimizer metadata lookup used by the browser runtime and tests.
 *
 * Reads from the live browser-safe metadata registry populated at module-load
 * time by `components/collectedComponentMetadata.ts`. Build-time Node paths
 * that need the generated language-server snapshot pass an explicit lookup
 * into `xmlUiMarkupToComponent` instead of using this browser default.
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
