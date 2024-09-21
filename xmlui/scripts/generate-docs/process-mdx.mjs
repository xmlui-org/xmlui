import path from "path";
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, copyFileSync, constants, readFileSync, accessSync, lstatSync } from "fs";
import { parse, join, basename, extname, sep, posix, relative } from "path";
import { writeFileSync, readdirSync } from "fs";
import { logger, Logger } from "./logger.mjs";
import { createTable, handleError, ErrorWithSeverity } from "./utils.mjs";

// temp
const projectRootFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../");
const sourceFolder = join(projectRootFolder, "xmlui", "src", "components");
const examplesFolder = join(projectRootFolder, "docs", "component-samples");
const outFolder = join(projectRootFolder, "docs", "pages", "components");

// Note: string concatenation is the fastest using `+=` in Node.js

const IMPORTS = "imports";
const DESCRIPTION = "description";
const CONTEXT_VARS = "contextVars";
const PROPS = "props";
const API = "api";
const EVENTS = "events";
const STYLES = "styles";

// This indicates the starting symbol of a directive
const DIRECTIVE_INDICATOR = "%-";

// Defines the IDs of the sections in the source file
// Ex: %-PROP-START
const SECTION_DIRECTIVE_MAP = Object.freeze({
  imports: "IMPORT",
  description: "DESC",
  props: "PROP",
  events: "EVENT",
  styles: "STYLE",
  api: "API",
  contextVars: "CONTEXT_VAR",
});

// These constants denote which attribute contains the inline component description
// and which contains the reference to the source mdx file
const SECTION_DESCRIPTION = "description";
const SECTION_DESCRIPTION_REF = "descriptionRef";

const sectionNames = {
  props: "Properties",
  events: "Events",
  styles: "Styling",
  api: "API",
  contextVars: "Context Variables",
};

export function processDocfiles(metadata) {
  // Check for docs already in the output folder
  const docFiles = readdirSync(outFolder).filter((file) => extname(file) === ".mdx");
  let componentNames = docFiles.map((file) => basename(file, extname(file))) || [];

  metadata.forEach((component) => {
    componentNames = processMdx(component, componentNames, metadata);
  });

  // Write the _meta.json file
  try {
    const metaFileContents = Object.fromEntries(componentNames.sort().map((name) => [name, name]));
    writeFileSync(join(outFolder, "_meta.json"), JSON.stringify(metaFileContents, null, 2));
  } catch (e) {
    logger.error("Could not write _meta file: ", e?.message || "unknown error");
  }
}

export function processMdx(component, componentNames, metadata) {
  let result = "";
  let fileData = "";

  // descriptionRef is explicitly set to empty, which means there is no external doc file for this component
  if (!!component.descriptionRef) {
    try {
      // File sizes don't exceed 1 MB (most are 20-23 KB), so reading the contents of the files into memory is okay
      fileData = readFileContents(join(sourceFolder, component.descriptionRef));
    } catch (error) {
      handleError(error);
    }
  }

  const parent = component.specializedFrom
    ? metadata.find((otherComponent) => otherComponent.displayName === component.specializedFrom)
    : null;

  if (!!parent) {
    const parentDocs = `./${parent.displayName}.mdx`;
    result += fileData || "There is no documentation for this component as of yet.";
    result += `\n\n`;
    result += `The parent component documentation can be found [here](${parentDocs}).`;
  } else {
    logger.info(`Processing ${component.displayName}...`);

    logger.info("Processing imports section");
    const { buffer, copyFilePaths } = addImportsSection(fileData, component);
    if (buffer) {
      result += `${buffer}\n`;
      copyImports(copyFilePaths);
    }

    result += `# ${component.displayName}\n\n`;

    if (component.nonVisual) {
      result += "> **Note**: This component does does not show up on the UI; it merely helps implement UI logic.\n\n";
    }

    result += combineDescriptionAndDescriptionRef(fileData, component, DESCRIPTION);
    result += "\n\n";

    result += addContextVarsSection(fileData, component);
    result += "\n\n";

    result += addPropsSection(fileData, component);
    result += "\n\n";

    result += addApiSection(fileData, component);
    result += "\n\n";

    result += addEventsSection(fileData, component);
    result += "\n\n";

    result += addStylesSection(fileData, component);
    result += "\n";
  }

  try {
    writeFileSync(join(outFolder, `${component.displayName}.mdx`), result);
    componentNames.push(component.displayName);
  } catch (error) {
    logger.error("Could not write mdx file: ", error?.message || "unknown error");
  }
  return componentNames;
}

// --- File & String Processing

function addImportsSection(data, component) {
  // This array is used in the transformer function
  const copyFilePaths = [];
  const buffer = getSection(
    data,
    component[SECTION_DESCRIPTION_REF],
    IMPORTS,
    importPathTransformer
  );
  return { buffer, copyFilePaths };

  // ---

  function importPathTransformer(contents) {
    if (!contents) {
      return "";
    }

    // 1. Get the import paths from the import statements, e.g. "./resources/icon.svg"
    const normalized = contents
      .replaceAll(/'|`/g, '"')
      .split(/;|\n|;\n/g)
      .filter(Boolean);
    const splitNormalized = [
      ...normalized.flatMap((line) =>
        line
          .trim()
          .split('"')
          .filter((part) => !!part.trim())
      ),
    ];
    // We assume that removing the ;-s and/or the \n-s will leave an even number of parts: an import statement & an import path
    if (splitNormalized.length % 2 !== 0) {
      throw new ErrorWithSeverity("Malformed import statement found in: ", component.displayName, "Skipping imports", Logger.severity.warning);
    }
    const importStatements = [];
    const importPaths = [];
    for (let i = 0; i < splitNormalized.length - 1; i += 2) {
      importStatements.push(splitNormalized[i]);
      importPaths.push(splitNormalized[i + 1]);
    }

    // 2. Transform import paths and add them to the string buffer
    let transformedStatements = "";
    for (let i = 0; i < importPaths.length; i++) {
      // NOTE: this is pretty restrictive, but works for now
      if (!importPaths[i].startsWith("./doc-resources")) {
        logger.error("Invalid import path:", importPaths[i], " in ", component.displayName);
        continue;
      }
      const importFile = parse(importPaths[i]);
      const transformedPath = join(examplesFolder, component.displayName, importFile.base).replaceAll(posix.sep, sep);

      // NOTE: need to use POSIX separators here regardless of platform
      transformedStatements += `${
        importStatements[i]
      } "${relative(outFolder, transformedPath).replaceAll(sep, posix.sep)}";\n`;

      // 3. Add the original and new import paths to an array to copy them later
      copyFilePaths.push({
        oldPath: join(
          sourceFolder,
          component.displayName,
          importFile.dir,
          importFile.base
        ),
        newPath: relative(outFolder, transformedPath),
      });
    }

    return transformedStatements;
  }
}

function addContextVarsSection(data, component) {
  logger.info(`Processing ${component.displayName} context variables`);
  let buffer = `## ${sectionNames.contextVars}\n\n`;

  if (
    !component.contextVars ||
    Object.keys(component.contextVars ?? {}).length === 0
  ) {
    return buffer + "This component does not have any context variables.";
  }
  Object.entries(component.contextVars)
    .sort()
    .forEach(([contextVarName, contextVar]) => {
      buffer += `### \`${contextVarName}\`\n\n`;
      buffer += combineDescriptionAndDescriptionRef(
        data,
        contextVar,
        CONTEXT_VARS
      );
      buffer += "\n\n";
    });

  // Remove last newline
  buffer = buffer.slice(0, -2);
  return buffer;
}

function addPropsSection(data, component) {
  logger.info(`Processing ${component.displayName} props`);
  let buffer = `## ${sectionNames.props}\n\n`;

  if (!component.props || Object.keys(component.props ?? {}).length === 0) {
    return buffer + "This component does not have any properties.";
  }
  Object.entries(component.props)
    .sort()
    .forEach(([propName, prop]) => {
      buffer += `### \`${propName}\`\n\n`;
      buffer += combineDescriptionAndDescriptionRef(data, prop, PROPS);
      buffer += "\n\n";
    });

  // Remove last newline
  buffer = buffer.slice(0, -2);
  return buffer;
}

function addApiSection(data, component) {
  logger.info(`Processing ${component.displayName} APIs`);
  let buffer = `## ${sectionNames.api}\n\n`;

  if (!component.api || Object.keys(component.api ?? {}).length === 0) {
    return buffer + "This component does not provide any API.";
  }
  Object.entries(component.api)
    .sort()
    .forEach(([apiName, api]) => {
      buffer += `### \`${apiName}\`\n\n`;
      buffer += combineDescriptionAndDescriptionRef(data, api, API);
      buffer += "\n\n";
    });

  // Remove last newline
  buffer = buffer.slice(0, -2);
  return buffer;
}

function addEventsSection(data, component) {
  logger.info(`Processing ${component.displayName} events`);
  let buffer = `## ${sectionNames.events}\n\n`;

  if (!component.events || Object.keys(component.events ?? {}).length === 0) {
    return buffer + "This component does not have any events.";
  }
  Object.entries(component.events)
    .sort()
    .forEach(([eventName, event]) => {
      buffer += `### \`${eventName}\`\n\n`;
      buffer += combineDescriptionAndDescriptionRef(data, event, EVENTS);
      buffer += "\n\n";
    });

  // Remove last newline
  buffer = buffer.slice(0, -2);
  return buffer;
}

function addStylesSection(data, component) {
  logger.info(`Processing ${component.displayName} styles`);

  let buffer = `## ${sectionNames.styles}\n\n`;
  const fileBuffer = getSection(
    data,
    component[SECTION_DESCRIPTION_REF],
    STYLES
  );
  buffer += fileBuffer || "This component does not have any styles.";

  return buffer;
}

function combineDescriptionAndDescriptionRef(
  data,
  component,
  sectionId,
  emptyDescriptionMessage = "No description provided."
) {
  let descriptionBuffer = "";
  let fileBuffer = "";

  if (component[SECTION_DESCRIPTION]) {
    descriptionBuffer = component[SECTION_DESCRIPTION];
  }

  if (sectionId === PROPS) {
    const defaultValuesBuffer = addDefaultValue(component);
    if (defaultValuesBuffer) {
      descriptionBuffer += "\n\n" + defaultValuesBuffer;
    }

    const availableValuesBuffer = addAvailableValues(component);
    if (availableValuesBuffer) {
      descriptionBuffer += "\n\n" + availableValuesBuffer;
    }
  }

  if (
    component.hasOwnProperty(SECTION_DESCRIPTION_REF) &&
    component[SECTION_DESCRIPTION_REF]
  ) {
    fileBuffer = getSection(
      data,
      component[SECTION_DESCRIPTION_REF],
      sectionId
    );
  }

  if (!descriptionBuffer && !fileBuffer) {
    return emptyDescriptionMessage;
  }
  if (descriptionBuffer && fileBuffer) {
    return descriptionBuffer + "\n\n" + fileBuffer;
  }
  return descriptionBuffer || fileBuffer;
}

function getSection(
  data,
  sectionRef,
  sectionId,
  transformer = (contents) => contents
) {
  const separator = "?";
  const descRefParts = sectionRef.split(separator);
  const sectionName = descRefParts.length > 1 ? descRefParts[1] : "";

  try {
    if (!acceptSection(sectionId, sectionName)) {
      throw new ErrorWithSeverity(
        `Invalid section name and ID: ${sectionName} and ${sectionId}`,
        Logger.severity.warning
      );
    }
    const sectionHeader = SECTION_DIRECTIVE_MAP[sectionId];
    if (!sectionHeader) {
      throw new ErrorWithSeverity(`Unknown section ID: ${sectionId}`, 
        Logger.severity.warning
      );
    }

    const startDirective = `${DIRECTIVE_INDICATOR}${sectionHeader}-START${
      sectionName ? ` ${sectionName}` : ""
    }`;
    const endDirective = `${DIRECTIVE_INDICATOR}${sectionHeader}-END`;
    const contents = resolveSection(data, startDirective, endDirective);

    return transformer(contents);
  } catch (error) {
    logger.error(error);
  }
}

function acceptSection(sectionId, sectionName) {
  if (sectionId.PROPS && !sectionName) return false;
  if (sectionId.EVENTS && !sectionName) return false;
  return true;
}

function resolveSection(data, startDirective, endDirective) {
  startDirective = startDirective.replaceAll("$", "\\$");
  const match = data.match(
    new RegExp(`${startDirective}([\\s\\S]*?${endDirective})`, "i")
  );
  if (!match || match?.length === 0) {
    return "";
  }

  let section = match[1].substring(0, match[1].indexOf(endDirective));
  let sectionLines = section.split(/\r?\n/);

  // Replace this with a function that handles META directives
  sectionLines = stripMetaDirectives(sectionLines);
  sectionLines = trimSection(sectionLines);
  return sectionLines.join("\n");
}

function trimSection(sectionLines) {
  const firstNonEmptyIdx = sectionLines.findIndex((line) => line.trim() !== "");
  const lastNonEmptyIdx = sectionLines.findLastIndex(
    (line) => line.trim() !== ""
  );
  return sectionLines.slice(firstNonEmptyIdx, lastNonEmptyIdx + 1);
}

function stripMetaDirectives(sectionLines) {
  let buffer = sectionLines;
  const metaStart = `${DIRECTIVE_INDICATOR}META`;

  buffer.forEach((line) => {
    if (line.startsWith(metaStart)) {
      buffer[buffer.indexOf(line)] = "";
    }
  });

  return buffer;
}

function copyImports(imports) {
  try {
    imports.forEach((importPath) => {
      const pathToNewFile = parse(importPath.newPath).dir;
      if (!!pathToNewFile && !existsSync(pathToNewFile)) {
        mkdirSync(pathToNewFile, { recursive: true });
      }
      copyFileSync(importPath.oldPath, importPath.newPath, constants.COPYFILE_FICLONE);
    });
  } catch (e) {
    logger.error("Could not copy file: ", e?.message || "unknown error");
  }
}

function readFileContents(filePath) {
  if (!fileExists(filePath)) {
    throw new ErrorWithSeverity(`File ${filePath} does not exist.`, Logger.severity.warning);
  }
  if (isDirectory(filePath)) {
    throw new ErrorWithSeverity(`File ${filePath} is a directory, cannot be processed.`, Logger.severity.warning);
  }

  return readFileSync(filePath, "utf8");
}

function fileExists(filePath) {
  try {
    accessSync(filePath, constants.F_OK);
  } catch (error) {
    return false;
  }
  return true;
}

function isDirectory(filePath) {
  try {
    return lstatSync(filePath).isDirectory();
  } catch (error) {
    return false;
  }
}

function addDefaultValue(component) {
  const defaultValue = component.defaultValue;
  if (defaultValue === undefined) {
    return "";
  }
  if (typeof defaultValue === "string") {
    return `Default value: \`"${defaultValue}"\`.`;
  }
  return `Default value: \`${JSON.stringify(defaultValue, null, 2)}\`.`;
}

function addAvailableValues(component) {
  if (
    !(component.availableValues &&
    Array.isArray(component.availableValues) &&
    component.availableValues.length > 0)
  ) {
    return "";
  }

  let availableValuesBuffer = "";
  const valuesType = typeof component.availableValues[0];
  const valuesTypeIsPrimitive = valuesType === "string" || valuesType === "number";
  
  if (valuesType === "string" || valuesType === "number") {
    availableValuesBuffer = component.availableValues.map((v) => `\`${v}\``).join(", ");
  } else if (valuesType === "object") {
    availableValuesBuffer = createTable({
      headers: ["Value", "Description"],
      rows: component.availableValues.map((v) => [`\`${v.value}\``, v.description]),
    })
  }

  if (availableValuesBuffer) {
    return `Available values:${valuesTypeIsPrimitive ? " " : "\n\n"}${availableValuesBuffer}`;
  }
  return "";
}
