import { basename, join, extname, relative } from "path";
import { lstatSync } from "fs";
import { unlink, readdir, mkdir, writeFile, rm, readFile } from "fs/promises";
import { ErrorWithSeverity, LOGGER_LEVELS, logger } from "./logger.mjs";
import { winPathToPosix, deleteFileIfExists, fromKebabtoReadable, createTable } from "./utils.mjs";
import { DocsGenerator } from "./DocsGenerator.mjs";
import { collectedComponentMetadata } from "../../dist/metadata/xmlui-metadata.js";
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
  URL_REFERENCES,
  COMPONENT_NAVIGATION,
  FILE_PATHS,
  PATH_CONSTANTS,
  TEXT_CONSTANTS,
  ERROR_CONTEXTS,
  COMPONENT_NAV_ERRORS,
  EXTENSIONS_NAVIGATION,
  DOCS_COMPONENTS_PATH,
} from "./constants.mjs";
import { handleNonFatalError, withErrorHandling } from "./error-handling.mjs";

// --- Main

// Prefilter metadata by isHtmlTag
const filterByProps = { [METADATA_PROPERTIES.IS_HTML_TAG]: true };
const [components] = partitionMetadata(collectedComponentMetadata, filterByProps);

await cleanupLegacyGeneratedDocsFolders();
await generateComponents(components);

// --- Extensions
const extensionsConfig = await configManager.loadExtensionsConfig();
const packagesMetadata = await dynamicallyLoadExtensionPackages(extensionsConfig);
await generateExtensionPackages(packagesMetadata, extensionsConfig);

/**
 * Generates JSON structure for components and writes to components.json
 * @param {Record<string, string>} componentsAndFileNames The components and their filenames
 */
async function generateComponentRefLinks(
  componentsAndFileNames,
  navConfigObj = COMPONENT_NAVIGATION,
) {
  try {
    // Get component names (excluding the summary file)
    const componentNames = Object.keys(componentsAndFileNames)
      .filter((name) => name !== SUMMARY_CONFIG.COMPONENTS.fileName)
      .sort();

    // Create JSON structure for each component
    const componentNavLinks = componentNames.map((componentName) => ({
      to: `/docs/reference/components/${componentName}`,
      label: componentName,
      icon: "component",
    }));

    // Add the Components Overview link at the top
    const allChildren = [
      navConfigObj.OVERVIEW_LINK
        ? {
            to: navConfigObj.OVERVIEW_LINK.TO,
            label: navConfigObj.OVERVIEW_LINK.LABEL,
            icon: "component",
          }
        : null,
      ...componentNavLinks,
    ].filter(Boolean);

    // Create the full JSON structure
    const componentsJson = {
      items: [
        {
          label: "Components",
          to: "/docs/reference/components",
          description: "Browse all built-in XMLUI components.",
          icon: "component",
          children: allChildren,
        },
      ],
    };

    // Write to components.json file
    await writeComponentsJson(componentsJson);
  } catch (error) {
    throw new Error(COMPONENT_NAV_ERRORS.COMPONENT_NAV_FAILED, { cause: error });
  }
}

/**
 * Writes the components JSON structure to components.json file
 * @param {object} componentsJson - The JSON structure to write
 */
async function writeComponentsJson(componentsJson) {
  try {
    const componentsJsonPath = join(FOLDERS.navSections, FILE_PATHS.COMPONENTS_JSON);
    await writeFile(
      componentsJsonPath,
      JSON.stringify(componentsJson, null, 2),
      TEXT_CONSTANTS.UTF8_ENCODING,
    );
    logger.info(`Successfully updated components.json at ${componentsJsonPath}`);
  } catch (error) {
    throw new Error(`Failed to write components.json: ${error.message}`);
  }
}

/**
 * Writes the extensions JSON structure to extensions.json file
 * @param {object} extensionsJson - The JSON structure to write
 */
async function writeExtensionsJson(extensionsJson) {
  try {
    const extensionsJsonPath = join(FOLDERS.navSections, FILE_PATHS.EXTENSIONS_JSON);
    await writeFile(
      extensionsJsonPath,
      JSON.stringify(extensionsJson, null, 2),
      TEXT_CONSTANTS.UTF8_ENCODING,
    );
    logger.info(`Successfully updated extensions.json at ${extensionsJsonPath}`);
  } catch (error) {
    throw new Error(`Failed to write extensions.json: ${error.message}`);
  }
}


/**
 * Generates a comprehensive components overview file with a table of all components
 * @param {string} overviewFile - Path to the overview file to generate
 * @param {string} summaryTitle - Title for the overview section
 * @param {object} componentsAndFileNames - Object containing component metadata
 */
async function generateComponentsOverview(overviewFile, summaryTitle, componentsAndFileNames) {
  try {
    // Get component names (excluding the summary file)
    const componentNames = Object.keys(componentsAndFileNames)
      .filter((name) => name !== SUMMARY_CONFIG.COMPONENTS.fileName)
      .sort();

    // Log the number of components
    logger.info(`Components Overview: ${componentNames.length} components`);

    // Create table header
    const tableHeader = `# ${summaryTitle} [#components-overview]

| Component | Description |
| :---: | --- |`;

    // Create table rows for each component from the original metadata
    const tableRows = componentNames.map((componentName) => {
      // Get description from original metadata
      const originalMetadata = collectedComponentMetadata[componentName];
      const description = originalMetadata?.description || TEXT_CONSTANTS.NO_DESCRIPTION_AVAILABLE;

      // Format the table row with correct relative path
      return `| [${componentName}](/${DOCS_COMPONENTS_PATH}/${componentName}) | ${description} |`;
    });

    // Combine header and rows
    const tableContent = [tableHeader, ...tableRows].join(TEXT_CONSTANTS.NEWLINE_SEPARATOR);

    // Write to file
    await writeFile(overviewFile, tableContent);
  } catch (error) {
    throw new Error(COMPONENT_NAV_ERRORS.OVERVIEW_GENERATION_FAILED);
  }
}

// --- Helpers

async function generateExtensionPackages(metadata, extensionsConfig) {
  const outputPaths = pathResolver.getOutputPaths();
  const extensionsFolder = outputPaths.extensions;

  const extensionNamesAndCompNames = [];
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

    extensionNamesAndCompNames.push({
      packageName,
      fileNames: Object.keys(componentsAndFileNames).filter(
        (n) => SUMMARY_CONFIG.EXTENSIONS.fileName !== n,
      ),
    });
  }

  // Create JSON structure for extensions
  const extensionGroups = extensionNamesAndCompNames.map((ext) => {
    logger.info(`Generating JSON for Extension Package: ${ext.packageName}`);

    const compLinks = ext.fileNames.map((compName) => ({
      label: compName,
      to: `/docs/reference/extensions/${ext.packageName}/${compName}`,
    }));

    // Add the Extensions Overview link at the top
    const children = [
      {
        label: EXTENSIONS_NAVIGATION.OVERVIEW_LINK.LABEL,
        to: EXTENSIONS_NAVIGATION.OVERVIEW_LINK.TO(ext.packageName),
      },
      ...compLinks,
    ];

    return {
      label: fromKebabtoReadable(ext.packageName),
      to: EXTENSIONS_NAVIGATION.OVERVIEW_LINK.TO(ext.packageName),
      children,
    };
  });

  // Create the full JSON structure for extensions wrapped in a top-level group
  const extensionsJson = {
    items: [
      {
        label: "Extensions",
        icon: "puzzle",
        to: "/docs/reference/extensions/",
        children: extensionGroups,
      },
    ],
  };

  // Write to extensions.json file
  await writeExtensionsJson(extensionsJson);
}

async function cleanupLegacyGeneratedDocsFolders() {
  const legacyFolders = [
    pathResolver.resolvePath("website/content/docs/components", "workspace"),
    pathResolver.resolvePath("website/content/docs/extensions", "workspace"),
  ];

  for (const legacyFolder of legacyFolders) {
    if (!existsSync(legacyFolder)) {
      continue;
    }
    await rm(legacyFolder, { recursive: true, force: true });
  }
}

async function generateComponents(metadata) {
  const componentsConfig = await configManager.loadComponentsConfig();
  const outputPaths = pathResolver.getOutputPaths();
  const outputFolder = outputPaths.components;

  const metadataGenerator = new DocsGenerator(
    metadata,
    {
      sourceFolder: pathResolver.resolvePath(
        PATH_CONSTANTS.XMLUI_SRC_COMPONENTS,
        PATH_CONSTANTS.WORKSPACE,
      ),
      // --- CHANGE: Now documents are generated in the a new folder, outside of pages
      outFolder: outputFolder,
    },
    { excludeComponentStatuses: componentsConfig?.excludeComponentStatuses },
  );

  if (componentsConfig?.cleanFolder) {
    await cleanFolder(outputFolder);
  }

  let componentsAndFileNames = metadataGenerator.generateDocs();

  // Generate ComponentRefLinks.txt with component names
  await generateComponentRefLinks(componentsAndFileNames);

  const summaryTitle = SUMMARY_CONFIG.COMPONENTS.title;
  const summaryFileName = SUMMARY_CONFIG.COMPONENTS.fileName;
  await metadataGenerator.exportMetadataToJson(FOLDER_NAMES.COMPONENTS);
  componentsAndFileNames = insertKeyAt(summaryFileName, summaryTitle, componentsAndFileNames, 0);

  // Generate the overview file for components
  const overviewFile = join(outputFolder, `${summaryFileName}.md`);
  await generateComponentsOverview(overviewFile, summaryTitle, componentsAndFileNames);

  await metadataGenerator.generatePermalinksForHeaders();

  await metadataGenerator.createMetadataJsonForLanding(URL_REFERENCES.DOCS, "components");
}

async function cleanFolder(folderToClean) {
  if (!existsSync(folderToClean)) return;

  // NOTE: This is the important part: we only delete .mdx and .md files and the _meta.json
  const cleanCondition = (file) =>
    FILE_EXTENSIONS.MARKDOWN.includes(extname(file)) || basename(file) === FILE_EXTENSIONS.METADATA;

  await withErrorHandling(
    async () => {
      const files = await readdir(folderToClean);
      const unlinkPromises = files
        .filter(cleanCondition)
        .map((file) => unlink(join(folderToClean, file)));

      await Promise.all(unlinkPromises).catch((err) => {
        throw new ErrorWithSeverity(err.message, LOGGER_LEVELS.error);
      });
    },
    ERROR_CONTEXTS.FOLDER_CLEANUP,
    ERROR_HANDLING.EXIT_CODES.FILE_NOT_FOUND,
  );
}

/**
 * Dynamically loads extension package metadata from the `packages` folder.
 * Loading of metadata is only possible if the package has a `dist` folder
 * and is built using the `build:meta` script which produces a {file-name}-metadata.js file.
 * To do this, the package must export a `componentMetadata` object in the `meta` folder containing:
 * - name: The name of the package
 * - description: A brief description of the package
 * - metadata: An object containing component metadata
 * - state: The state of the package (e.g., "experimental", "stable", "internal")
 *
 * @param {object} extensionsConfig Configuration object for extensions
 * @returns {Promise<Record<
 *  string,
 *  { sourceFolder: string, description: string, metadata: Record<string, any> }
 * >>} imported metadata
 */
async function dynamicallyLoadExtensionPackages(extensionsConfig) {
  const defaultPackageState = COMPONENT_STATES.EXPERIMENTAL;

  // --- Find all packages in the `packages` folder that start with xmlui- OR are listed in the config
  const extensionPackagesFolder = join(FOLDERS.projectRoot, PATH_CONSTANTS.PACKAGES);
  let packageDirectories = [];
  if (!!extensionsConfig?.includeByName && extensionsConfig.includeByName.length > 0) {
    packageDirectories = extensionsConfig.includeByName
      .map((name) => join(extensionPackagesFolder, name))
      .filter((dir) => existsSync(dir) && lstatSync(dir).isDirectory());
  } else {
    packageDirectories = (await readdir(extensionPackagesFolder))
      .filter((entry) => {
        return (
          entry.startsWith(PACKAGE_PATTERNS.XMLUI_PREFIX) &&
          lstatSync(join(extensionPackagesFolder, entry)).isDirectory()
        );
      })
      .map((dir) => join(extensionPackagesFolder, dir));
  }
  if (extensionsConfig?.excludeByName && extensionsConfig.excludeByName.length > 0) {
    packageDirectories = packageDirectories.filter(
      (dir) => !extensionsConfig?.excludeByName?.includes(basename(dir)),
    );
  }

  const importedMetadata = {};
  for (let dir of packageDirectories) {
    const extensionPackage = {
      sourceFolder: dir, //join(dir, FOLDER_NAMES.SRC),
      description: "",
      metadata: {},
      state: defaultPackageState,
    };
    try {
      const packageFolderDist = join(dir, FOLDER_NAMES.DIST);
      if (!existsSync(packageFolderDist)) {
        continue;
      }
      const distContents = await readdir(packageFolderDist);
      for (const file of distContents) {
        let filePath = join(packageFolderDist, file);
        if (
          filePath.endsWith(`${basename(dir)}${PACKAGE_PATTERNS.METADATA_SUFFIX}`) &&
          existsSync(filePath)
        ) {
          filePath = winPathToPosix(relative(FOLDERS.script, filePath));
          const { componentMetadata } = await import(filePath);
          if (!componentMetadata) {
            continue;
          }
          if (!componentMetadata.metadata) {
            continue;
          }

          extensionPackage.metadata = componentMetadata.metadata ?? {};
          extensionPackage.description = componentMetadata.description ?? "";
          extensionPackage.state = componentMetadata.state ?? defaultPackageState;
        }
      }
      // Ignore internal packages
      if (extensionPackage.state === COMPONENT_STATES.INTERNAL) {
        continue;
      }
      importedMetadata[basename(dir)] = extensionPackage;
    } catch (error) {
      handleNonFatalError(error, `${ERROR_CONTEXTS.LOADING_EXTENSION_PACKAGE}: ${basename(dir)}`);
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
