import { collectedComponentMetadata } from "../dist/metadata/xmlui-metadata.js";
generateLangServerMetadata(collectedComponentMetadata);

/**
 * @typedef {import('../src/language-server/services/common').ComponentMetadataCollection} ComponentMetadataCollection
 * @typedef {import('../src/abstractions/ComponentDefs.js').ComponentMetadata} ComponentMetadata
 */

/**
 *
 * @param {Record<string, ComponentMetadata} metaByComp
 */
function generateLangServerMetadata(metaByComp) {
  /** @type {ComponentMetadataCollection} */
  const simplifiedMetadata = {};
  for (const [compName, componentData] of Object.entries(metaByComp)) {
    simplifiedMetadata[compName] = {
      description: componentData.description,
      status: componentData.status,
      props: componentData.props,
      events: componentData.events,
      apis: componentData.apis,
      contextVars: componentData.contextVars,
      allowArbitraryProps: componentData.allowArbitraryProps,
      shortDescription: componentData.shortDescription,
    };
  }

  const fileContent = `// This file is auto-generated. Do not edit manually.
export default ${JSON.stringify(metaByComp, null, 2)};
`;

  process.stdout.write(fileContent, (err) => {
    if (err) {
      console.error(`Could not write generated metadata to stdout:\n ${err.message}`);
    }
  });
}
