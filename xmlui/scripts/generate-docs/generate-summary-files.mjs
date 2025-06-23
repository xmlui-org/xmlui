import * as fs from "fs";
import { FOLDERS } from "./folders.mjs";
import * as path from "path";
import { createTable, getSectionBeforeAndAfter } from "./utils.mjs";
import { processError } from "./logger.mjs";

const ACCEPTED_STATUSES = ["stable", "experimental", "deprecated", "in progress"];
const DEFAULT_STATUS = "stable";

// components
const componentsMetaFolder = path.join(FOLDERS.script, "components");
const outFolder = path.join(FOLDERS.docsRoot, "content", "components");
generateComponentsSummary(
  path.join(componentsMetaFolder, "components-metadata.json"),
  "components",
  outFolder,
  "_overview.md",
  "# Components Overview",
);

// NOTE: this does not work yet, since we don't generate docs for html tags
// html tags
// generateComponentsSummary(
//   "# HtmlTag Components",
//   join(FOLDERS.pages, "html-tag-components.md"),
// );

// NOTE: this does not work yet, since we don't generate docs for extension packages
// extensions
//generateComponentsSummary(`## Package Components`, indexFile, false);

// ---

/**
 * Generates the component summary table and adds it to the provided file.
 * The function looks for the summary section in the provided file and regenerates it if present,
 * otherwise it appends one to the end of the file.
 * @param {string} metadataFile The path & name of the file containing the component metadata
 * @param {string} urlPath the path that is used to point to the generated component article in the docs
 * @param {string} outFolder
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
    const outFile = path.join(outFolder, summaryFile ?? `_overview.md`);
    if (!fs.existsSync(outFile)) {
      fs.writeFileSync(outFile, "");
    }

    const metadata = JSON.parse(fs.readFileSync(metadataFile, "utf8"));

    const table = createSummary(metadata, urlPath, outFolder, hasRowNums);

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
function createSummary(metadata, urlPath, filePath, hasRowNums = true) {
  const headers = [{ value: "Component", style: "center" }, "Description"];
  const rows = metadata
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .filter((component) => {
      const componentStatus = component.status ?? DEFAULT_STATUS;
      return !ACCEPTED_STATUSES.includes(componentStatus) ? false : true;
    })
    .map((component) => {
      const componentFilePath = path.join(filePath, `${component.displayName}.md`);
      const componentUrl = `./${urlPath}/${component.displayName}`;
      return [
        fs.existsSync(componentFilePath)
          ? `[${component.displayName}](${componentUrl})`
          : component.displayName,
        component.description,
      ];
    });

  return createTable({ headers, rows, rowNums: hasRowNums });
}
