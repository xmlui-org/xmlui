import { fileURLToPath } from "url";
import { basename, join, dirname, extname } from "path";
import { unlink, readdir, readFile, writeFile } from "fs/promises";
import { collectedComponentMetadata } from "../../dist/xmlui-metadata.mjs";
import { Logger, logger } from "./logger.mjs";
import { processDocfiles } from "./process-mdx.mjs";
import { processError, createTable, ErrorWithSeverity } from "./utils.mjs";
import loadConfig from "./input-handler.mjs";

logger.setLevels(Logger.levels.warning, Logger.levels.error);

// get these variables from config
const scriptFolder = import.meta.dirname;
const projectRootFolder = join(dirname(fileURLToPath(import.meta.url)), "../../../");
const docsFolderRoot = join(projectRootFolder, "docs");
const componentDocsFolder = join(docsFolderRoot, "pages", "components");
const componentDocsFolderName = basename(componentDocsFolder);

/*
const inputComponentsFolder = join(projectRootFolder, "xmlui", "src", "components");
const componentSamplesFolder = join(docsFolderRoot, "component-samples");
*/

// --- Load Config

logger.info("Loading config");

let cleanFolder = false;
let excludeComponentStatuses = [];
try {
  const config = await loadConfig(join(scriptFolder, "config.json"));
  cleanFolder = config.cleanFolder;
  excludeComponentStatuses = config.excludeComponentStatuses;
} catch (error) {
  processError("Error reading JSON file:", error);
  throw error;
}

// --- Extend Metadata

logger.info("Extending component metadata");

const metadata = Object.entries(collectedComponentMetadata)
  .filter(([_, compData]) => {
    return !excludeComponentStatuses.includes(compData.status?.toLowerCase());
  })
  .map(([compName, compData]) => {
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

// --- Clean Folder

if (cleanFolder) {
  logger.info(`Cleaning ${componentDocsFolderName}`);
  try {
    await removeAllFilesInFolder(componentDocsFolder);
  } catch (error) {
    processError(error);
  }
}

// --- Process Docs & Export Files

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
  processError(error);
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

  const sortedMetadata = metadata.sort((a, b) => {
    return a.displayName.localeCompare(b.displayName);
  });

  let table = "";
  table += `## ${sectionName}\n\n`;
  table += createTable({
    rowNums: true,
    headers: [
      { value: "Component", style: "center" },
      "Description",
      { value: "Status", style: "center" },
    ],
    rows: sortedMetadata.map((component) => [
      `[${component.displayName}](./${componentFolder}/${component.displayName}.mdx)`,
      component.description,
      component.status ?? "stable",
    ]),
  });

  return beforeComponentsSection + "\n" + table + afterComponentsSection;
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

async function removeAllFilesInFolder(folderPath) {
  const files = await readdir(folderPath);

  const unlinkPromises = files
    .filter(
      (file) =>
        extname(file) === ".mdx" || extname(file) === ".md" || basename(file) === "_meta.json",
    )
    .map((file) => unlink(join(folderPath, file)));

  await Promise.all(unlinkPromises)
    .then(() => {
      logger.info("All files have been successfully deleted");
    })
    .catch((err) => {
      throw new ErrorWithSeverity(err.message, Logger.severity.error);
    });
}

function strBufferToLines(buffer) {
  return buffer.split(/\r?\n/);
}
