import { basename, join, extname, relative } from "path";
import { lstatSync } from "fs";
import { unlink, readdir, mkdir, writeFile, rm, readFile } from "fs/promises";
import { ErrorWithSeverity, LOGGER_LEVELS, logger } from "./logger.mjs";
import { winPathToPosix, deleteFileIfExists, fromKebabtoReadable, createTable } from "./utils.mjs";
import { DocsGenerator } from "./DocsGenerator.mjs";
import { collectedComponentMetadata } from "../../dist/metadata/xmlui-metadata.js";
import { getAllIconNames } from "../../dist/metadata/icons.js";
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
  ICONS_NAVIGATION,
} from "./constants.mjs";
import { handleNonFatalError, withErrorHandling } from "./error-handling.mjs";

// --- Main

// Prefilter metadata by isHtmlTag
const filterByProps = { [METADATA_PROPERTIES.IS_HTML_TAG]: true };
const [components] = partitionMetadata(collectedComponentMetadata, filterByProps);

await cleanupLegacyGeneratedDocsFolders();
await generateComponents(components);
generateIconNames();

// --- Extensions
const extensionsConfig = await configManager.loadExtensionsConfig();
const packagesMetadata = await dynamicallyLoadExtensionPackages(extensionsConfig);
await generateExtensionPackages(packagesMetadata, extensionsConfig);

// --- Context Variables Summary
await generateContextVariablesSummary();

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
      to: `/components/${componentName}`,
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
          to: "/reference/components",
          description: "Browse all built-in XMLUI components.",
          icon: "component",
          children: allChildren,
        },
      ],
    };

    // Write to components.json file
    await writeComponentsJson(componentsJson);
  } catch (error) {
    throw new Error(COMPONENT_NAV_ERRORS.COMPONENT_NAV_FAILED);
  }
}

/**
 * Writes the components JSON structure to components.json file
 * @param {object} componentsJson - The JSON structure to write
 */
async function writeComponentsJson(componentsJson) {
  try {
    const componentsJsonPath = join(FOLDERS.navSections, FILE_PATHS.COMPONENTS_JSON);
    await writeFile(componentsJsonPath, JSON.stringify(componentsJson, null, 2), TEXT_CONSTANTS.UTF8_ENCODING);
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
    await writeFile(extensionsJsonPath, JSON.stringify(extensionsJson, null, 2), TEXT_CONSTANTS.UTF8_ENCODING);
    logger.info(`Successfully updated extensions.json at ${extensionsJsonPath}`);
  } catch (error) {
    throw new Error(`Failed to write extensions.json: ${error.message}`);
  }
}

/**
 * Finds and displays the content between GENERATED CONTENT delimiters in Main.xmlui
 */
async function findAndDisplayGeneratedContent() {
  try {
    const mainXmluiPath = join(FOLDERS.docsRoot, FILE_PATHS.MAIN_XMLUI);

    if (!existsSync(mainXmluiPath)) {
      throw new Error(COMPONENT_NAV_ERRORS.MAIN_XMLUI_NOT_FOUND(mainXmluiPath));
    }

    const fileContent = await readFile(mainXmluiPath, TEXT_CONSTANTS.UTF8_ENCODING);

    // Define the delimiter patterns using regex
    const startDelimiterRegex = COMPONENT_NAVIGATION.DELIMITERS.START_REGEX;
    const endDelimiterRegex = COMPONENT_NAVIGATION.DELIMITERS.END_REGEX;

    const startMatch = fileContent.match(startDelimiterRegex);
    const endMatch = fileContent.match(endDelimiterRegex);

    if (!startMatch) {
      throw new Error(COMPONENT_NAV_ERRORS.START_DELIMITER_NOT_FOUND);
    }

    if (!endMatch) {
      throw new Error(COMPONENT_NAV_ERRORS.END_DELIMITER_NOT_FOUND);
    }

    const startIndex = startMatch.index;
    const endIndex = endMatch.index;

    if (startIndex >= endIndex) {
      throw new Error(COMPONENT_NAV_ERRORS.INVALID_DELIMITER_ORDER);
    }

    // Extract content between delimiters (excluding the delimiters themselves)
    const generatedContentStart = startIndex + startMatch[0].length;
    const generatedContent = fileContent.substring(generatedContentStart, endIndex);

    // Calculate indentation depth
    const indentationDepth = calculateIndentationDepth(generatedContent);

    return { indentationDepth };
  } catch (error) {
    return { indentationDepth: 0 };
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
      return `| [${componentName}](/docs/reference/components/${componentName}) | ${description} |`;
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
      to: `/extensions/${ext.packageName}/${compName}`,
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
      children,
    };
  });

  // Create the full JSON structure for extensions wrapped in a top-level group
  const extensionsJson = {
    items: [
      {
        label: "Extensions",
        icon: "puzzle",
        children: extensionGroups,
      },
    ],
  };

  // Write to extensions.json file
  await writeExtensionsJson(extensionsJson);

  // generate a _meta.json for the folder names
  await withErrorHandling(
    async () => {
      const extensionPackagesMetafile = join(extensionsFolder, FILE_EXTENSIONS.METADATA);

      const folderNames = Object.fromEntries(
        Object.keys(metadata)
          .filter((m) => !unlistedFolders.includes(m))
          .map((name) => {
            return [name, `${fromKebabtoReadable(name)} Package`];
          }),
      );

      /* const existingMeta = JSON.parse(readFileSync(extensionPackagesMetafile, "utf-8"));
      const updatedMeta = Object.entries(folderNames).reduce((acc, [key, value], idx) => {
        return insertKeyAt(key, value, acc, Object.keys(acc).length === 0 ? 0 : idx + 1);
      }, existingMeta || {}); */

      // Do not include the summary file in the _meta.json
      deleteFileIfExists(extensionPackagesMetafile);
      await writeFile(extensionPackagesMetafile, JSON.stringify(folderNames, null, 2));
    },
    ERROR_CONTEXTS.EXTENSION_PACKAGES_METADATA,
    ERROR_HANDLING.EXIT_CODES.FILE_NOT_FOUND,
  );
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
      // outFolder: join(FOLDERS.docsRoot, FOLDER_NAMES.PAGES, FOLDER_NAMES.COMPONENTS),
      examplesFolder: pathResolver.resolvePath(
        PATH_CONSTANTS.DOCS_COMPONENT_SAMPLES,
        PATH_CONSTANTS.WORKSPACE,
      ),
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

  // Generate the overview file for components
  const overviewFile = join(outputFolder, `${summaryFileName}.md`);
  await generateComponentsOverview(overviewFile, summaryTitle, componentsAndFileNames);

  metadataGenerator.writeMetaSummary(componentsAndFileNames, outputFolder);

  await metadataGenerator.generatePermalinksForHeaders();

  await metadataGenerator.createMetadataJsonForLanding(URL_REFERENCES.DOCS, "components");
}

async function generateIconNames() {
  try {
    // Get all icon names from the built icons.js file
    const iconNames = getAllIconNames();
    
    // Sort the icon names alphabetically
    const sortedIconNames = iconNames.sort();
    
    // Generate the var tag with the array of icon names
    // Use single quotes for strings inside the array to avoid conflicts with the attribute's double quotes
    const iconNamesArray = JSON.stringify(sortedIconNames, null, 2)
      .replace(/"/g, "'") // Replace double quotes with single quotes
      .replace(/^/gm, '  ') // Indent each line by 2 spaces
      .trim();
    
    const varTag = `<variable name="names" value="{${iconNamesArray}}" />`;
    
    // Read the Icons.xmlui file to find indentation
    const iconsXmluiPath = join(FOLDERS.docsRoot, FILE_PATHS.ICONS_XMLUI);
    
    if (!existsSync(iconsXmluiPath)) {
      logger.warn(`Icons.xmlui file not found at ${iconsXmluiPath}`);
      return;
    }
    
    const fileContent = await readFile(iconsXmluiPath, TEXT_CONSTANTS.UTF8_ENCODING);
    
    // Find the content between delimiters to get indentation
    const startDelimiterRegex = ICONS_NAVIGATION.DELIMITERS.START_REGEX;
    const endDelimiterRegex = ICONS_NAVIGATION.DELIMITERS.END_REGEX;
    
    const startMatch = fileContent.match(startDelimiterRegex);
    const endMatch = fileContent.match(endDelimiterRegex);
    
    if (!startMatch || !endMatch) {
      logger.warn('Icon names delimiters not found in Icons.xmlui');
      return;
    }
    
    const startIndex = startMatch.index;
    const endIndex = endMatch.index;
    const generatedContentStart = startIndex + startMatch[0].length;
    const generatedContent = fileContent.substring(generatedContentStart, endIndex);
    
    // Calculate indentation depth
    const indentationDepth = calculateIndentationDepth(generatedContent);
    
    // Replace the generated content
    await replaceGeneratedContentInIconsXmlui(varTag, indentationDepth);
    
    logger.info(`Generated ${sortedIconNames.length} icon names in Icons.xmlui`);
  } catch (error) {
    logger.error(`Failed to generate icon names: ${error.message}`);
  }
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

/**
 * Calculates the indentation depth of content by finding the minimum leading whitespace
 * @param {string} content - The content to analyze
 * @returns {number} The number of whitespace characters representing the indentation depth
 */
function calculateIndentationDepth(content) {
  if (!content || content.trim().length === 0) {
    return 0;
  }

  const lines = content.split("\n");
  let minIndentation = Infinity;

  for (const line of lines) {
    // Skip empty lines
    if (line.trim().length === 0) {
      continue;
    }

    // Count leading whitespace characters
    const leadingWhitespace = line.match(/^(\s*)/)[1];
    const indentationCount = leadingWhitespace.length;

    // Track minimum indentation
    if (indentationCount < minIndentation) {
      minIndentation = indentationCount;
    }
  }

  // Return 0 if no lines had content or all lines were empty
  return minIndentation === Infinity ? 0 : minIndentation;
}

/**
 * Replaces the content between GENERATED CONTENT delimiters in Icons.xmlui with icon names
 * @param {string} content - The content to insert
 * @param {number} indentationDepth - Number of spaces to indent each line
 */
async function replaceGeneratedContentInIconsXmlui(content, indentationDepth) {
  try {
    const iconsXmluiPath = join(FOLDERS.docsRoot, FILE_PATHS.ICONS_XMLUI);

    if (!existsSync(iconsXmluiPath)) {
      throw new Error(`Icons.xmlui file not found at ${iconsXmluiPath}`);
    }

    // Read the Icons.xmlui file
    const fileContent = await readFile(iconsXmluiPath, TEXT_CONSTANTS.UTF8_ENCODING);

    // Define the delimiter patterns using regex
    const startDelimiterRegex = ICONS_NAVIGATION.DELIMITERS.START_REGEX;
    const endDelimiterRegex = ICONS_NAVIGATION.DELIMITERS.END_REGEX;

    const startMatch = fileContent.match(startDelimiterRegex);
    const endMatch = fileContent.match(endDelimiterRegex);

    if (!startMatch || !endMatch) {
      throw new Error('Icon names delimiters not found in Icons.xmlui');
    }

    const startIndex = startMatch.index;
    const endIndex = endMatch.index;

    // Create indented content
    const indentString = " ".repeat(indentationDepth);
    const indentedContent = indentString + content;

    // Build the new content with proper formatting
    const newGeneratedContent =
      TEXT_CONSTANTS.NEWLINE_SEPARATOR +
      indentedContent +
      TEXT_CONSTANTS.NEWLINE_SEPARATOR +
      indentString;

    // Replace the content between delimiters
    const beforeDelimiter = fileContent.substring(0, startIndex + startMatch[0].length);
    const afterDelimiter = fileContent.substring(endIndex);
    const newFileContent = beforeDelimiter + newGeneratedContent + afterDelimiter;

    // Write the updated content back to the file
    await writeFile(iconsXmluiPath, newFileContent, TEXT_CONSTANTS.UTF8_ENCODING);
  } catch (error) {
    throw new Error(`Failed to replace icon names content: ${error.message}`);
  }
}

/**
 * Replaces the content between GENERATED CONTENT delimiters in Main.xmlui with NavLink content
 * @param {string} navLinksContent - The NavLink content to insert
 * @param {number} indentationDepth - Number of spaces to indent each line
 */
async function replaceGeneratedContentInMainXmlui(
  navLinksContent,
  indentationDepth,
  NavConfigObj = COMPONENT_NAVIGATION,
) {
  try {
    const mainXmluiPath = join(FOLDERS.docsRoot, FILE_PATHS.MAIN_XMLUI);

    if (!existsSync(mainXmluiPath)) {
      throw new Error(COMPONENT_NAV_ERRORS.MAIN_XMLUI_NOT_FOUND(mainXmluiPath));
    }

    // Read the Main.xmlui file
    const fileContent = await readFile(mainXmluiPath, TEXT_CONSTANTS.UTF8_ENCODING);

    // Define the delimiter patterns using regex
    const startDelimiterRegex = NavConfigObj.DELIMITERS.START_REGEX;
    const endDelimiterRegex = NavConfigObj.DELIMITERS.END_REGEX;

    const startMatch = fileContent.match(startDelimiterRegex);
    const endMatch = fileContent.match(endDelimiterRegex);

    if (!startMatch || !endMatch) {
      throw new Error(COMPONENT_NAV_ERRORS.DELIMITERS_NOT_FOUND);
    }

    const startIndex = startMatch.index;
    const endIndex = endMatch.index;

    // Create indented content from the in-memory NavLinks content
    const indentString = " ".repeat(indentationDepth);
    const indentedLines = navLinksContent
      .split(TEXT_CONSTANTS.NEWLINE_SEPARATOR)
      .filter((line) => line.trim().length > 0) // Remove empty lines
      .map((line) => indentString + line);

    // Build the new content with proper formatting
    const newGeneratedContent =
      TEXT_CONSTANTS.NEWLINE_SEPARATOR +
      indentedLines.join(TEXT_CONSTANTS.NEWLINE_SEPARATOR) +
      TEXT_CONSTANTS.NEWLINE_SEPARATOR +
      indentString;

    // Replace the content between delimiters
    const beforeDelimiter = fileContent.substring(0, startIndex + startMatch[0].length);
    const afterDelimiter = fileContent.substring(endIndex);
    const newFileContent = beforeDelimiter + newGeneratedContent + afterDelimiter;

    // Write the updated content back to the file
    await writeFile(mainXmluiPath, newFileContent, TEXT_CONSTANTS.UTF8_ENCODING);
  } catch (error) {
    throw new Error(COMPONENT_NAV_ERRORS.CONTENT_REPLACEMENT_FAILED);
  }
}

/**
 * Generates a comprehensive context variables summary page
 */
async function generateContextVariablesSummary() {
  logger.info("Generating context variables summary...");

  // Collect all context variables from all components
  const contextVarsByName = new Map();

  // Iterate through all components
  for (const [componentName, componentData] of Object.entries(collectedComponentMetadata)) {
    // Skip if component has no context variables
    if (!componentData.contextVars || Object.keys(componentData.contextVars).length === 0) {
      continue;
    }

    // Process each context variable in this component
    for (const [varName, varData] of Object.entries(componentData.contextVars)) {
      // Skip internal context variables
      if (varData.isInternal) {
        continue;
      }

      // Initialize the context variable entry if it doesn't exist
      if (!contextVarsByName.has(varName)) {
        contextVarsByName.set(varName, {
          name: varName,
          occurrences: [],
        });
      }

      // Add this component as an occurrence
      const varEntry = contextVarsByName.get(varName);
      varEntry.occurrences.push({
        componentName,
        description: varData.description || "No description provided",
      });
    }
  }

  // Sort context variables by name
  const sortedContextVars = Array.from(contextVarsByName.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Generate the markdown content
  let markdown = generateContextVarsMarkdown(sortedContextVars);

  // Write to file
  const outputPath = join(FOLDERS.docsRoot, "content", "pages", "context-variables2.md");
  await writeFile(outputPath, markdown, "utf8");

  logger.info(`Context variables summary generated: ${outputPath}`);
  logger.info(`Total unique context variables: ${sortedContextVars.length}`);
}

/**
 * Generates the markdown content for the context variables summary
 * @param {Array} contextVars Array of context variable objects
 * @returns {string} Markdown content
 */
function generateContextVarsMarkdown(contextVars) {
  let markdown = "";

  // Add header
  markdown += "# Context Variables Summary\n\n";
  markdown += "This page provides a comprehensive overview of all context variables exposed by XMLUI components. ";
  markdown += "Context variables are values that components make available to their children, accessible using the `$variableName` syntax.\n\n";

  // Add table of contents
  markdown += "## Available Context Variables\n\n";
  markdown += "Jump to:\n\n";
  for (const contextVar of contextVars) {
    const anchor = contextVar.name.toLowerCase().replace(/\$/g, "").replace(/[^a-z0-9-]/g, "-");
    markdown += `- [\`${contextVar.name}\`](#${anchor})\n`;
  }
  markdown += "\n---\n\n";

  // Generate section for each context variable
  for (const contextVar of contextVars) {
    markdown += generateContextVarSection(contextVar);
  }

  return markdown;
}

/**
 * Generates a section for a single context variable
 * @param {object} contextVar Context variable object with name and occurrences
 * @returns {string} Markdown section
 */
function generateContextVarSection(contextVar) {
  let section = "";
  const anchor = contextVar.name.toLowerCase().replace(/\$/g, "").replace(/[^a-z0-9-]/g, "-");

  // Add context variable name as heading
  section += `## \`${contextVar.name}\` [#${anchor}]\n\n`;

  // Generate summary description
  const summary = generateSummaryDescription(contextVar);
  section += `${summary}\n\n`;

  // Add "Used by" info
  if (contextVar.occurrences.length === 1) {
    section += `**Used by:** 1 component\n\n`;
  } else {
    section += `**Used by:** ${contextVar.occurrences.length} components\n\n`;
  }

  // Sort occurrences by component name
  const sortedOccurrences = contextVar.occurrences.sort((a, b) =>
    a.componentName.localeCompare(b.componentName)
  );

  // Create table of components that expose this context variable
  const tableRows = sortedOccurrences.map((occurrence) => {
    const componentLink = `[${occurrence.componentName}](/components/${occurrence.componentName})`;
    return [componentLink, occurrence.description];
  });

  const table = createTable({
    headers: ["Component", "Description"],
    rows: tableRows,
  });

  section += table;
  section += "\n";

  return section;
}

/**
 * Generates a summary description based on the occurrences
 * @param {object} contextVar Context variable object
 * @returns {string} Summary description
 */
function generateSummaryDescription(contextVar) {
  // If all components have the same description, use it
  const descriptions = contextVar.occurrences.map((occ) => occ.description);
  const uniqueDescriptions = [...new Set(descriptions)];

  if (uniqueDescriptions.length === 1) {
    return uniqueDescriptions[0];
  }

  // If descriptions vary, generate a generic summary
  const varNameWithoutDollar = contextVar.name.replace(/^\$/, "");
  
  // Try to infer what the variable represents based on its name
  if (varNameWithoutDollar.toLowerCase().includes("item")) {
    return `Provides access to the current item being rendered in a list or iteration context.`;
  } else if (varNameWithoutDollar.toLowerCase().includes("index")) {
    return `Provides the index of the current item in an iteration or list context.`;
  } else if (varNameWithoutDollar.toLowerCase().includes("value")) {
    return `Provides access to the current value in the component's context.`;
  } else if (varNameWithoutDollar.toLowerCase().includes("state")) {
    return `Provides access to the current state of the component.`;
  } else if (varNameWithoutDollar.toLowerCase().includes("data")) {
    return `Provides access to data exposed by the component.`;
  } else {
    return `Context variable exposed by the following components. See individual component descriptions for details.`;
  }
}
