import { basename, join } from "path";
import { existsSync } from "fs";
import { unlink, readFile, writeFile } from "fs/promises";
import { logger, LOGGER_LEVELS, processError } from "./logger.mjs";
import { MetadataProcessor } from "./MetadataProcessor.mjs";
import { createTable, strBufferToLines } from "./utils.mjs";
import { buildPagesMap } from "./build-pages-map.mjs";
import { buildDownloadsMap } from "./build-downloads-map.mjs";
import { FOLDERS } from "./folders.mjs";

logger.setLevels(LOGGER_LEVELS.warning, LOGGER_LEVELS.error);
const acceptedStatuses = ["stable", "experimental", "deprecated", "in progress"];
const defaultStatus = "stable";

export class DocsGenerator {
  metadata = [];
  folders = {
    sourceFolder: FOLDERS.pages,
    outFolder: FOLDERS.pages,
    examplesFolder: FOLDERS.pages,
  };

  constructor(metadata, folders, { excludeComponentStatuses }) {
    this.metadata = metadata;
    this.folders = folders;
    this.expandMetadata(excludeComponentStatuses);
  }

  /**
   * Filters provided metadata, then adds further information possibly missing.
   * @param {string[]} excludeComponentStatuses The status of the component to exclude, e.g. 'in progress' can be excluded
   */
  expandMetadata(excludeComponentStatuses) {
    logger.info("Transforming & expanding component metadata");
    this.metadata = Object.entries(this.metadata)
      .filter(([_, compData]) => {
        return !excludeComponentStatuses.includes(compData.status?.toLowerCase());
      })
      .map(([compName, compData]) => {
        const displayName = compName;
        const componentFolder = compData.specializedFrom || compData.docFolder || compName;
        const descriptionRef = join(componentFolder, `${displayName}.mdx`);

        const extendedComponentData = {
          ...compData,
          displayName,
          description: compData.description,
          descriptionRef,
          componentFolder,
        };

        const entries = addDescriptionRef(extendedComponentData, [
          "props",
          "events",
          "apis",
          "contextVars",
        ]);
        return { ...extendedComponentData, ...entries };
      });
  }

  generateDocs(writeMetaFile) {
    logger.info("Processing MDX files");
    const metaProcessor = new MetadataProcessor(this.metadata, "", this.folders);
    metaProcessor.processDocfiles(writeMetaFile);
  }

  async exportMetadataToJson() {
    logger.info("Exporting metadata to JSON");
    try {
      await writeFile(
        join(FOLDERS.script, "metadata.json"),
        JSON.stringify(this.metadata, null, 2),
      );
    } catch (error) {
      processError(error);
    }
  }

  /**
   * Generates the package description section in a specified file for a given Extension package.
   * @param {string} packageDescription The data to add to the file
   * @param {string} sectionName Name of the section to (re)generate
   * @param {string} fileName The name and absolute path of the file to write to
   */
  async generatePackageDescription(packageDescription, sectionName, fileName) {
    logger.info("Creating package description section in specified file");
    try {
      const outFile = fileName || join(FOLDERS.pages, `${basename(this.folders.sourceFolder)}.mdx`);

      if (!existsSync(outFile)) {
        await writeFile(outFile, "");
      }
      let buffer = await readFile(outFile, "utf8");

      const sectionNameHeading = `## ${sectionName}`;
      buffer = createSectionHeading(buffer, sectionNameHeading);
      const { beforeSection, afterSection } = getSectionBeforeAndAfter(buffer, sectionName);
      const section =
        beforeSection + "\n" + sectionNameHeading + "\n\n" + packageDescription + afterSection;

      await writeFile(outFile, section.trim());
    } catch (error) {
      processError(error);
    }
  }

  /**
   * Generates the component summary table and adds it to the provided file.
   * The function looks for the summary section in the provided file and regenerates it if present,
   * otherwise it appends one to the end of the file.
   * @param {string} summarySectionName The section to look for and add the summary to
   * @param {string?} summaryFileName The full path and name of the file to add the summary to
   * @param {boolean?} tableRowNums Whether to add row numbers to the summary table
   */
  async generateComponentsSummary(
    summarySectionName = "Components",
    summaryFileName,
    tableRowNums,
  ) {
    logger.info("Creating Component Summary");
    try {
      const outFile =
        summaryFileName || join(FOLDERS.pages, `${basename(this.folders.sourceFolder)}.mdx`);

      if (!existsSync(outFile)) {
        await writeFile(outFile, "");
      }

      const summary = await createSummary(
        this.metadata,
        outFile,
        this.folders.sourceFolder,
        this.folders.outFolder,
        summarySectionName,
        tableRowNums,
      );

      await writeFile(outFile, summary);
    } catch (error) {
      processError(error);
    }
  }

  async generateArticleAndDownloadsLinks() {
    try {
      const pagesMapFile = join(FOLDERS.docsMeta, "pages.js");
      if (existsSync(pagesMapFile)) {
        await unlink(pagesMapFile);
        await writeFile(pagesMapFile, "");
      }

      logger.info("Generating link IDs for article headings");
      buildPagesMap(FOLDERS.pages, pagesMapFile);

      const downloadsMapFile = join(FOLDERS.docsMeta, "downloads.js");
      if (existsSync(downloadsMapFile)) {
        await unlink(downloadsMapFile);
        await writeFile(downloadsMapFile, "");
      }

      logger.info("Generating link IDs for downloadable files");
      buildDownloadsMap(join(FOLDERS.docsRoot, "public", "resources", "files"), downloadsMapFile);
    } catch (error) {
      processError(error);
    }
  }
}

async function createSummary(
  metadata,
  filename,
  componentsSourceFolder,
  componentsOutFolder,
  sectionName = "Components",
  rowNums = true,
) {
  let buffer = await readFile(filename, "utf8");
  const componentFolderName = basename(componentsSourceFolder);

  buffer = createSectionHeading(buffer, `## ${sectionName}`);
  // The summary file may contain further sections other than the summary table.
  // Thus, we only (re)generate the section that contains the summary table.
  // This is done by finding the heading for the start of the summary table section and either the end of file
  // or the next section heading.
  const { beforeSection, afterSection } = getSectionBeforeAndAfter(buffer, sectionName);

  const sortedMetadata = metadata.sort((a, b) => {
    return a.displayName.localeCompare(b.displayName);
  });

  let table = "";
  table += `## ${sectionName}\n\n`;
  table += createTable({
    rowNums,
    headers: [
      { value: "Component", style: "center" },
      "Description",
      { value: "Status", style: "center" },
    ],
    rows: sortedMetadata
      .filter((component) => {
        const componentStatus = component.status ?? defaultStatus;
        return !acceptedStatuses.includes(componentStatus) ? false : true;
      })
      .map((component) => {
        return [
          existsSync(join(componentsOutFolder, `${component.displayName}.mdx`))
            ? `[${component.displayName}](./${componentFolderName}/${component.displayName}.mdx)`
            : component.displayName,
          component.description,
          component.status ?? defaultStatus,
        ];
      }),
  });

  return beforeSection + "\n" + table + afterSection;
}

function createSectionHeading(buffer, sectionNameHeading) {
  const lines = strBufferToLines(buffer);
  const sectionStartIdx = lines.findIndex((line) => line.includes(sectionNameHeading));
  if (sectionStartIdx === -1) {
    buffer += `\n\n${sectionNameHeading}\n\n`;
  }
  return buffer.trim();
}

function getSectionBeforeAndAfter(buffer, sectionName) {
  const lines = strBufferToLines(buffer);
  const sectionStartIdx = lines.findIndex((line) => line.includes(`## ${sectionName}`));
  const sectionEndIdx = lines
    .slice(sectionStartIdx + 1)
    .findIndex((line) => /^#+[\s\S]/.exec(line));

  const beforeSection = lines.slice(0, sectionStartIdx).join("\n");
  const afterSection = lines
    .slice(sectionStartIdx + 1, sectionStartIdx + 1 + sectionEndIdx)
    .join("\n");

  return { beforeSection, afterSection };
}

function addDescriptionRef(component, entries = []) {
  const result = {};

  if (component) {
    entries.forEach((entry) => {
      if (component[entry]) {
        result[entry] = Object.fromEntries(
          Object.entries(component[entry]).map(([k, v]) => {
            v.descriptionRef = `${component.componentFolder}/${component.displayName}.mdx?${k}`;
            return [k, v];
          }),
        );
      }
    });
  }

  return result;
}
