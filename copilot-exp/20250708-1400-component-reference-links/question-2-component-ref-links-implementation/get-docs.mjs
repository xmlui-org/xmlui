import { basename, join, extname, relative } from "path";
import { lstatSync } from "fs";
import { unlink, readdir, mkdir, writeFile, rm } from "fs/promises";
import { ErrorWithSeverity, LOGGER_LEVELS } from "./logger.mjs";
import { winPathToPosix, deleteFileIfExists, fromKebabtoReadable } from "./utils.mjs";
import { DocsGenerator } from "./DocsGenerator.mjs";
import { collectedComponentMetadata } from "../../dist/metadata/xmlui-metadata.mjs";
import { FOLDERS } from "./folders.mjs";
import { existsSync } from "fs";
import { configManager, pathResolver } from "./configuration-management.mjs";
import {
  COMPONENT_STATES,
  FILE_EXTENSIONS,
  FOLDER_NAMES,
  SUMMARY_CONFIG,
  PACKAGE_PATTERNS,
  METADATA_PROPERTIES,
  TEMPLATE_STRINGS,
  ERROR_HANDLING,
  URL_REFERENCES
} from "./constants.mjs";
import { handleNonFatalError, withErrorHandling } from "./error-handling.mjs";
import { createScopedLogger } from "./logging-standards.mjs";

// --- Main

// Prefilter metadata by isHtmlTag
const filterByProps = { [METADATA_PROPERTIES.IS_HTML_TAG]: true };
const [components, ] = partitionMetadata(
  collectedComponentMetadata,
  filterByProps,
);

await generateComponents(components);

// --- Temporarily disabled
// const packagesMetadata = await dynamicallyLoadExtensionPackages();
// await generateExtenionPackages(packagesMetadata);

const mainLogger = createScopedLogger("DocsGenerator");

// --- Helpers

async function generateExtenionPackages(metadata) {
  mainLogger.operationStart("extension documentation generation");

  const extensionsConfig = await configManager.loadExtensionsConfig();
  const outputPaths = pathResolver.getOutputPaths();
  const outputFolder = outputPaths.extensions;
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
  await withErrorHandling(async () => {
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
  }, "extension packages metadata generation", ERROR_HANDLING.EXIT_CODES.FILE_NOT_FOUND);
}

async function generateComponents(metadata) {
  const componentsConfig = await configManager.loadComponentsConfig();
  const outputPaths = pathResolver.getOutputPaths();
  const outputFolder = outputPaths.components;

  const metadataGenerator = new DocsGenerator(
    metadata,
    {
      sourceFolder: pathResolver.resolvePath("xmlui/src/components", "workspace"),
      // --- CHANGE: Now documents are generated in the a new folder, outside of pages
      outFolder: outputFolder,
      // outFolder: join(FOLDERS.docsRoot, FOLDER_NAMES.PAGES, FOLDER_NAMES.COMPONENTS),
      examplesFolder: pathResolver.resolvePath("docs/component-samples", "workspace"),
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

  await metadataGenerator.createMetadataJsonForLanding(URL_REFERENCES.DOCS, "components");
}

// NOTE: Unused - we are not generating Html component docs
async function generateHtmlTagComponents(metadata) {
  const componentsConfig = await configManager.loadComponentsConfig();
  const outputPaths = pathResolver.getOutputPaths();
  const metadataGenerator = new DocsGenerator(
    metadata,
    {
      sourceFolder: pathResolver.resolvePath("xmlui/src/components", "project"),
      outFolder: outputPaths.pages + "/components",
      examplesFolder: pathResolver.resolvePath("docs/component-samples", "project"),
    },
    { excludeComponentStatuses: componentsConfig?.excludeComponentStatuses },
  );
  
}

async function cleanFolder(folderToClean) {
  const cleanLogger = createScopedLogger("FolderCleaner");
  cleanLogger.operationStart(`cleaning folder: ${basename(folderToClean)}`);

  if (!existsSync(folderToClean)) return;

  // NOTE: This is the important part: we only delete .mdx and .md files and the _meta.json
  const cleanCondition = (file) =>
    FILE_EXTENSIONS.MARKDOWN.includes(extname(file)) || basename(file) === FILE_EXTENSIONS.METADATA;
  
  await withErrorHandling(async () => {
    const files = await readdir(folderToClean);
    const unlinkPromises = files
      .filter(cleanCondition)
      .map((file) => unlink(join(folderToClean, file)));

    await Promise.all(unlinkPromises)
      .then(() => {
        cleanLogger.operationComplete("file deletion");
      })
      .catch((err) => {
        throw new ErrorWithSeverity(err.message, LOGGER_LEVELS.error);
      });
  }, "folder cleanup", ERROR_HANDLING.EXIT_CODES.FILE_NOT_FOUND);
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
  const packageLogger = createScopedLogger("PackageLoader");
  packageLogger.operationStart("loading extension packages");

  const defaultPackageState = COMPONENT_STATES.EXPERIMENTAL;
  const packagesFolder = pathResolver.resolvePath("packages", "workspace");
  const packagesMetadata = {};

  if (!existsSync(packagesFolder)) {
    packageLogger.operationComplete("no packages folder found");
    return packagesMetadata;
  }

  const packageFolders = await readdir(packagesFolder);
  const packagePromises = packageFolders.map(async (packageName) => {
    const packagePath = join(packagesFolder, packageName);
    const packageMeta = {};

    if (lstatSync(packagePath).isDirectory()) {
      const packageState = packageName === "xmlui" ? COMPONENT_STATES.INTERNAL : defaultPackageState;
      const distFolder = join(packagePath, "dist");
      const distMetadataFolder = join(distFolder, "metadata");

      if (existsSync(distMetadataFolder)) {
        // Try to load the metadata file
        const expectedMetadataFileName = `${packageName}${PACKAGE_PATTERNS.METADATA_SUFFIX}`;
        const metadataFile = join(distMetadataFolder, expectedMetadataFileName);

        if (existsSync(metadataFile)) {
          try {
            const metadata = await import(metadataFile);
            packageMeta.metadata = metadata.collectedComponentMetadata;
            packageMeta.sourceFolder = join(packagePath, "src/components");
            packageMeta.description = `Documentation for ${packageName}`;
            packageMeta.state = packageState;
          } catch (error) {
            packageLogger.error(`Failed to load metadata from ${metadataFile}`, error?.message || "unknown error");
          }
        }
      }
    }

    if (Object.keys(packageMeta).length > 0) {
      packagesMetadata[packageName] = packageMeta;
    }
  });

  await Promise.all(packagePromises);

  packageLogger.operationComplete(`loaded ${Object.keys(packagesMetadata).length} extension packages`);
  return packagesMetadata;
}

// --- Helpers

/**
 * Partitions an object's entries into two objects based on a predicate function.
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

function partitionMetadata(metadata, filterByProps) {
  const discriminator = (componentData) => {
    return Object.entries(filterByProps).every(([key, value]) => componentData[key] === value);
  };

  return partitionObject(metadata, discriminator);
}
