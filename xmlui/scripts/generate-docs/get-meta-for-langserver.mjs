import { writeFileSync } from "fs";
import { join } from "path";
import { collectedComponentMetadata } from "../../dist/xmlui-metadata.mjs";
import { FOLDERS } from "./folders.mjs";

// Main
generateLangServerMetadata();

function generateLangServerMetadata() {
  const simplifiedMetadata = {};

  // Process each component
  for (const [componentName, componentData] of Object.entries(collectedComponentMetadata)) {
    simplifiedMetadata[componentName] = {
      description: componentData.description,
      status: componentData.status,
      props: componentData.props,
      events: componentData.events,
    };
  }

  // Generate the file content
  const fileContent = `// This file is auto-generated. Do not edit manually.
export default ${JSON.stringify(simplifiedMetadata, null, 2)};
`;

  // Write to file
  const outputPath = join(FOLDERS.projectRoot, "xmlui", "dist", "metadata_for_langserver.mjs");
  try {
    writeFileSync(outputPath, fileContent, { flag: "w" });
    console.log(`Successfully generated language server metadata at: ${outputPath}`);
  } catch (error) {
    console.error("Error writing language server metadata file:", error);
    throw error;
  }
}
