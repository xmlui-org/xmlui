import { basename, join } from "path";
import { existsSync } from "fs";
import { unlink, readFile, writeFile } from "fs/promises";
import { collectedComponentMetadata } from "../../dist/xmlui-metadata.mjs";
import { logger, LOGGER_LEVELS } from "./logger.mjs";
import { MetadataProcessor } from "./MetadataProcessor.mjs";
import { processError, createTable, strBufferToLines } from "./utils.mjs";
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

  expandMetadata(excludeComponentStatuses) {
    logger.info("Transforming & expanding component metadata");
    this.metadata = Object.entries(collectedComponentMetadata)
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

  generateDocs() {
    logger.info("Processing MDX files");

    //const pagesMapFile = join(FOLDERS.pages, "pages.js");
    // const pagesMapFileName = basename(pagesMapFile);
    const importsToInject = `import { Callout } from "nextra/components";\n\n`;
    // join(FOLDERS.pages, "components")
    // + `import ${pagesMapFileName.replace(extname(pagesMapFile), "")} from "${convertPath(relative(join(FOLDERS.pages, "components"), pagesMapFile))}";\n\n`;
    const metaProcessor = new MetadataProcessor(this.metadata, importsToInject, this.folders);
    metaProcessor.processDocfiles();
  }

  async exportMetadataToJson() {
    logger.info("Exporting metadata to JSON");
    try {
      await writeFile(
        join(FOLDERS.script, "metadata.json"),
        JSON.stringify(collectedComponentMetadata, null, 2),
      );
    } catch (error) {
      processError(error);
    }
  }

  async generateComponentsSummary() {
    logger.info("Creating Component Summary");
    try {
      const sourceFolderName = basename(this.folders.sourceFolder);
      const summary = await createSummary(
        this.metadata,
        join(FOLDERS.pages, `${sourceFolderName}.mdx`),
        {
          sectionName: "Components",
          componentFolder: sourceFolderName,
          //excludeStatuses: ["in progress"],
        },
      );
      await writeFile(join(FOLDERS.pages, `${sourceFolderName}.mdx`), summary);
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
  {
    sectionName = "Components",
    componentFolder = basename(this.folders.sourceFolder),
    excludeStatuses = [],
  },
) {
  const buffer = await readFile(filename, "utf8");

  const lines = strBufferToLines(buffer);
  const componentSectionStartIdx = lines.findIndex((line) => line.includes(`## ${sectionName}`));
  const componentSectionEndIdx = lines
    .slice(componentSectionStartIdx + 1)
    .findIndex((line) => /^#+[\s\S]/.exec(line));

  const beforeComponentsSection = lines.slice(0, componentSectionStartIdx).join("\n");
  const afterComponentsSection = lines
    .slice(componentSectionStartIdx + 1, componentSectionStartIdx + 1 + componentSectionEndIdx)
    .join("\n");

  const sortedMetadata = metadata.sort((a, b) => {
    return a.displayName.localeCompare(b.displayName);
  });

  let table = "";
  table += `## ${sectionName}\n\n`;
  table += createTable({
    rowNums: true,
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
          `[${component.displayName}](./${componentFolder}/${component.displayName}.mdx)`,
          component.description,
          component.status ?? defaultStatus,
        ];
      }),
  });

  return beforeComponentsSection + "\n" + table + afterComponentsSection;
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
