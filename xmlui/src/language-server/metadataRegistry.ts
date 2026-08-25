/**
 * Browser-safe live metadata registry.
 *
 * `components/collectedComponentMetadata.ts` populates this object with live
 * component metadata at module-load time. Keeping this registry empty here
 * avoids pulling the generated language-server snapshot into the standalone
 * browser bundle.
 *
 * Node/LSP/build-time code that needs the generated snapshot should import
 * `generatedMetadataRegistry` instead.
 */
import type { ComponentMetadata } from "../abstractions/ComponentDefs";

export const metadataRegistry: Record<string, ComponentMetadata> = {};
