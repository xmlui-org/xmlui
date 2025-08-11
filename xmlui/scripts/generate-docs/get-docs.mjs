import { basename, join, extname, relative } from "path";
import { lstatSync } from "fs";
import { unlink, readdir, mkdir, writeFile, rm, readFile } from "fs/promises";
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
  URL_REFERENCES,
  COMPONENT_NAVIGATION,
  FILE_PATHS,
  PATH_CONSTANTS,
  TEXT_CONSTANTS,
  ERROR_CONTEXTS,
  COMPONENT_NAV_ERRORS
} from "./constants.mjs";
import { handleNonFatalError, withErrorHandling } from "./error-handling.mjs";

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

/**
 * Generates NavLink elements for components and replaces the generated content in Main.xmlui
 * @param {Record<string, string>} componentsAndFileNames The components and their filenames
 */
async function generateComponentRefLinks(componentsAndFileNames) {
  try {
    // Get component names (excluding the summary file)
    const componentNames = Object.keys(componentsAndFileNames)
      .filter(name => name !== SUMMARY_CONFIG.COMPONENTS.fileName)
      .sort();

    // Create NavLink elements for each component
    const componentNavLinks = componentNames.map(componentName => 
      COMPONENT_NAVIGATION.TEMPLATES.NAVLINK(componentName)
    );
    
    // Add the Components Overview link at the top
    const overviewNavLink = COMPONENT_NAVIGATION.TEMPLATES.OVERVIEW_NAVLINK(
      COMPONENT_NAVIGATION.OVERVIEW_LINK.LABEL,
      COMPONENT_NAVIGATION.OVERVIEW_LINK.TO
    );
    const allNavLinks = [overviewNavLink, ...componentNavLinks];
    
    // Join with newlines - store in memory instead of writing to file
    const navLinksContent = allNavLinks.join(TEXT_CONSTANTS.NEWLINE_SEPARATOR);
    
    // Find and display content between GENERATED CONTENT delimiters in Main.xmlui
    const { indentationDepth } = await findAndDisplayGeneratedContent();
    
    // Replace the generated content with the in-memory NavLinks content
    await replaceGeneratedContentInMainXmlui(navLinksContent, indentationDepth);
  } catch (error) {
    throw new Error(COMPONENT_NAV_ERRORS.COMPONENT_NAV_FAILED);
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
      .filter(name => name !== SUMMARY_CONFIG.COMPONENTS.fileName)
      .sort();

    // Log the number of components
    console.log(`Components Overview: ${componentNames.length} components`);

    // Create table header
    const tableHeader = `# ${summaryTitle} [#components-overview]

| Component | Description |
| :---: | --- |`;

    // Create table rows for each component from the original metadata
    const tableRows = componentNames.map(componentName => {
      // Get description from original metadata
      const originalMetadata = collectedComponentMetadata[componentName];
      const description = originalMetadata?.description || TEXT_CONSTANTS.NO_DESCRIPTION_AVAILABLE;
      
      // Format the table row with correct relative path
      return `| [${componentName}](./${componentName}) | ${description} |`;
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

async function generateExtenionPackages(metadata) {
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
  }, ERROR_CONTEXTS.EXTENSION_PACKAGES_METADATA, ERROR_HANDLING.EXIT_CODES.FILE_NOT_FOUND);
}

async function generateComponents(metadata) {
  const componentsConfig = await configManager.loadComponentsConfig();
  const outputPaths = pathResolver.getOutputPaths();
  const outputFolder = outputPaths.components;

  const metadataGenerator = new DocsGenerator(
    metadata,
    {
      sourceFolder: pathResolver.resolvePath(PATH_CONSTANTS.XMLUI_SRC_COMPONENTS, PATH_CONSTANTS.WORKSPACE),
      // --- CHANGE: Now documents are generated in the a new folder, outside of pages
      outFolder: outputFolder,
      // outFolder: join(FOLDERS.docsRoot, FOLDER_NAMES.PAGES, FOLDER_NAMES.COMPONENTS),
      examplesFolder: pathResolver.resolvePath(PATH_CONSTANTS.DOCS_COMPONENT_SAMPLES, PATH_CONSTANTS.WORKSPACE),
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
  
  await withErrorHandling(async () => {
    const files = await readdir(folderToClean);
    const unlinkPromises = files
      .filter(cleanCondition)
      .map((file) => unlink(join(folderToClean, file)));

    await Promise.all(unlinkPromises)
      .catch((err) => {
        throw new ErrorWithSeverity(err.message, LOGGER_LEVELS.error);
      });
  }, ERROR_CONTEXTS.FOLDER_CLEANUP, ERROR_HANDLING.EXIT_CODES.FILE_NOT_FOUND);
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
  const defaultPackageState = COMPONENT_STATES.EXPERIMENTAL;

  const extendedPackagesFolder = join(FOLDERS.projectRoot, PATH_CONSTANTS.PACKAGES);
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
        continue;
      }
      const distContents = await readdir(packageFolderDist);
      for (const file of distContents) {
        let filePath = join(packageFolderDist, file);
        if (filePath.endsWith(`${basename(dir)}${PACKAGE_PATTERNS.METADATA_SUFFIX}`) && existsSync(filePath)) {
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

  const lines = content.split('\n');
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
 * Replaces the content between GENERATED CONTENT delimiters in Main.xmlui with NavLink content
 * @param {string} navLinksContent - The NavLink content to insert
 * @param {number} indentationDepth - Number of spaces to indent each line
 */
async function replaceGeneratedContentInMainXmlui(navLinksContent, indentationDepth) {
  try {
    const mainXmluiPath = join(FOLDERS.docsRoot, FILE_PATHS.MAIN_XMLUI);
    
    if (!existsSync(mainXmluiPath)) {
      throw new Error(COMPONENT_NAV_ERRORS.MAIN_XMLUI_NOT_FOUND(mainXmluiPath));
    }

    // Read the Main.xmlui file
    const fileContent = await readFile(mainXmluiPath, TEXT_CONSTANTS.UTF8_ENCODING);
    
    // Define the delimiter patterns using regex
    const startDelimiterRegex = COMPONENT_NAVIGATION.DELIMITERS.START_REGEX;
    const endDelimiterRegex = COMPONENT_NAVIGATION.DELIMITERS.END_REGEX;
    
    const startMatch = fileContent.match(startDelimiterRegex);
    const endMatch = fileContent.match(endDelimiterRegex);
    
    if (!startMatch || !endMatch) {
      throw new Error(COMPONENT_NAV_ERRORS.DELIMITERS_NOT_FOUND);
    }
    
    const startIndex = startMatch.index;
    const endIndex = endMatch.index;
    
    // Create indented content from the in-memory NavLinks content
    const indentString = ' '.repeat(indentationDepth);
    const indentedLines = navLinksContent
      .split(TEXT_CONSTANTS.NEWLINE_SEPARATOR)
      .filter(line => line.trim().length > 0) // Remove empty lines
      .map(line => indentString + line);
    
    // Build the new content with proper formatting
    const newGeneratedContent = TEXT_CONSTANTS.NEWLINE_SEPARATOR + indentedLines.join(TEXT_CONSTANTS.NEWLINE_SEPARATOR) + TEXT_CONSTANTS.NEWLINE_SEPARATOR + indentString;
    
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
