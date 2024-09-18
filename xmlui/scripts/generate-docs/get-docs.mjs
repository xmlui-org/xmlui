import { join } from "path";
import { readFile, writeFile } from 'fs/promises';

import { collectedComponentMetadata } from '../../dist/xmlui-metadata.mjs';
import { Logger, logger, handleError } from "./logger.mjs";
import { processDocfiles } from './process-mdx.mjs';

logger.setLevels(Logger.levels.warning, Logger.levels.error);

// get these variables from config
const projectRootFolder = "D:/Projects/albacrm/xmlui";  // <- OVERRIDE THIS!
const docsFolderRoot = join(projectRootFolder, "docs");
/*
const inputComponentsFolder = join(projectRootFolder, "xmlui", "src", "components");
const componentSamplesFolder = join(docsFolderRoot, "component-samples");
const componentDocsFolder = join(docsFolderRoot, "pages", "components2");
*/

logger.info("Extending component metadata with default values");
const metadata = Object.entries(collectedComponentMetadata).map(([compName, compData]) => {
  const displayName = compName;
  const componentFolder = compData.specializedFrom || compData.docFolder || compName;
  const descriptionRef = join(componentFolder, `${displayName}.mdx`);

  const extendedComponentData = {
    ...compData,
    displayName,
    description: compData.description,
    descriptionRef,
    componentFolder,
  }

  const entries = addDescriptionRef(extendedComponentData, ["props", "events", "api", "contextVars"]);
  return { ...extendedComponentData, ...entries };
});

logger.info("Processing MDX files");
processDocfiles(metadata);

// --- Create Summary

logger.info("Creating Component Summary");
try {
  const summary = await createSummary(join(docsFolderRoot, "pages", "components2.mdx"), metadata);
  await writeFile(join(docsFolderRoot, "pages", "components2.mdx"), summary);
} catch(error) {
  handleError(error);
}

// --- Helpers

async function createSummary(filename, metadata) {
  const buffer = await readFile(filename, "utf8");

  const lines = strBufferToLines(buffer);
  const startComponentsSection = lines.findIndex((line) => line.includes("## Components"));
  const endComponentsSection = lines.slice(startComponentsSection + 1).findIndex((line) => /^#+[\s\S]/.exec(line));

  const beforeComponentsSection = lines.slice(0, startComponentsSection).join("\n");
  const afterComponentsSection = lines.slice(startComponentsSection + 1 + endComponentsSection).join("\n");

  let table = "";
  table += "## Components\n\n";
  table += "| Value | Description |\n";
  table += "| --- | --- |\n";
  table += metadata.map((component) => `| [${component.displayName}](./components2/${component.displayName}.mdx) | ${component.status ?? "no status"} |`).join("\n");
  
  return beforeComponentsSection + "\n" + table + "\n\n" + afterComponentsSection;
}

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

function getSection(data, startDirective, endDirective) {
  const match = data.match(new RegExp(`${startDirective}([\\s\\S])*?${endDirective}`, "i"));
  if (!match || match?.length === 0) {
    return "";
  }

  const section = match[1].substring(0, match[1].indexOf(endDirective));
  return section;
}

function strBufferToLines(buffer) {
  return buffer.split(/\r?\n/);
}
