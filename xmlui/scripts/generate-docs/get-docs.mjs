import { collectedComponentMetadata } from '../../dist/xmlui-metadata.mjs';
import { join } from "path";
import { readFile } from "fs/promises";
import { logger } from "./logger.mjs";
import { processDocfiles } from './process-mdx.mjs';

// get these variables from config
const projectRootFolder = "D:/Projects/albacrm/xmlui";  // <- OVERRIDE THIS!
const inputComponentsFolder = join(projectRootFolder, "xmlui", "src", "components");
const outFolderRoot = join(projectRootFolder, "docs");
const outFolder = join(outFolderRoot, "pages", "components2");

for (const [key, value] of Object.entries(collectedComponentMetadata)) {
  logger.info("Working with", `[${key}]`);
  const displayName = key;
  const componentFolder = key;
  const descriptionRef = join(inputComponentsFolder, componentFolder, `${displayName}.mdx`);

  //logger.info(value.props);

  processDocfiles([{
    displayName,
    description: value.description,
    descriptionRef,
    componentFolder,
  }], outFolder);
}

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
