import { writeFile, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectedComponentMetadata } from "../dist/metadata/xmlui-metadata.cjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDir, "../src/language-server/xmlui-metadata-generated.js");
const writesToStdout = process.argv.includes("--stdout");

await generateLangServerMetadata(collectedComponentMetadata);

/**
 * @typedef {import('../src/abstractions/ComponentDefs.js').ComponentMetadata} ComponentMetadata
 */

/**
 *
 * @param {Record<string, ComponentMetadata>} metaByComp
 */
async function generateLangServerMetadata(metaByComp) {
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

  if (writesToStdout) {
    process.stdout.write(fileContent);
    return;
  }

  const tempPath = `${outputPath}.${process.pid}.tmp`;
  await writeFile(tempPath, fileContent);
  await rename(tempPath, outputPath);
  console.error(
    `Wrote ${Object.keys(metaByComp).length} component metadata entries to ${outputPath}`,
  );
}
