import { basename, extname, join } from "path";
import { existsSync, writeFileSync } from "fs";
import { unlink, readFile, writeFile, readdir } from "fs/promises";
import { logger, LOGGER_LEVELS, processError } from "./logger.mjs";
import { MetadataProcessor } from "./MetadataProcessor.mjs";
import { getSectionBeforeAndAfter, strBufferToLines, toHeadingPath } from "./utils.mjs";
import { buildPagesMap } from "./build-pages-map.mjs";
import { buildDownloadsMap } from "./build-downloads-map.mjs";
import { FOLDERS } from "./folders.mjs";

logger.setLevels(LOGGER_LEVELS.warning, LOGGER_LEVELS.error);

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
        const descriptionRef = join(componentFolder, `${displayName}.md`);

        const extendedComponentData = {
          ...compData,
          displayName,
          description: compData.description,
          descriptionRef,
          folderPath: componentFolder,
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

  generateDocs() {
    logger.info("Processing MDX files");
    const metaProcessor = new MetadataProcessor(this.metadata, "", this.folders);
    return metaProcessor.processDocfiles();
  }

  /**
   * Writes the meta file summary to the output folder
   * @param {Record<string,string>} metaFileContents The meta file contents
   * @param {string} outputFolder The output folder
   */
  writeMetaSummary(metaFileContents, outputFolder) {
    try {
      writeFileSync(join(outputFolder, "_meta.json"), JSON.stringify(metaFileContents, null, 2));
    } catch (e) {
      logger.error("Could not write _meta file: ", e?.message || "unknown error");
    }
  }

  async exportMetadataToJson(folderName) {
    logger.info("Exporting metadata to JSON");
    try {
      const outPath = join(FOLDERS.script, folderName ?? "");
      if (!existsSync(outPath)) {
        await mkdir(outPath, { recursive: true });
      }
      await writeFile(
        join(outPath, "metadata.json"),
        JSON.stringify(this.metadata, null, 2),
      );
    } catch (error) {
      processError(error);
    }
  }

  /**
   * Generates the package description section in a specified file for a given Extension package.
   * @param {string} packageDescription The data to add to the file
   * @param {string} sectionHeading Name & level of the section to (re)generate
   * @param {string} fileName The name and absolute path of the file to write to
   */
  async generatePackageDescription(packageDescription, sectionHeading, fileName) {
    logger.info("Creating package description section in specified file");
    try {
      const outFile = fileName || join(FOLDERS.pages, `${basename(this.folders.sourceFolder)}.md`);

      if (!existsSync(outFile)) {
        await writeFile(outFile, "");
      }
      let buffer = await readFile(outFile, "utf8");

      const { beforeSection, afterSection } = getSectionBeforeAndAfter(buffer, sectionHeading);
      const section =
        beforeSection + "\n" + sectionHeading + "\n\n" + packageDescription + afterSection;

      await writeFile(outFile, section.trim());
    } catch (error) {
      processError(error);
    }
  }

  async generatePermalinksForHeaders() {
    logger.info("Generating permalinks for file headings");

    const docFiles = existsSync(this.folders.outFolder)
      ? (await readdir(this.folders.outFolder)).filter((file) => extname(file) === ".md")
      : [];

    for (const file of docFiles) {
      const filePath = join(this.folders.outFolder, file);
      if (!existsSync(filePath)) {
        throw new ErrorWithSeverity(`File ${file} does not exist.`, LOGGER_LEVELS.error);
      }
      await generatePermalinks(filePath);
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

function addDescriptionRef(component, entries = []) {
  const result = {};

  if (component) {
    entries.forEach((entry) => {
      if (component[entry]) {
        result[entry] = Object.fromEntries(
          Object.entries(component[entry]).map(([k, v]) => {
            v.descriptionRef = `${component.componentFolder}/${component.displayName}.md?${k}`;
            return [k, v];
          }),
        );
      }
    });
  }

  return result;
}

/**
 * Get the ID and path of the article heading.
 * @param {string} articlePath The path of the article.
 */
async function generatePermalinks(articlePath) {
  try {
    const content = await readFile(articlePath, { encoding: "utf8" });
    const lines = strBufferToLines(content);
    const newContent = appendHeadingIds(lines);
    await writeFile(articlePath, newContent, { encoding: "utf8" });
  } catch (error) {
    processError(error);
  }

  // ---

  function appendHeadingIds(lines) {
    let newLines = [];
    for (const line of lines) {
      // Match Headings
      const match = line.match(/^#{1,6}\s+.+?\s*(\[#[\w-]+\])?$/);
      if (match && typeof match[1] === "undefined") {
        newLines.push(
          `${line} [#${toHeadingPath(stripApostrophies(stripParentheses(stripBackticks(match[0]))))}]`,
        );
        continue;
      }
      // Rest
      newLines.push(line);
    }
    return newLines.join("\n");
  }

  function stripBackticks(str) {
    return str.replace(/`/g, "");
  }

  function stripParentheses(str) {
    return str.replace(/\(|\)/g, "");
  }

  function stripApostrophies(str) {
    return str.replace(/"|'/g, "");
  }
}
