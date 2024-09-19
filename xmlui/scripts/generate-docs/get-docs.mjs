import path from "path";
import { fileURLToPath } from 'url';
import { basename, join } from "path";
import { readFile, writeFile } from "fs/promises";
import { collectedComponentMetadata } from "../../dist/xmlui-metadata.mjs";
import { Logger, logger, handleError } from "./logger.mjs";
import { processDocfiles } from "./process-mdx.mjs";
import { createTable } from "./utils.mjs";

logger.setLevels(Logger.levels.warning, Logger.levels.error);

// get these variables from config
const projectRootFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../");
const docsFolderRoot = join(projectRootFolder, "docs");
const componentDocsFolder = join(docsFolderRoot, "pages", "components");
const componentDocsFolderName = basename(componentDocsFolder);

/*
const inputComponentsFolder = join(projectRootFolder, "xmlui", "src", "components");
const componentSamplesFolder = join(docsFolderRoot, "component-samples");
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
  };

  const entries = addDescriptionRef(extendedComponentData, [
    "props",
    "events",
    "api",
    "contextVars",
  ]);
  return { ...extendedComponentData, ...entries };
});

logger.info("Processing MDX files");
processDocfiles(metadata);

// --- Create Summary

logger.info("Creating Component Summary");
try {
  const summary = await createSummary(
    metadata,
    join(docsFolderRoot, "pages", `${componentDocsFolderName}.mdx`),
    {
      sectionName: "Components",
      componentFolder: componentDocsFolderName,
    },
  );
  await writeFile(join(docsFolderRoot, "pages", `${componentDocsFolderName}.mdx`), summary);
} catch (error) {
  handleError(error);
}

// --- Helpers

async function createSummary(
  metadata,
  filename,
  { sectionName = "Components", componentFolder = componentDocsFolderName },
) {
  const buffer = await readFile(filename, "utf8");

  const lines = strBufferToLines(buffer);
  const startComponentsSection = lines.findIndex((line) => line.includes(`## ${sectionName}`));
  const endComponentsSection = lines
    .slice(startComponentsSection + 1)
    .findIndex((line) => /^#+[\s\S]/.exec(line));

  const beforeComponentsSection = lines.slice(0, startComponentsSection).join("\n");
  const afterComponentsSection = lines
    .slice(startComponentsSection + 1, startComponentsSection + 1 + endComponentsSection)
    .join("\n");

  let table = "";
  table += `## ${sectionName}\n\n`;
  table += createTable({
    headers: [{ value: "Component", style: "center" }, "Description", { value: "Status", style: "center" }],
    rows: metadata.map((component) => [
      `[${component.displayName}](./${componentFolder}/${component.displayName}.mdx)`,
      component.description,
      component.status ?? "stable",
    ]),
  })

  return beforeComponentsSection + "\n" + table + "\n\n" + afterComponentsSection;
}

function addDescriptionRef(component, entries = []) {
  const result = {};

  if (component) {
    entries.forEach((entry) => {
      if (component[entry]) {
        result[entry] = Object.fromEntries(
          Object.entries(component[entry]).map(([k, v]) => {
            v.descriptionRef = `${component.componentFolder}/${component.displayName}.mdx?${k}`;
            return [k, v];
          }),
        );
      }
    });
  }

  return result;
}

function strBufferToLines(buffer) {
  return buffer.split(/\r?\n/);
}
