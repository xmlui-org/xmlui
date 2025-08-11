import * as fs from "fs";
import * as path from "path";
import { FOLDERS } from "./folders.mjs";
import { createTable, getSectionBeforeAndAfter } from "./utils.mjs";
import { logger, LOGGER_LEVELS, processError } from "./logger.mjs";
import {
  COMPONENT_STATUS_CONFIG,
  SUMMARY_FILE_CONFIG,
  OUTPUT_FILES
} from "./constants.mjs";

const ACCEPTED_STATUSES = COMPONENT_STATUS_CONFIG.ACCEPTED_STATUSES;
const DEFAULT_STATUS = COMPONENT_STATUS_CONFIG.DEFAULT_STATUS;

logger.setLevels(LOGGER_LEVELS.warning, LOGGER_LEVELS.error);
logger.info("Generating summary files...");

// components
logger.info("Components summary");

const componentsMetaFolder = path.join(FOLDERS.script, "metadata", "components");
const componentsOutFolder = path.join(FOLDERS.docsRoot, "content", "components");

generateComponentsSummary(
  path.join(componentsMetaFolder, OUTPUT_FILES.METADATA_JSON),
  "",
  componentsOutFolder,
  "_overview.md",
  SUMMARY_FILE_CONFIG.COMPONENTS_OVERVIEW_HEADER,
);

logger.info("Components summary DONE");

// NOTE: Unused
// extensions
// logger.info("Extensions summary");

// const extensionsMetaFolder = path.join(FOLDERS.script, "metadata", "extensions");
// fs.readdirSync(extensionsMetaFolder).forEach((file) => {
//   if (path.extname(file) === ".json") {

//     let extensionName = path.basename(file, ".json");
//     extensionName = extensionName.replace("-metadata", "");
//     const extensionOutFolder = path.join(FOLDERS.docsRoot, "content", "extensions", extensionName);

//     generateComponentsSummary(
//       path.join(extensionsMetaFolder, file),
//       `extensions/${extensionName}`,
//       extensionOutFolder,
//       `_overview.md`,
//       SUMMARY_FILE_CONFIG.PACKAGE_COMPONENTS_HEADER,
//     );
//   }
// });

// logger.info("Extensions summary DONE");

// ---

/**
 * Generates the component summary table and adds it to the provided file.
 * The function looks for the summary section in the provided file and regenerates it if present,
 * otherwise it appends one to the end of the file.
 * @param {string} metadataFile The path & name of the file containing the component metadata
 * @param {string} urlPath the path that is used to point to the generated component article in the docs
 * @param {string} outFolder The folder to add the summary to
 * @param {string} summaryFile The name of the file (with extesion) to add the summary to
 * @param {string} summarySectionName The section to look for and add the summary to
 * @param {boolean?} hasRowNums Whether to add row numbers to the summary table
 */
function generateComponentsSummary(
  metadataFile,
  urlPath,
  outFolder,
  summaryFile,
  summarySectionName,
  hasRowNums,
) {
  try {
    if (!fs.existsSync(metadataFile)) {
      throw new Error(
        `Metadata file does not exist: ${metadataFile}. Please run generate-docs first.`,
      );
    }
    
    const outFile = path.join(outFolder, summaryFile ?? `_overview.md`);
    if (!fs.existsSync(outFile)) {
      fs.writeFileSync(outFile, "");
    }

    const metadata = JSON.parse(fs.readFileSync(metadataFile, "utf8"));

    const table = createSummaryTable(metadata, urlPath, outFolder, hasRowNums);

    const fileContents = fs.readFileSync(outFile, "utf8");
    let { beforeSection, afterSection } = getSectionBeforeAndAfter(
      fileContents,
      summarySectionName,
    );

    beforeSection = beforeSection.length > 0 ? beforeSection + "\n\n" : beforeSection;
    const summary = beforeSection + `${summarySectionName}\n\n` + table + "\n" + afterSection;
    fs.writeFileSync(outFile, summary);
  } catch (error) {
    processError(error);
  }
}

/**
 * Translates a metadata object to a summary table in markdown.
 * @param {Record<string, any>} metadata object with components and their metadata
 * @param {string} urlPath the path that is used to point to the generated component article in the docs
 * @param {string} filePath the path that contains the generated component article file itself
 * @param {boolean?} hasRowNums should the table have numbered rows
 * @returns stringified markdown table
 */
function createSummaryTable(metadata, urlPath, filePath, hasRowNums = false) {
  const headers = [{ value: "Component", style: "center" }, "Description"];
  const rows = metadata
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .filter((component) => {
      const componentStatus = component.status ?? DEFAULT_STATUS;
      return !ACCEPTED_STATUSES.includes(componentStatus) ? false : true;
    })
    .map((component) => {
      const componentFilePath = path.join(filePath, `${component.displayName}.md`);
      const componentUrl = urlPath ? `./${urlPath}/${component.displayName}` : `./${component.displayName}`;
      return [
        fs.existsSync(componentFilePath)
          ? `[${component.displayName}](${componentUrl})`
          : component.displayName,
        component.description,
      ];
    });

  return createTable({ headers, rows, rowNums: hasRowNums });
}
