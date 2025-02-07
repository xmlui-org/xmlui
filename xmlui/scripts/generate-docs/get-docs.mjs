import { basename, join, extname, relative } from "path";
import { lstatSync } from "fs";
import { unlink, readdir, readFile } from "fs/promises";
import { logger, LOGGER_LEVELS } from "./logger.mjs";
import { processError, ErrorWithSeverity, convertPath } from "./utils.mjs";
import {
  DocsGenerator,
  pagesFolder,
  projectRootFolder,
  scriptFolder,
} from "./DocsGenerator.mjs";
import { collectedComponentMetadata } from "../../dist/xmlui-metadata.mjs";

// --- Main

// --- --- Extensions

const outFolder = join(projectRootFolder, "docs", "pages", "extension-components");
const examplesFolder = join(projectRootFolder, "docs", "component-samples");

const extensionsConfig = await loadConfig(join(scriptFolder, "extensions-config.json"));
const packagesMetadata = await dynamicallyLoadExtensionPackages();

const test = packagesMetadata["xmlui-animations"];

const extensionGenerator = new DocsGenerator(test.metadata, {
  excludeComponentStatuses: extensionsConfig?.excludeComponentStatuses,
});

if (extensionsConfig?.cleanFolder) {
  await cleanFolder(join(pagesFolder, "extension-components"));
}
extensionGenerator.generateDocs(test.sourceFolder, outFolder, examplesFolder);

// --- --- Components
/* 
const sourceFolder = join(projectRootFolder, "xmlui", "src", "components");
const outFolder = join(projectRootFolder, "docs", "pages", "components");
const examplesFolder = join(projectRootFolder, "docs", "component-samples");

const componentsConfig = await loadConfig(join(scriptFolder, "components-config.json"));
const metadataGenerator = new DocsGenerator(collectedComponentMetadata, {
  excludeComponentStatuses: componentsConfig?.excludeComponentStatuses,
});

if (componentsConfig?.cleanFolder) {
  await cleanFolder(join(pagesFolder, "extension-components"));
}
metadataGenerator.generateDocs(sourceFolder, outFolder, examplesFolder);

if (componentsConfig?.exportToJson) {
  await metadataGenerator.exportMetadataToJson();
}

await metadataGenerator.generateComponentsSummary();
await metadataGenerator.generateArticleAndDownloadsLinks();
 */
// --- Helpers

async function cleanFolder(folderToClean) {
  logger.info(`Cleaning ${basename(folderToClean)} by removing previous doc files`);

  // NOTE: This is the important part: we only delete .mdx and .md files and the _meta.json
  const cleanCondition = (file) =>
    extname(file) === ".mdx" || extname(file) === ".md" || basename(file) === "_meta.json";
  try {
    const files = await readdir(folderToClean);
    const unlinkPromises = files
      .filter(cleanCondition)
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

// TODO: We assume a lot here, need to make all the folders and filenames transparent
async function dynamicallyLoadExtensionPackages() {
  const extendedPackagesFolder = join(projectRootFolder, "packages");
  const packageDirectories = (await readdir(extendedPackagesFolder)).filter((entry) => {
    return (
      entry.startsWith("xmlui-") && lstatSync(join(extendedPackagesFolder, entry)).isDirectory()
    );
  });

  const importedMetadata = {};
  for (let dir of packageDirectories) {
    const extensionPackage = {
      sourceFolder: join(extendedPackagesFolder, dir),
      metadata: {},
    }
    dir = join(extendedPackagesFolder, dir);
    try {
      const packageFolderDist = join(dir, "dist");
      const distContents = await readdir(packageFolderDist);
      for (const file of distContents) {
        let filePath = join(packageFolderDist, file);
        if (filePath.endsWith("-metadata.js")) {
          filePath = convertPath(relative(scriptFolder, filePath));
          const { componentMetadata } = await import(filePath);
          extensionPackage.metadata[componentMetadata.name] = componentMetadata.metadata;
        }
      }
      importedMetadata[basename(dir)] = extensionPackage;
    } catch (error) {
      processError(error);
    }
  }
  return importedMetadata;
}
