const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const metadata = require("./component-metadata.json");

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

// --- Script starts here

const { sourceFolder, outFolder, examplesFolder, sectionNames } = handleConfig(config);

// Check for docs already in the output folder
const docFiles = fs.readdirSync(outFolder).filter((file) => path.extname(file) === ".mdx");
const componentNames = docFiles.map((file) => path.basename(file, path.extname(file))) || [];

metadata.forEach((component) => {
  let result = "";
  let fileData = "";
  try {
    // File sizes don't exceed 1 MB (most are 20-23 KB), so reading the contents of the files into memory is okay
    fileData = readFileContents(path.join(sourceFolder, component.descriptionRef));
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
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
    const { buffer, copyFilePaths } = addImportsSection(fileData, component);
    if (buffer) {
      result += `${buffer}\n`;
      copyImports(copyFilePaths);
    }

    result += `# ${component.displayName}\n\n`;

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
    fs.writeFileSync(path.join(outFolder, `${component.displayName}.mdx`), result);
    componentNames.push(component.displayName);
  } catch (error) {
    console.error("Could not write mdx file: ", error?.message || "unknown error");
  }
});

// Write the _meta.json file
try {
  const metaFileContents = Object.fromEntries(componentNames.sort().map((name) => [name, name]));
  fs.writeFileSync(path.join(outFolder, "_meta.json"), JSON.stringify(metaFileContents, null, 2));
} catch (e) {
  console.error("Could not write _meta file: ", e?.message || "unknown error");
}

// --- Helper functions

function handleConfig(config) {
  const workingFolder = path.resolve(__dirname);
  let { sourceFolderPath, outFolderPath, examplesFolderPath, sectionNames } = config;

  const _sourceFolder = path.resolve(workingFolder, sourceFolderPath);
  if (!fs.existsSync(_sourceFolder)) {
    throw new Error(`Source folder ${_sourceFolder} does not exist.`);
  }

  const _outFolder = !outFolderPath ? workingFolder : path.resolve(workingFolder, outFolderPath);
  if (!fs.existsSync(_outFolder)) {
    throw new Error(`Output folder ${_outFolder} does not exist.`);
  }

  const _examplesFolder = path.relative(workingFolder, examplesFolderPath);
  if (!fs.existsSync(path.resolve(workingFolder, examplesFolderPath))) {
    throw new Error(`Examples folder ${_examplesFolder} does not exist.`);
  }

  return {
    workingFolder,
    sourceFolder: _sourceFolder,
    outFolder: _outFolder,
    examplesFolder: _examplesFolder,
    sectionNames: {
      props: sectionNames?.props || "Props",
      events: sectionNames?.events || "Events",
      styles: sectionNames?.styles || "Styling",
      api: sectionNames?.api || "API",
      contextVars: sectionNames?.contextVars || "Context Variables",
    },
  };
}

// --- File & String Processing

function addImportsSection(data, component) {
  // This array is used in the transformer function
  const copyFilePaths = [];
  const buffer = getSection(data, component[SECTION_DESCRIPTION_REF], IMPORTS, importPathTransformer);
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
      throw new Error("Malformed import statement found in: ", component.displayName);
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
        console.error("Invalid import path: ", importPaths[i], " in ", component.displayName);
        continue;
      }
      const importFile = path.parse(importPaths[i]);
      const transformedPath = path
        .join(examplesFolder, component.displayName, importFile.base)
        .replaceAll(path.posix.sep, path.sep);
      // NOTE: need to use POSIX separators here regardless of platform
      transformedStatements += `${importStatements[i]} "${transformedPath.replaceAll(path.sep, path.posix.sep)}";\n`;

      // 3. Add the original and new import paths to an array to copy them later
      copyFilePaths.push({
        oldPath: path.join(sourceFolder, component.displayName, importFile.dir, importFile.base),
        newPath: path.join(outFolder, transformedPath),
      });
    }

    return transformedStatements;
  }
}

function addContextVarsSection(data, component) {
  let buffer = `## ${sectionNames.contextVars}\n\n`;

  if (!component.contextVars || Object.keys(component.contextVars ?? {}).length === 0) {
    return buffer + "This component does not have any context variables.";
  }
  Object.entries(component.contextVars)
    .sort()
    .forEach(([contextVarName, contextVar]) => {
      buffer += `### \`${contextVarName}\`\n\n`;
      buffer += combineDescriptionAndDescriptionRef(data, contextVar, CONTEXT_VARS);
      buffer += "\n\n";
    });

  // Remove last newline
  buffer = buffer.slice(0, -2);
  return buffer;
}

function addPropsSection(data, component) {
  let buffer = `## ${sectionNames.props}\n\n`;

  if (!component.props || Object.keys(component.props ?? {}).length === 0) {
    return buffer + "This component does not have any props.";
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
  let buffer = `## ${sectionNames.styles}\n\n`;
  const fileBuffer = getSection(data, component[SECTION_DESCRIPTION_REF], STYLES);
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

  if (component.hasOwnProperty(SECTION_DESCRIPTION_REF) && component[SECTION_DESCRIPTION_REF]) {
    fileBuffer = getSection(data, component[SECTION_DESCRIPTION_REF], sectionId);
  }

  if (!descriptionBuffer && !fileBuffer) {
    return emptyDescriptionMessage;
  }
  if (descriptionBuffer && fileBuffer) {
    return descriptionBuffer + "\n\n" + fileBuffer;
  }
  return descriptionBuffer || fileBuffer;
}

function getSection(data, sectionRef, sectionId, transformer = (contents) => contents) {
  const separator = "?";
  const descRefParts = sectionRef.split(separator);
  const sectionName = descRefParts.length > 1 ? descRefParts[1] : "";

  try {
    if (!acceptSection(sectionId, sectionName)) {
      throw new Error(`Invalid section name and ID: ${sectionName} and ${sectionId}`, { cause: "Invalid section" });
    }
    const sectionHeader = SECTION_DIRECTIVE_MAP[sectionId];
    if (!sectionHeader) {
      throw new Error(`Unknown section ID: ${sectionId}`, { cause: "Unknown section" });
    }

    const startDirective = `${DIRECTIVE_INDICATOR}${sectionHeader}-START${sectionName ? ` ${sectionName}` : ""}`;
    const endDirective = `${DIRECTIVE_INDICATOR}${sectionHeader}-END`;
    const contents = resolveSection(data, startDirective, endDirective);
    /* if (!contents) {
      console.warn(`Section is empty for section "${sectionId}"`);
    } */

    return transformer(contents);
  } catch (error) {
    console.error(error);
  }
}

function getSectionFromFile(sectionRef, sectionId, transformer = (contents) => contents) {
  const separator = "?";
  const descRefParts = sectionRef.split(separator);
  const filePath = descRefParts[0];
  const srcFilePath = path.join(sourceFolder, filePath);
  const sectionName = descRefParts.length > 1 ? descRefParts[1] : "";

  try {
    if (!fileExists(srcFilePath)) {
      throw new Error(`File ${srcFilePath} does not exist.`, {
        cause: "File does not exist",
      });
    }
    if (isDirectory(srcFilePath)) {
      throw new Error(`File ${srcFilePath} is a directory, cannot be processed.`, {
        cause: "File path is a directory",
      });
    }
    if (!acceptSection(sectionId, sectionName)) {
      throw new Error(`Invalid section name and ID: ${sectionName} and ${sectionId}`, { cause: "Invalid section" });
    }
    const sectionHeader = SECTION_DIRECTIVE_MAP[sectionId];
    if (!sectionHeader) {
      throw new Error(`Unknown section ID: ${sectionId}`, { cause: "Unknown section" });
    }

    const data = fs.readFileSync(srcFilePath, "utf8");
    const startDirective = `${DIRECTIVE_INDICATOR}${sectionHeader}-START${sectionName ? ` ${sectionName}` : ""}`;
    const endDirective = `${DIRECTIVE_INDICATOR}${sectionHeader}-END`;
    const contents = resolveSection(data, startDirective, endDirective);
    /* if (!contents) {
      console.warn(`Section is empty for section "${sectionId}"`);
    } */

    return transformer(contents);
  } catch (error) {
    if (error instanceof Error && error.code === "ENOENT") {
      console.error(`File ${srcFilePath} does not exist.`);
    } else {
      console.error(error);
    }
  }
}

function acceptSection(sectionId, sectionName) {
  if (sectionId.PROPS && !sectionName) return false;
  if (sectionId.EVENTS && !sectionName) return false;
  return true;
}

function resolveSection(data, startDirective, endDirective) {
  startDirective = startDirective.replaceAll("$", "\\$");
  const match = data.match(new RegExp(`${startDirective}([\\s\\S]*?${endDirective})`, "i"));
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
  const lastNonEmptyIdx = sectionLines.findLastIndex((line) => line.trim() !== "");
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
      const pathToNewFile = path.parse(importPath.newPath).dir;
      if (!!pathToNewFile && !fs.existsSync(pathToNewFile)) {
        fs.mkdirSync(pathToNewFile, { recursive: true });
      }
      fs.copyFileSync(importPath.oldPath, importPath.newPath, fs.constants.COPYFILE_FICLONE);
    });
  } catch (e) {
    console.error("Could not copy file: ", e?.message || "unknown error");
  }
}

function readFileContents(filePath) {
  if (!fileExists(filePath)) {
    throw new Error(`File ${filePath} does not exist.`, {
      cause: "File does not exist",
    });
  }
  if (fs.lstatSync(filePath).isDirectory()) {
    throw new Error(`File ${filePath} is a directory, cannot be processed.`, {
      cause: "File path is a directory",
    });
  }

  return fs.readFileSync(filePath, "utf8");
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
  } catch (error) {
    return false;
  }
  return true;
}

function isDirectory(filePath) {
  try {
    return fs.lstatSync(filePath).isDirectory();
  } catch (error) {
    return false;
  }
}
