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

/**
 * Generates a ComponentRefLinks.txt file with NavLink elements for components
 * @param {Record<string, string>} componentsAndFileNames The components and their filenames
 */
async function generateComponentRefLinks(componentsAndFileNames) {
  const refLinksLogger = createScopedLogger("ComponentRefLinks");
  refLinksLogger.operationStart("generating ComponentRefLinks.txt");

  try {
    // Get component names (excluding the summary file)
    const componentNames = Object.keys(componentsAndFileNames)
      .filter(name => name !== SUMMARY_CONFIG.COMPONENTS.fileName)
      .sort();

    // Create NavLink elements for each component
    const navLinks = componentNames.map(componentName => 
      `<NavLink label="${componentName}" to="/components/${componentName}" />`
    );
    
    // Join with newlines
    const content = navLinks.join('\n');
    
    // Write to docs folder
    const outputPath = join(FOLDERS.docsRoot, 'ComponentRefLinks.txt');
    await writeFile(outputPath, content);
    
    refLinksLogger.operationComplete(`generated ComponentRefLinks.txt with ${componentNames.length} components`);
  } catch (error) {
    refLinksLogger.error("Failed to generate ComponentRefLinks.txt", error?.message || "unknown error");
  }
}

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
  
  // Generate ComponentRefLinks.txt with component names
  await generateComponentRefLinks(componentsAndFileNames);

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
        packageLogger.warn(`No dist folder found for package: ${dir}`);
        continue;
      }
      const distContents = await readdir(packageFolderDist);
      for (const file of distContents) {
        let filePath = join(packageFolderDist, file);
        if (filePath.endsWith(`${basename(dir)}${PACKAGE_PATTERNS.METADATA_SUFFIX}`) && existsSync(filePath)) {
          filePath = winPathToPosix(relative(FOLDERS.script, filePath));
          const { componentMetadata } = await import(filePath);
          if (!componentMetadata) {
            packageLogger.warn(`No metadata object found for package: ${basename(dir)}`);
            continue;
          }
          if (!componentMetadata.metadata) {
            packageLogger.warn(`No component metadata found for package: ${basename(dir)}`);
            continue;
          }

          extensionPackage.metadata = componentMetadata.metadata ?? {};
          extensionPackage.description = componentMetadata.description ?? "";
          extensionPackage.state = componentMetadata.state ?? defaultPackageState;
        }
      }
      // Ignore internal packages
      if (extensionPackage.state === COMPONENT_STATES.INTERNAL) {
        packageLogger.packageSkipped(dir, "internal package");
        continue;
      }
      packageLogger.packageLoaded(basename(dir));
      importedMetadata[basename(dir)] = extensionPackage;
    } catch (error) {
      handleNonFatalError(error, `loading extension package: ${basename(dir)}`);
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
