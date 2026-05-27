/**
 * Single live metadata registry. Node-safe — the only import is the static
 * `xmlui-metadata-generated.js` snapshot (pure JS, no .tsx component sources).
 *
 * This object is the backing store for **both** lookup paths:
 *
 * - **Parser / Node.js path** (`xmlui-parser.ts`, `vite-xmlui-plugin.ts`,
 *   `language-server/server-common.ts`): these never import the `.tsx` barrel,
 *   so the registry starts and stays at build-time snapshot values.
 *
 * - **Browser / test path** (`StandaloneApp.tsx`, Vitest): when
 *   `components/collectedComponentMetadata.ts` is imported it calls
 *   `Object.assign(metadataRegistry, { ... })` to overwrite every entry with
 *   the live metadata exported by each component file. From that point both
 *   `getOptimizerMetadata` and `defaultMetadataLookup` see the live values.
 *
 * Tests that mutate `(collectedComponentMetadata as any).X = { ... }` are
 * mutating this same object (since `collectedComponentMetadata === metadataRegistry`
 * after the barrel loads), so all lookup callers observe the mutation correctly.
 *
 * This resolves issue #13 from the optimizer-metadata cleanup review: the two
 * previously byte-identical lookup functions (`defaultMetadataLookup` in
 * `xmlui-parser.ts` and `getOptimizerMetadata` in `optimization/metadataLookup.ts`)
 * diverged only in WHICH object they read from. With a single shared registry,
 * the implementations are now truly identical and a re-export alias replaces
 * the local copy in `xmlui-parser.ts`.
 */
import generatedSnapshot from "./xmlui-metadata-generated.js";
import type { ComponentMetadata } from "../abstractions/ComponentDefs";

// The generated snapshot is a plain mutable object. We cast it here to its
// full ComponentMetadata shape (the .d.ts declares it as ComponentMetadata,
// the runtime value already matches). All callers read from this reference;
// when collectedComponentMetadata.ts loads, it Object.assigns live values into
// this same object, making both lookup paths observe the update.
export const metadataRegistry: Record<string, ComponentMetadata> =
  generatedSnapshot as Record<string, ComponentMetadata>;
