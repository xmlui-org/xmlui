import { basename, join, extname, relative } from "path";
import { lstatSync } from "fs";
import { unlink, readdir, readFile, mkdir, writeFile, rm } from "fs/promises";
import { ErrorWithSeverity, logger, LOGGER_LEVELS, processError } from "./logger.mjs";
import { winPathToPosix, deleteFileIfExists, fromKebabtoReadable } from "./utils.mjs";
import { DocsGenerator } from "./DocsGenerator.mjs";
import { collectedComponentMetadata } from "../../dist/metadata/xmlui-metadata.mjs";
import { FOLDERS } from "./folders.mjs";
import { existsSync } from "fs";
import {
  COMPONENT_STATES,
  FILE_EXTENSIONS,
  FOLDER_NAMES,
  CONFIG_FILES,
  SUMMARY_CONFIG,
  PACKAGE_PATTERNS,
  FILE_NAMES,
  LOG_MESSAGES,
  ERROR_MESSAGES,
  METADATA_PROPERTIES,
  TEMPLATE_STRINGS
} from "./constants.mjs";

// --- Main

// Prefilter metadata by isHtmlTag
const filterByProps = { [METADATA_PROPERTIES.IS_HTML_TAG]: true };
const [components, htmlTagComponents] = partitionMetadata(
  collectedComponentMetadata,
  filterByProps,
);

await generateComponents(components);

// --- Temporarily disabled
// const packagesMetadata = await dynamicallyLoadExtensionPackages();
// await generateExtenionPackages(packagesMetadata);

// --- Helpers

async function generateExtenionPackages(metadata) {
  logger.info(LOG_MESSAGES.GENERATING_EXTENSION_DOCS);

  const extensionsConfig = await loadConfig(join(FOLDERS.script, CONFIG_FILES.EXTENSIONS));
  const outputFolder = join(FOLDERS.docsRoot, FOLDER_NAMES.CONTENT, FOLDER_NAMES.EXTENSIONS);
  const extensionsFolder = outputFolder;

  const unlistedFolders = [];
  for (const packageName in metadata) {
    // Just to be sure we don't generate anything internal
    if (metadata[packageName].state === COMPONENT_STATES.INTERNAL) {
      continue;
    }

    const packageFolder = join(extensionsFolder, packageName);

    if (!existsSync(packageFolder)) {
      await mkdir(packageFolder, { recursive: true });
    }

    const extensionGenerator = new DocsGenerator(
      metadata[packageName].metadata,
      {
        sourceFolder: metadata[packageName].sourceFolder,
        outFolder: packageFolder,
        examplesFolder: join(FOLDERS.docsRoot, FOLDER_NAMES.COMPONENT_SAMPLES),
      },
      { excludeComponentStatuses: extensionsConfig?.excludeComponentStatuses },
    );

    if (extensionsConfig?.cleanFolder) {
      await cleanFolder(packageFolder);
    }

    let componentsAndFileNames = extensionGenerator.generateDocs();
    if (Object.keys(componentsAndFileNames).length === 0) {
      if (existsSync(packageFolder)) {
        await rm(packageFolder, { recursive: true });
      }
      unlistedFolders.push(packageName);
      continue;
    }

    const summaryTitle = SUMMARY_CONFIG.EXTENSIONS.title;
    const summaryFileName = SUMMARY_CONFIG.EXTENSIONS.fileName;

    // In both of these cases, we are writing to the same file
    const indexFile = join(packageFolder, `${summaryFileName}.md`);
    deleteFileIfExists(indexFile);

    await extensionGenerator.exportMetadataToJson(FOLDER_NAMES.EXTENSIONS, packageName);

    componentsAndFileNames = insertKeyAt(summaryFileName, summaryTitle, componentsAndFileNames, 0);
    await extensionGenerator.generatePackageDescription(
      metadata[packageName].description,
      TEMPLATE_STRINGS.PACKAGE_HEADER(packageName),
      indexFile,
    );

    // Generate a _meta.json for the files in the extension
    extensionGenerator.writeMetaSummary(componentsAndFileNames, packageFolder);
  }

  // generate a _meta.json for the folder names
  try {
    const extensionPackagesMetafile = join(extensionsFolder, FILE_EXTENSIONS.METADATA);

    const folderNames = Object.fromEntries(
      Object.keys(metadata)
        .filter((m) => !unlistedFolders.includes(m))
        .map((name) => {
          return [name, fromKebabtoReadable(name)];
        }),
    );

    // Do not include the summary file in the _meta.json
    deleteFileIfExists(extensionPackagesMetafile);
    await writeFile(extensionPackagesMetafile, JSON.stringify(folderNames, null, 2));
  } catch (e) {
    logger.error(ERROR_MESSAGES.WRITE_META_FILE_ERROR, e?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}

async function generateComponents(metadata) {
  const componentsConfig = await loadConfig(join(FOLDERS.script, CONFIG_FILES.COMPONENTS));
  const outputFolder = join(FOLDERS.docsRoot, FOLDER_NAMES.CONTENT, FOLDER_NAMES.COMPONENTS);

  const metadataGenerator = new DocsGenerator(
    metadata,
    {
      sourceFolder: join(FOLDERS.projectRoot, "xmlui", FOLDER_NAMES.SRC, FOLDER_NAMES.COMPONENTS),
      // --- CHANGE: Now documents are generated in the a new folder, outside of pages
      outFolder: outputFolder,
      // outFolder: join(FOLDERS.docsRoot, FOLDER_NAMES.PAGES, FOLDER_NAMES.COMPONENTS),
      examplesFolder: join(FOLDERS.docsRoot, FOLDER_NAMES.COMPONENT_SAMPLES),
    },
    { excludeComponentStatuses: componentsConfig?.excludeComponentStatuses },
  );

  if (componentsConfig?.cleanFolder) {
    // --- CHANGE: Now documents are generated in the a new folder, outside of pages
    // await cleanFolder(join(FOLDERS.pages, FOLDER_NAMES.COMPONENTS));
    await cleanFolder(outputFolder);
  }

  let componentsAndFileNames = metadataGenerator.generateDocs();

  const summaryTitle = SUMMARY_CONFIG.COMPONENTS.title;
  const summaryFileName = SUMMARY_CONFIG.COMPONENTS.fileName;
  await metadataGenerator.exportMetadataToJson(FOLDER_NAMES.COMPONENTS);
  componentsAndFileNames = insertKeyAt(summaryFileName, summaryTitle, componentsAndFileNames, 0);

  metadataGenerator.writeMetaSummary(componentsAndFileNames, outputFolder);

  await metadataGenerator.generatePermalinksForHeaders();
}

// NOTE: Unused - we are not generating Html component docs
async function generateHtmlTagComponents(metadata) {
  const componentsConfig = await loadConfig(join(FOLDERS.script, CONFIG_FILES.COMPONENTS));
  const metadataGenerator = new DocsGenerator(
    metadata,
    {
      sourceFolder: join(FOLDERS.projectRoot, "xmlui", FOLDER_NAMES.SRC, FOLDER_NAMES.COMPONENTS),
      outFolder: join(FOLDERS.docsRoot, FOLDER_NAMES.PAGES, FOLDER_NAMES.COMPONENTS),
      examplesFolder: join(FOLDERS.docsRoot, FOLDER_NAMES.COMPONENT_SAMPLES),
    },
    { excludeComponentStatuses: componentsConfig?.excludeComponentStatuses },
  );
  
}

async function cleanFolder(folderToClean) {
  logger.info(LOG_MESSAGES.CLEANING_FOLDER(basename(folderToClean)));

  if (!existsSync(folderToClean)) return;

  // NOTE: This is the important part: we only delete .mdx and .md files and the _meta.json
  const cleanCondition = (file) =>
    FILE_EXTENSIONS.MARKDOWN.includes(extname(file)) || basename(file) === FILE_EXTENSIONS.METADATA;
  try {
    const files = await readdir(folderToClean);
    const unlinkPromises = files
      .filter(cleanCondition)
      .map((file) => unlink(join(folderToClean, file)));

    await Promise.all(unlinkPromises)
      .then(() => {
        logger.info(LOG_MESSAGES.FILES_DELETED_SUCCESS);
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

  logger.info(LOG_MESSAGES.LOADING_CONFIG);
  try {
    if (!configPath) {
      throw new ErrorWithSeverity(ERROR_MESSAGES.NO_CONFIG_PATH, LOGGER_LEVELS.error);
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
/**
 * Dynamically loads extension package metadata from the `packages` folder.
 * Loading of metadata is only possible if the package has a `dist` folder
 * and is built using the `build:meta` script which produces a {file-name}-metadata.js file.
 * @returns {Promise<Record<
 *  string,
 *  { sourceFolder: string, description: string, metadata: Record<string, any> }
 * >>} imported metadata
 */
async function dynamicallyLoadExtensionPackages() {
  logger.info(LOG_MESSAGES.LOADING_EXTENSION_PACKAGES);

  const defaultPackageState = COMPONENT_STATES.EXPERIMENTAL;

  const extendedPackagesFolder = join(FOLDERS.projectRoot, "packages");
  const packageDirectories = (await readdir(extendedPackagesFolder)).filter((entry) => {
    return (
      entry.startsWith(PACKAGE_PATTERNS.XMLUI_PREFIX) && lstatSync(join(extendedPackagesFolder, entry)).isDirectory()
    );
  });

  const importedMetadata = {};
  for (let dir of packageDirectories) {
    const extensionPackage = {
      sourceFolder: join(extendedPackagesFolder, dir),
      description: "",
      metadata: {},
      state: defaultPackageState,
    };
    dir = join(extendedPackagesFolder, dir);
    try {
      const packageFolderDist = join(dir, FOLDER_NAMES.DIST);
      if (!existsSync(packageFolderDist)) {
        logger.warning(LOG_MESSAGES.NO_DIST_FOLDER(dir));
        continue;
      }
      const distContents = await readdir(packageFolderDist);
      for (const file of distContents) {
        let filePath = join(packageFolderDist, file);
        if (filePath.endsWith(`${basename(dir)}${PACKAGE_PATTERNS.METADATA_SUFFIX}`) && existsSync(filePath)) {
          filePath = winPathToPosix(relative(FOLDERS.script, filePath));
          const { componentMetadata } = await import(filePath);
          if (!componentMetadata) {
            logger.warning(
              LOG_MESSAGES.NO_METADATA_OBJECT(basename(dir))
            );
            continue;
          }
          if (!componentMetadata.metadata) {
            logger.warning(
              LOG_MESSAGES.NO_COMPONENT_METADATA(basename(dir))
            );
            continue;
          }

          extensionPackage.metadata = componentMetadata.metadata ?? {};
          extensionPackage.description = componentMetadata.description ?? "";
          extensionPackage.state = componentMetadata.state ?? defaultPackageState;
        }
      }
      // Ignore internal packages
      if (extensionPackage.state === COMPONENT_STATES.INTERNAL) {
        logger.info(LOG_MESSAGES.SKIPPING_INTERNAL_PACKAGE, dir);
        continue;
      }
      logger.info(LOG_MESSAGES.LOADED_EXTENSION_PACKAGE, basename(dir));
      importedMetadata[basename(dir)] = extensionPackage;
    } catch (error) {
      processError(error);
    }
  }
  return importedMetadata;
}

function partitionMetadata(metadata, filterByProps) {
  const [components, htmlTagComponents] = partitionObject(metadata, (compData, c) => {
    if (!filterByProps || Object.keys(filterByProps).length === 0) {
      return true;
    }
    for (const [propName, propValue] of Object.entries(filterByProps)) {
      if (compData[propName] === undefined) {
        return true;
      }
      if (compData[propName] === propValue) {
        return false;
      }
    }
  });

  return [components, htmlTagComponents];
}

/**
 * Partition an object into two objects based on a discriminator function.
 * @template T
 * @param {Record<string, T>} obj Input object to partition
 * @param {(value: T, key: string) => boolean} discriminator Function to decide partitioning
 * @returns {[Record<string, T>, Record<string, T>]} An array containing two disjoint objects
 */
function partitionObject(obj, discriminator) {
  return Object.entries(obj).reduce(
    ([pass, fail], [key, value]) => {
      if (discriminator(value, key)) {
        return [{ ...pass, [key]: value }, fail];
      } else {
        return [pass, { ...fail, [key]: value }];
      }
    },
    [{}, {}],
  );
}

function insertKeyAt(key, value, obj, pos) {
  return Object.keys(obj).reduce((ac, a, i) => {
    if (i === pos) ac[key] = value;
    ac[a] = obj[a];
    return ac;
  }, {});
}
