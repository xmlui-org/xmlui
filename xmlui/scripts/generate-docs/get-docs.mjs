import { fileURLToPath } from "url";
import { basename, join, dirname, extname, relative } from "path";
import { existsSync, lstatSync } from "fs";
import { unlink, readdir, readFile, writeFile } from "fs/promises";
import { collectedComponentMetadata } from "../../dist/xmlui-metadata.mjs";
import { logger, LOGGER_LEVELS } from "./logger.mjs";
import { MetadataProcessor } from "./process-mdx.mjs";
import {
  processError,
  createTable,
  ErrorWithSeverity,
  strBufferToLines,
  convertPath,
} from "./utils.mjs";
import { buildPagesMap } from "./build-pages-map.mjs";
import { buildDownloadsMap } from "./build-downloads-map.mjs";

logger.setLevels(LOGGER_LEVELS.warning, LOGGER_LEVELS.error);
const acceptedStatuses = ["stable", "experimental", "deprecated", "in progress"];
const defaultStatus = "stable";

// TODO: get these variables from config
const scriptFolder = import.meta.dirname;
const projectRootFolder = join(dirname(fileURLToPath(import.meta.url)), "../../../");
const docsFolderRoot = join(projectRootFolder, "docs");
const metaFolder = join(docsFolderRoot, "meta");
const pagesMapFile = join(metaFolder, "pages.js");
const pagesFolder = join(docsFolderRoot, "pages");
const componentDocsFolder = join(pagesFolder, "components");
const componentDocsFolderName = basename(componentDocsFolder);
const fileResourceFolder = join(docsFolderRoot, "public", "resources", "files");
const downloadsMapFile = join(metaFolder, "downloads.js");

const sourceFolder = join(projectRootFolder, "xmlui", "src", "components");
const examplesFolder = join(projectRootFolder, "docs", "component-samples");
const outFolder = join(projectRootFolder, "docs", "pages", "components");

class DocsGenerator {
  metadata = [];

  constructor(metadata, { excludeComponentStatuses }) {
    this.metadata = metadata;
    this.expandMetadata(excludeComponentStatuses);
  }

  expandMetadata(excludeComponentStatuses) {
    logger.info("Transforming & expanding component metadata");
    this.metadata = Object.entries(collectedComponentMetadata)
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
          "apis",
          "contextVars",
        ]);
        return { ...extendedComponentData, ...entries };
      });
  }

  generateDocs(outputFolder) {
    logger.info("Processing MDX files");

    // const pagesMapFileName = basename(pagesMapFile);
    const importsToInject = `import { Callout } from "nextra/components";\n\n`;
    // + `import ${pagesMapFileName.replace(extname(pagesMapFile), "")} from "${convertPath(relative(componentDocsFolder, pagesMapFile))}";\n\n`;
    const metaProcessor = new MetadataProcessor(this.metadata, importsToInject, {
      sourceFolder,
      outFolder: outputFolder,
      examplesFolder,
      relativeComponentFolderPath: componentDocsFolderName,
    });
    metaProcessor.processDocfiles();
  }

  async exportMetadataToJson() {
    logger.info("Exporting metadata to JSON");
    try {
      await writeFile(
        join(scriptFolder, "metadata.json"),
        JSON.stringify(collectedComponentMetadata, null, 2),
      );
    } catch (error) {
      processError(error);
    }
  }

  async generateComponentsSummary() {
    logger.info("Creating Component Summary");
    try {
      const summary = await createSummary(
        metadata,
        join(docsFolderRoot, "pages", `${componentDocsFolderName}.mdx`),
        {
          sectionName: "Components",
          componentFolder: componentDocsFolderName,
          //excludeStatuses: ["in progress"],
        },
      );
      await writeFile(join(docsFolderRoot, "pages", `${componentDocsFolderName}.mdx`), summary);
    } catch (error) {
      processError(error);
    }
  }

  async generateArticleAndDownloadsLinks() {
    try {
      if (existsSync(pagesMapFile)) {
        await unlink(pagesMapFile);
        await writeFile(pagesMapFile, "");
      }

      logger.info("Generating link IDs for article headings");
      buildPagesMap(pagesFolder, pagesMapFile);

      if (existsSync(downloadsMapFile)) {
        await unlink(downloadsMapFile);
        await writeFile(downloadsMapFile, "");
      }

      logger.info("Generating link IDs for downloadable files");
      buildDownloadsMap(fileResourceFolder, downloadsMapFile);
    } catch (error) {
      processError(error);
    }
  }
}

//const config = await loadConfig(join(scriptFolder, "extensions-config.json"));

//const packagesMetadata = await dynamicallyLoadExtensionPackages();

/* const extensionGenerator = new DocsGenerator(packagesMetadata, {
  excludeComponentStatuses: config?.excludeComponentStatuses,
}); */

const componentsConfig = await loadConfig(join(scriptFolder, "components-config.json"));
const metadataGenerator = new DocsGenerator(collectedComponentMetadata, {
  excludeComponentStatuses: componentsConfig?.excludeComponentStatuses,
});

if (componentsConfig?.cleanFolder) {
  await cleanFolder(join(pagesFolder, "extension-components"));
}
metadataGenerator.generateDocs(outFolder);

// --- Helpers

// param: componentDocsFolder
async function cleanFolder(folderToClean) {
  logger.info(`Cleaning ${basename(folderToClean)} by removing previous doc files`);
  try {
    const files = await readdir(folderToClean);
    const unlinkPromises = files
      .filter(
        (file) =>
          extname(file) === ".mdx" || extname(file) === ".md" || basename(file) === "_meta.json",
      )
      .map((file) => unlink(join(folderToClean, file)));

    await Promise.all(unlinkPromises)
      .then(() => {
        logger.info("All files have been successfully deleted");
      })
      .catch((err) => {
        throw new ErrorWithSeverity(err.message, LOGGER_LEVELS.error);
      });
  } catch (error) {
    processError(error);
    throw error;
  }
}

async function loadConfig(configPath) {
  if (!configPath) return;
  logger.info("Loading config");
  try {
    if (!configPath) {
      throw new ErrorWithSeverity("No config path provided", LOGGER_LEVELS.error);
    }
    const fileContents = await readFile(configPath, "utf8");
    const { excludeComponentStatuses, ...data } = JSON.parse(fileContents);
    return {
      excludeComponentStatuses: excludeComponentStatuses.map((status) => status.toLowerCase()),
      ...data,
    };
  } catch (error) {
    processError("Error reading JSON file:", error);
    throw error;
  }
}

async function createSummary(
  metadata,
  filename,
  { sectionName = "Components", componentFolder = componentDocsFolderName, excludeStatuses = [] },
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
    rows: sortedMetadata
      .filter((component) => {
        const componentStatus = component.status ?? defaultStatus;
        return !acceptedStatuses.includes(componentStatus) ? false : true;
      })
      .map((component) => {
        return [
          `[${component.displayName}](./${componentFolder}/${component.displayName}.mdx)`,
          component.description,
          component.status ?? defaultStatus,
        ];
      }),
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

async function dynamicallyLoadExtensionPackages() {
  const extendedPackagesFolder = join(projectRootFolder, "packages");
  const packageDirectories = (await readdir(extendedPackagesFolder)).filter((entry) => {
    return (
      entry.startsWith("xmlui-") && lstatSync(join(extendedPackagesFolder, entry)).isDirectory()
    );
  });

  const importedMetadata = {};
  for (let dir of packageDirectories) {
    dir = join(extendedPackagesFolder, dir);
    try {
      const packageFolderDist = join(dir, "dist");
      const distContents = await readdir(packageFolderDist);
      for (const file of distContents) {
        let filePath = join(packageFolderDist, file);
        if (filePath.endsWith("-metadata.js")) {
          filePath = convertPath(relative(scriptFolder, filePath));
          //console.log(filePath)
          const { componentMetadata } = await import(filePath);
          importedMetadata[componentMetadata.name] = componentMetadata.metadata;
        }
      }
    } catch (error) {
      processError(error);
    }
  }
  return importedMetadata;
}

/* async function removeAllFilesInFolder(folderPath) {
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
      throw new ErrorWithSeverity(err.message, LOGGER_LEVELS.error);
    });
} */

/* 

// --- Load Config

// --- Expand Metadata

logger.info("Transform & expand component metadata");

const metadata = Object.entries(collectedComponentMetadata)
  .filter(([_, compData]) => {
    return (
      !config.excludeComponentStatuses.includes(compData.status?.toLowerCase())
    );
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
      "apis",
      "contextVars",
    ]);
    return { ...extendedComponentData, ...entries };
  });

// --- Clean Folder

if (config.cleanFolder) {
  logger.info(`Cleaning ${componentDocsFolderName} by removing all files and regenerating file link entries`);
  try {
    await removeAllFilesInFolder(componentDocsFolder);

    // recreate pages map file
    if (existsSync(pagesMapFile)) {
      await unlink(pagesMapFile);
      await writeFile(pagesMapFile, "");
    }
    if (existsSync(downloadsMapFile)) {
      await unlink(downloadsMapFile);
      await writeFile(downloadsMapFile, "");
    }
  } catch (error) {
    processError(error);
  }
}

// --- Export Metadata to JSON (Optional)

if (config.exportToJson) {
  logger.info("Exporting metadata to JSON");
  try {
    await writeFile(
      join(scriptFolder, "metadata.json"),
      JSON.stringify(collectedComponentMetadata, null, 2),
    );
  } catch (error) {
    processError(error);
  }
}

// --- Process Docs & Export Files

logger.info("Processing MDX files");

const pagesMapFileName = basename(pagesMapFile);
const importsToInject = `import { Callout } from "nextra/components";\n\n`;
// + `import ${pagesMapFileName.replace(extname(pagesMapFile), "")} from "${convertPath(relative(componentDocsFolder, pagesMapFile))}";\n\n`;
processDocfiles(metadata, importsToInject, componentDocsFolderName);

// --- Create Summary

logger.info("Creating Component Summary");
try {
  const summary = await createSummary(
    metadata,
    join(docsFolderRoot, "pages", `${componentDocsFolderName}.mdx`),
    {
      sectionName: "Components",
      componentFolder: componentDocsFolderName,
      //excludeStatuses: ["in progress"],
    },
  );
  await writeFile(join(docsFolderRoot, "pages", `${componentDocsFolderName}.mdx`), summary);
} catch (error) {
  processError(error);
}

// --- Generate Article ID and Download ID Maps

try {
  logger.info("Generating link IDs for article headings");
  buildPagesMap(pagesFolder, pagesMapFile);

  logger.info("Generating link IDs for downloadable files");
  buildDownloadsMap(fileResourceFolder, downloadsMapFile);
} catch (error) {
  processError(error);
}

// --- Helpers

async function createSummary(
  metadata,
  filename,
  { sectionName = "Components", componentFolder = componentDocsFolderName, excludeStatuses = [] },
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
    rows: sortedMetadata
      .filter((component) => {
        const componentStatus = component.status ?? defaultStatus;
        return !acceptedStatuses.includes(componentStatus) ? false : true;
      })
      .map((component) => {
        return [
          `[${component.displayName}](./${componentFolder}/${component.displayName}.mdx)`,
          component.description,
          component.status ?? defaultStatus,
        ];
      }),
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

*/