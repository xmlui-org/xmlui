import { collectedComponentMetadata } from '../../dist/xmlui-metadata.mjs';
import { join } from "path";
import { logger, Logger } from "./logger.mjs";
import { processDocfiles } from './process-mdx.mjs';

logger.setLevels(Logger.levels.warning, Logger.levels.error);

logger.info("Extending component metadata with default values");
const metadata = Object.entries(collectedComponentMetadata).map(([compName, compData]) => {
  const displayName = compName;
  const componentFolder = compData.specializedFrom || compData.docFolder || compName;
  const descriptionRef = join(componentFolder, `${displayName}.mdx`);

  const metadata = {
    ...compData,
    displayName,
    description: compData.description,
    descriptionRef,
    componentFolder,
  }

  const entries = addDescriptionRef(metadata, ["props", "events", "api", "contextVars"]);
  return { ...metadata, ...entries };
});

logger.info("Processing MDX files");
processDocfiles(metadata);

// ------------------------ HELPERS --------------------------

function addDescriptionRef(component, entries = []) {
  const result = {};
  
  if (component) {
    entries.forEach((entry) => {
      if (component[entry]) {
        result[entry] = Object.fromEntries(Object.entries(component[entry]).map(([k, v]) => {
          v.descriptionRef = `${component.componentFolder}/${component.displayName}.mdx?${k}`;
          return [k, v];
        }))
      }
    });
  }

  return result;
}

// get these variables from config
/* const projectRootFolder = "D:/Projects/albacrm/xmlui";  // <- OVERRIDE THIS!
const inputComponentsFolder = join(projectRootFolder, "xmlui", "src", "components");
const outFolderRoot = join(projectRootFolder, "docs");
const outFolder = join(outFolderRoot, "pages", "components2"); */

//import { readFile } from 'fs/promises';
//await readFile();

/* try {
  const buffer = await readFile(descriptionRef, "utf8");
  if (buffer) {
    logger.info(buffer);    
  }
} catch(error) {
  console.error(JSON.stringify(error, null, 2));
} */
