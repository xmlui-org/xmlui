import { collectedComponentMetadata } from "../dist/metadata/xmlui-metadata.cjs";
generateLangServerMetadata(collectedComponentMetadata);

/**
 * @typedef {import('../src/abstractions/ComponentDefs.js').ComponentMetadata} ComponentMetadata
 */

/**
 *
 * @param {Record<string, ComponentMetadata>} metaByComp
 */
function generateLangServerMetadata(metaByComp) {
  // The snapshot is a faithful FULL serialization of collectedComponentMetadata.
  // It MUST preserve the optimizer fields that `createMetadata` hoists to top
  // level — `childInjectedVars`, `unstableChildInjectedVars`,
  // `isImplicitContainerByDefault` — because the build-time `computedUses`
  // optimizer (Vite plugin / language server, which never load the .tsx barrel)
  // read them via `getOptimizerMetadata`. Do NOT replace this with a field
  // subset: dropping those fields silently breaks Standalone-build narrowing.
  const fileContent = `// This file is auto-generated. Do not edit manually.
export default ${JSON.stringify(metaByComp, null, 2)};
`;

  process.stdout.write(fileContent, (err) => {
    if (err) {
      console.error(`Could not write generated metadata to stdout:\n ${err.message}`);
    }
  });
}
