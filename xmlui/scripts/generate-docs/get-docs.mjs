import { basename, join, extname, relative } from "path";
import { lstatSync } from "fs";
import { writeFileSync } from "fs";
import { unlink, readdir, readFile, mkdir } from "fs/promises";
import { ErrorWithSeverity, logger, LOGGER_LEVELS, processError } from "./logger.mjs";
import {
  convertPath,
  deleteFileIfExists,
  fromKebabtoReadable,
} from "./utils.mjs";
import { DocsGenerator } from "./DocsGenerator.mjs";
import { collectedComponentMetadata } from "../../dist/xmlui-metadata.mjs";
import { FOLDERS } from "./folders.mjs";
import { existsSync } from "fs";

// --- Main

// Prefilter metadata by isHtmlTag
const filterByProps = { isHtmlTag: true };
const [components, htmlTagComponents] = partitionMetadata(
  collectedComponentMetadata,
  filterByProps,
);

await generateHtmlTagComponents(htmlTagComponents);

await generateComponents(components);

const packagesMetadata = await dynamicallyLoadExtensionPackages();
await generateExtenionPackages(packagesMetadata);

// --- Helpers

async function generateExtenionPackages(metadata) {
  const extensionsConfig = await loadConfig(join(FOLDERS.script, "extensions-config.json"));

  const extensionsFolder = join(FOLDERS.pages, "extension-components");
  for (const packageName in metadata) {
    // Just to be sure we don't generate anything internal
    if (metadata[packageName].state === "internal") {
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
        examplesFolder: join(FOLDERS.docsRoot, "component-samples"),
      },
      { excludeComponentStatuses: extensionsConfig?.excludeComponentStatuses },
    );

    if (extensionsConfig?.cleanFolder) {
      await cleanFolder(packageFolder);
    }

    extensionGenerator.generateDocs();

    // In both of these cases, we are writing to the same file
    const indexFile = join(extensionsFolder, `${packageName}.mdx`);
    deleteFileIfExists(indexFile);

    await extensionGenerator.generatePackageDescription(
      metadata[packageName].description,
      `${fromKebabtoReadable(packageName)} Package`,
      indexFile,
    );

    // Create summary and index file for extension package
    await extensionGenerator.generateComponentsSummary(`Package Components`, indexFile, false);
  }

  // generate a _meta.json for the folder names
  try {
    const extensionPackagesMetafile = join(FOLDERS.pages, "extension-components", "_meta.json");

    const folderNames = Object.fromEntries(
      Object.keys(metadata).map((name) => {
        return [name, fromKebabtoReadable(name)];
      }),
    );

    // Do not include the summary file
    deleteFileIfExists(extensionPackagesMetafile);
    writeFileSync(extensionPackagesMetafile, JSON.stringify(folderNames, null, 2));
  } catch (e) {
    logger.error("Could not write _meta file: ", e?.message || "unknown error");
  }
}

async function generateComponents(metadata) {
  const componentsConfig = await loadConfig(join(FOLDERS.script, "components-config.json"));
  const metadataGenerator = new DocsGenerator(
    metadata,
    {
      sourceFolder: join(FOLDERS.projectRoot, "xmlui", "src", "components"),
      outFolder: join(FOLDERS.docsRoot, "pages", "components"),
      examplesFolder: join(FOLDERS.docsRoot, "component-samples"),
    },
    { excludeComponentStatuses: componentsConfig?.excludeComponentStatuses },
  );

  if (componentsConfig?.cleanFolder) {
    await cleanFolder(join(FOLDERS.pages, "components"));
  }
  metadataGenerator.generateDocs();

  if (componentsConfig?.exportToJson) {
    await metadataGenerator.exportMetadataToJson();
  }

  await metadataGenerator.generateComponentsSummary();
  await metadataGenerator.generateArticleAndDownloadsLinks();
}

async function generateHtmlTagComponents(metadata) {
  const componentsConfig = await loadConfig(join(FOLDERS.script, "components-config.json"));
  const metadataGenerator = new DocsGenerator(
    metadata,
    {
      sourceFolder: join(FOLDERS.projectRoot, "xmlui", "src", "components"),
      outFolder: join(FOLDERS.docsRoot, "pages", "components"),
      examplesFolder: join(FOLDERS.docsRoot, "component-samples"),
    },
    { excludeComponentStatuses: componentsConfig?.excludeComponentStatuses },
  );
  await metadataGenerator.generateComponentsSummary(
    "HtmlTag Components",
    join(FOLDERS.pages, "html-tag-components.mdx"),
  );
}

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
  const defaultPackageState = "experimental";

  const extendedPackagesFolder = join(FOLDERS.projectRoot, "packages");
  const packageDirectories = (await readdir(extendedPackagesFolder)).filter((entry) => {
    return (
      entry.startsWith("xmlui-") && lstatSync(join(extendedPackagesFolder, entry)).isDirectory()
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
      const packageFolderDist = join(dir, "dist");
      if (!existsSync(packageFolderDist)) {
        logger.warning(`No dist folder found for ${dir}`);
        continue;
      }
      const distContents = await readdir(packageFolderDist);
      for (const file of distContents) {
        let filePath = join(packageFolderDist, file);
        if (filePath.endsWith(`${basename(dir)}-metadata.js`) && existsSync(filePath)) {
          filePath = convertPath(relative(FOLDERS.script, filePath));
          const { componentMetadata } = await import(filePath);
          extensionPackage.metadata = componentMetadata.metadata;
          extensionPackage.description = componentMetadata.description ?? "";
          extensionPackage.state = componentMetadata.state ?? defaultPackageState;
        }
      }
      // Ignore internal packages
      if (extensionPackage.state === "internal") {
        logger.info("Skipping internal extension package:", dir);
        continue;
      }
      console.log("Loaded extension package:", basename(dir));
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

function addPackageDescription() {}
