import { fileURLToPath } from "url";
import { basename, join, dirname, extname, relative } from "path";
import { existsSync } from "fs";
import { unlink, readdir, readFile, writeFile } from "fs/promises";
import { collectedComponentMetadata } from "../../dist/xmlui-metadata.mjs";
import { Logger, logger } from "./logger.mjs";
import { processDocfiles } from "./process-mdx.mjs";
import { processError, createTable, ErrorWithSeverity, convertPath, strBufferToLines } from "./utils.mjs";
import loadConfig from "./input-handler.mjs";
import { buildPagesMap } from "./build-pages-map.mjs";

logger.setLevels(Logger.levels.warning, Logger.levels.error);

// TODO: get these variables from config
const scriptFolder = import.meta.dirname;
const projectRootFolder = join(dirname(fileURLToPath(import.meta.url)), "../../../");
const docsFolderRoot = join(projectRootFolder, "docs");
const metaFolder = join(docsFolderRoot, "meta");
const pagesMapFile = join(metaFolder, "pages.js");
const pagesFolder = join(docsFolderRoot, "pages");
const componentDocsFolder = join(pagesFolder, "components");
const componentDocsFolderName = basename(componentDocsFolder);

// --- Load Config

logger.info("Loading config");

let config = {};
try {
  config = await loadConfig(join(scriptFolder, "config.json"));
} catch (error) {
  processError("Error reading JSON file:", error);
  throw error;
}

// --- Extend Metadata

logger.info("Extending component metadata");

const metadata = Object.entries(collectedComponentMetadata)
  .filter(([_, compData]) => {
    return !config.excludeComponentStatuses.includes(compData.status?.toLowerCase());
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

if (config.cleanFolder) {
  logger.info(`Cleaning ${componentDocsFolderName}`);
  try {
    await removeAllFilesInFolder(componentDocsFolder);
    
    // recreate pages map file
    if (existsSync(pagesMapFile)) {
      await unlink(pagesMapFile);
      await writeFile(pagesMapFile, "");  
    }
  } catch (error) {
    processError(error);
  }
}

// --- Export Metadata to JSON (Optional)

if (config.exportToJson) {
  logger.info("Exporting metadata to JSON");
  try {
    await writeFile(join(scriptFolder, "metadata.json"), JSON.stringify(collectedComponentMetadata, null, 2));
  } catch (error) {
    processError(error);
  }
}

// --- Process Docs & Export Files

logger.info("Processing MDX files");

const pagesMapFileName = basename(pagesMapFile);
const importsToInject = `import { Callout } from "nextra/components";\n` +
  `import ${pagesMapFileName.replace(extname(pagesMapFile), "")} from "${convertPath(relative(componentDocsFolder, pagesMapFile))}";\n\n`;
processDocfiles(metadata, importsToInject);

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

// --- Generate Pages Map

logger.info("Generating Pages Map");
try {
  buildPagesMap(pagesFolder, pagesMapFile);
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
  const componentSectionStartIdx = lines.findIndex((line) => line.includes(`## ${sectionName}`));
  const componentSectionEndIdx = lines
    .slice(componentSectionStartIdx + 1)
    .findIndex((line) => /^#+[\s\S]/.exec(line));

  const beforeComponentsSection = lines.slice(0, componentSectionStartIdx).join("\n");
  const afterComponentsSection = lines
    .slice(componentSectionStartIdx + 1, componentSectionStartIdx + 1 + componentSectionEndIdx)
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
