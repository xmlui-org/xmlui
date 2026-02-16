import {
  existsSync,
  mkdirSync,
  copyFileSync,
  constants,
  readFileSync,
  accessSync,
  lstatSync,
} from "fs";
import { parse, join, basename, extname, sep, posix, relative } from "path";
import { writeFileSync, readdirSync } from "fs";
import { logger, LOGGER_LEVELS, processError, ErrorWithSeverity } from "./logger.mjs";
import { createTable, strBufferToLines, removeAdjacentNewlines } from "./utils.mjs";
import { iterateObjectEntries, processComponentSection } from "./pattern-utilities.mjs";
import {
  METADATA_SECTIONS,
  DIRECTIVE_CONFIG,
  SECTION_DISPLAY_NAMES,
  SECTION_REFERENCE_KEYS,
  COMMON_TABLE_HEADERS,
  FILE_EXTENSIONS,
} from "./constants.mjs";
import { collectedBehaviorMetadata } from "../../dist/metadata/behaviors.js";
import { canBehaviorAttachToComponent } from "../../dist/metadata/behavior-evaluator.js";
import { ComponentMetadataProvider } from "../../dist/metadata/metadata-utils.js";

// Note: string concatenation is the fastest using `+=` in Node.js

// These constants denote which attribute contains the inline component description
// and which contains the reference to the source markdown file
const SECTION_DESCRIPTION = SECTION_REFERENCE_KEYS.DESCRIPTION;
const SECTION_DESCRIPTION_REF = SECTION_REFERENCE_KEYS.DESCRIPTION_REF;

export class MetadataProcessor {
  constructor(metadata, importsToInject, { sourceFolder, outFolder, examplesFolder }) {
    this.metadata = metadata;
    this.importsToInject = importsToInject;
    this.sourceFolder = sourceFolder;
    this.outFolder = outFolder;
    this.examplesFolder = examplesFolder;
  }

  /**
   * @returns object containing the component name and the associated filenames
   */
  processDocfiles() {
    // Check for docs already in the output folder
    const docFiles = existsSync(this.outFolder)
      ? readdirSync(this.outFolder).filter((file) => extname(file) === FILE_EXTENSIONS.MARKDOWN[0])
      : [];
    let componentNames = docFiles.map((file) => basename(file, extname(file)));

    this.metadata.forEach((component) => {
      componentNames = this._processMdx(component, componentNames);
    });

    const metaFileContents = Object.fromEntries(componentNames.sort().map((name) => [name, name]));
    return metaFileContents;
  }

  _processMdx(component, componentNames) {
    let result = "";
    let fileData = "";

    // descriptionRef is explicitly set to empty, which means there is no external doc file for this component
    if (!!component.descriptionRef) {
      try {
        // File sizes don't exceed 1 MB (most are 20-23 KB), so reading the contents of the files into memory is okay
        fileData = readFileContents(join(this.sourceFolder, component.descriptionRef));
      } catch (error) {
        processError(error);
      }
    }

    logger.info(`Processing ${component.displayName}...`);

    const parent = findParent(this.metadata, component);

    // TODO: add check to throw warning if parent is not found
    // TODO: add check to throw error if component display name is the same as its specializedFrom attribute value

    if (!!parent) {
      result += this.importsToInject;

      result += `# ${component.displayName}`;
      result += appendArticleId(component.displayName);
      result += "\n\n";

      result += addDeprecationMessage(component.deprecationMessage);
      result += addComponentStatusDisclaimer(component.status);
      result += addNonVisualDisclaimer(component.nonVisual);

      result += addParentLinkLine(parent.displayName, basename(this.outFolder));

      const siblings = findSiblings(this.metadata, component);
      result += addSiblingLinkLine(siblings, basename(this.outFolder));

      result += fileData || "There is no description for this component as of yet.";
      result += `\n\n`;
    } else {
      logger.info("Processing imports section");

      result += this.importsToInject;

      const { buffer, copyFilePaths } = addImportsSection(
        fileData,
        component,
        this.sourceFolder,
        this.outFolder,
        this.examplesFolder,
      );
      if (buffer) {
        result += `${buffer}\n`;
        copyImports(copyFilePaths);
      }

      result += `# ${component.displayName}`;
      result += appendArticleId(component.displayName);
      result += "\n\n";

      result += addDeprecationMessage(component.deprecationMessage);
      result += addComponentStatusDisclaimer(component.status);
      result += addNonVisualDisclaimer(component.nonVisual);

      result += combineDescriptionAndDescriptionRef(
        fileData,
        component,
        METADATA_SECTIONS.DESCRIPTION,
      );

      // Add context variables if they exist
      if (component.contextVars && Object.keys(component.contextVars ?? {}).length > 0) {
        result += "\n\n**Context variables available during execution:**";
        result += "\n\n";

        // Use pattern utility for processing context variables
        processComponentSection(
          component.contextVars,
          (contextVarName, contextVar) => {
            if (contextVar.description) {
              result += `- \`${contextVarName}\`: ${contextVar.description}\n`;
            }
          },
          {
            filter: (name, contextVar) => !contextVar.isInternal && contextVar.description,
          },
        );
      }

      result += "\n\n";

      result += addChildrenTemplateSection(component);
      result += "\n\n";

      result += addBehaviorsSection(component);
      result += "\n\n";

      result += addPropsSection(fileData, component);
      result += "\n\n";

      result += addEventsSection(fileData, component);
      result += "\n\n";

      result += addApisSection(fileData, component);
      result += "\n\n";

      const partsSection = addPartsSection(fileData, component);
      if (partsSection) {
        result += partsSection;
        result += "\n\n";
      }

      result += addStylesSection(fileData, component);
      result += "\n";

      result = removeAdjacentNewlines(strBufferToLines(result)).join("\n");
    }

    try {
      writeFileSync(join(this.outFolder, `${component.displayName}.md`), result);
      componentNames.push(component.displayName);
    } catch (error) {
      logger.error("Could not write markdown file: ", error?.message || "unknown error");
    }
    return componentNames;
  }
}

// --- File & String Processing

function addImportsSection(data, component, sourceFolder, outFolder, examplesFolder) {
  // This array is used in the transformer function
  const copyFilePaths = [];
  const buffer = getSection(
    data,
    component[SECTION_DESCRIPTION_REF],
    METADATA_SECTIONS.IMPORTS,
    importPathTransformer,
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
          .filter((part) => !!part.trim()),
      ),
    ];
    // We assume that removing the ;-s and/or the \n-s will leave an even number of parts: an import statement & an import path
    if (splitNormalized.length % 2 !== 0) {
      throw new ErrorWithSeverity(
        "Malformed import statement found in: ",
        component.displayName,
        "Skipping imports",
        LOGGER_LEVELS.warning,
      );
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
      const transformedPath = join(
        examplesFolder,
        component.displayName,
        importFile.base,
      ).replaceAll(posix.sep, sep);

      // NOTE: need to use POSIX separators here regardless of platform
      transformedStatements += `${
        importStatements[i]
      } "${relative(outFolder, transformedPath).replaceAll(sep, posix.sep)}";\n`;

      // 3. Add the original and new import paths to an array to copy them later
      copyFilePaths.push({
        oldPath: join(sourceFolder, component.displayName, importFile.dir, importFile.base),
        newPath: relative(outFolder, transformedPath),
      });
    }

    return transformedStatements;
  }
}

function addBehaviorsSection(component) {
  logger.info(`Processing ${component.displayName} behaviors`);
  let buffer = `## Behaviors\n\n`;

  // Create a ComponentMetadataProvider for this component
  const componentMetadataProvider = new ComponentMetadataProvider({
    description: component.description || "",
    shortDescription: component.shortDescription || "",
    status: component.status || "stable",
    props: component.props || {},
    events: component.events || {},
    apis: component.apis || {},
    contextVars: component.contextVars || {},
    allowArbitraryProps: component.allowArbitraryProps || false,
    nonVisual: component.nonVisual || false,
  });

  // Get the list of excluded behaviors for this component
  const excludedBehaviors = component.excludeBehaviors || [];

  // Check which behaviors can attach to this component
  const applicableBehaviors = [];
  for (const [behaviorKey, behaviorMetadata] of Object.entries(collectedBehaviorMetadata)) {
    // Skip excluded behaviors
    if (excludedBehaviors.includes(behaviorMetadata.name)) {
      continue;
    }
    
    if (canBehaviorAttachToComponent(behaviorMetadata, componentMetadataProvider, component.displayName)) {
      // Collect distinct property names from triggerProps and props
      const triggerProps = behaviorMetadata.triggerProps || [];
      const additionalProps = Object.keys(behaviorMetadata.props || {});
      const allProps = [...new Set([...triggerProps, ...additionalProps])];
      
      applicableBehaviors.push({
        name: behaviorMetadata.friendlyName || behaviorMetadata.name,
        propKeys: allProps,
      });
    }
  }

  if (applicableBehaviors.length === 0) {
    return buffer + "No behaviors are applicable to this component.\n";
  }

  buffer += "This component supports the following behaviors:\n\n";
  
  buffer += createTable({
    headers: ["Behavior", "Properties"],
    rows: applicableBehaviors.map((behavior) => [
      behavior.name,
      behavior.propKeys.length > 0
        ? behavior.propKeys.map(prop => `\`${prop}\``).join(", ")
        : "N/A"
    ]),
  });

  return buffer;
}

function addPropsSection(data, component) {
  logger.info(`Processing ${component.displayName} props`);
  let buffer = `## ${SECTION_DISPLAY_NAMES.props}\n\n`;

  if (!component.props || Object.keys(component.props ?? {}).length === 0) {
    return buffer + "This component does not have any properties.";
  }

  // Use pattern utility for processing props
  processComponentSection(component.props, (propName, prop) => {
    const isRequired = prop.isRequired === true ? "This property is required." : "";
    const defaultValue =
      prop.defaultValue !== undefined
        ? `default: **${typeof prop.defaultValue === "string" ? `"${prop.defaultValue}"` : prop.defaultValue}**`
        : "";
    const propModifier = isRequired || defaultValue ? ` ${isRequired || defaultValue}` : "";
    buffer += `### \`${propName}\`\n\n${propModifier ? `> [!DEF] ${propModifier}\n\n` : ""}`;

    buffer += combineDescriptionAndDescriptionRef(data, prop, METADATA_SECTIONS.PROPS);
    buffer += "\n\n";
  });

  // Remove last newline
  buffer = buffer.slice(0, -2);
  return buffer;
}

function addApisSection(data, component) {
  logger.info(`Processing ${component.displayName} APIs`);
  let buffer = `## ${SECTION_DISPLAY_NAMES.apis}\n\n`;

  if (!component.apis || Object.keys(component.apis ?? {}).length === 0) {
    return buffer + "This component does not expose any methods.";
  }

  // Use pattern utility for processing APIs
  processComponentSection(component.apis, (apiName, api) => {
    buffer += `### \`${apiName}\`\n\n`;
    buffer += getComponentDescription(api);
    buffer += "\n\n";
    if (api.signature) {
      buffer += `**Signature**: \`${api.signature}\`\n\n`;
      if (api.parameters && Object.keys(api.parameters).length > 0) {
        Object.entries(api.parameters).forEach(([name, param]) => {
          buffer += `- \`${name}\`: ${param}\n`;
        });
        buffer += `\n`;
      }
    }
    buffer += getComponentDescriptionRef(data, api, METADATA_SECTIONS.API);
    buffer += "\n\n";
  });

  // Remove last newline
  buffer = buffer.slice(0, -2);
  return buffer;
}

function addEventsSection(data, component) {
  logger.info(`Processing ${component.displayName} events`);
  let buffer = `## ${SECTION_DISPLAY_NAMES.events}\n\n`;

  if (!component.events || Object.keys(component.events ?? {}).length === 0) {
    return buffer + "This component does not have any events.";
  }

  // Use pattern utility for processing events
  processComponentSection(component.events, (eventName, event) => {
    buffer += `### \`${eventName}\`\n\n`;
    buffer += getComponentDescription(event);
    buffer += "\n\n";
    if (event.signature) {
      buffer += `**Signature**: \`${event.signature}\`\n\n`;
      if (event.parameters && Object.keys(event.parameters).length > 0) {
        Object.entries(event.parameters).forEach(([name, param]) => {
          buffer += `- \`${name}\`: ${param}\n`;
        });
        buffer += `\n`;
      }
    }
    buffer += getComponentDescriptionRef(data, event, METADATA_SECTIONS.EVENTS);
    buffer += "\n\n";
  });

  // Remove last newline
  buffer = buffer.slice(0, -2);
  return buffer;
}

function addPartsSection(data, component) {
  logger.info(`Processing ${component.displayName} parts`);
  
  if (!component.parts || Object.keys(component.parts ?? {}).length === 0) {
    return "";
  }

  let buffer = `## ${SECTION_DISPLAY_NAMES.parts}\n\n`;

  // Add lead text for components with parts
  buffer += "The component has some parts that can be styled through layout properties and theme variables separately:\n\n";

  // Use pattern utility for processing parts
  processComponentSection(component.parts, (partName, part) => {
    buffer += `- **\`${partName}\`**: ${part.description}\n`;
  });

  // Add default part information if available
  if (component.defaultPart) {
    buffer += `\n**Default part**: \`${component.defaultPart}\`\n`;
  }

  return buffer;
}

function addStylesSection(data, component) {
  logger.info(`Processing ${component.displayName} styles`);

  let buffer = `## ${SECTION_DISPLAY_NAMES.styles}\n\n`;
  const fileBuffer = getSection(data, component[SECTION_DESCRIPTION_REF], METADATA_SECTIONS.STYLES);
  const varsTable = listThemeVars(component);

  let hasStylesSection = false;
  if (fileBuffer) {
    buffer += fileBuffer;
    hasStylesSection = true;
  }
  if (varsTable) {
    buffer += "\n\n### Theme Variables\n\n" + varsTable;
    buffer += addThemeVarDescriptions(component);
    hasStylesSection = true;
  }
  if (!hasStylesSection) {
    buffer += "This component does not have any styles.";
  }

  return buffer;
}

function getComponentDescription(component) {
  let descriptionBuffer = "";

  if (component[SECTION_DESCRIPTION]) {
    descriptionBuffer = component[SECTION_DESCRIPTION];
  }

  return descriptionBuffer;
}

function getComponentDescriptionRef(data, component, sectionId) {
  let fileBuffer = "";
  if (component.hasOwnProperty(SECTION_DESCRIPTION_REF) && component[SECTION_DESCRIPTION_REF]) {
    fileBuffer = getSection(data, component[SECTION_DESCRIPTION_REF], sectionId);
  }

  return fileBuffer;
}

function combineDescriptionAndDescriptionRef(
  data,
  component,
  sectionId,
  emptyDescriptionMessage = "No description provided.",
) {
  let descriptionBuffer = "";
  let fileBuffer = "";

  if (component[SECTION_DESCRIPTION]) {
    descriptionBuffer = component[SECTION_DESCRIPTION];
  }

  if (sectionId === METADATA_SECTIONS.PROPS) {
    const availableValuesBuffer = addAvailableValues(component);
    if (availableValuesBuffer) {
      descriptionBuffer += "\n\n" + availableValuesBuffer;
    }
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

function addChildrenTemplateSection(component) {
  if (!component.childrenAsTemplate) return "";
  if (!component.props.hasOwnProperty(component.childrenAsTemplate)) {
    return "";
  }
  const compName = component.displayName;
  const childrenAsTemplate = component.childrenAsTemplate;
  let buffer = "";
  buffer += "## Use children as Content Template\n\n";
  buffer +=
    `The [${childrenAsTemplate}](#${childrenAsTemplate.toLowerCase()}) property can be replaced by ` +
    `setting the item template component directly as the ${compName}'s child.\n`;
  buffer += `In the following example, the two ${compName} are functionally the same:\n\n`;
  buffer += "```xmlui copy\n";
  buffer += "<App>\n";
  buffer += `  <!-- This is the same -->\n`;
  buffer += `  <${compName}>\n`;
  buffer += `    <property name="${childrenAsTemplate}">\n`;
  buffer += `      <Text>Template</Text>\n`;
  buffer += `    </property>\n`;
  buffer += `  </${compName}>\n`;
  buffer += `  <!-- As this -->\n`;
  buffer += `  <${compName}>\n`;
  buffer += `    <Text>Template</Text>\n`;
  buffer += `  </${compName}>\n`;
  buffer += "</App>\n";
  buffer += "```\n\n";
  return buffer;
}

function getSection(data, sectionRef, sectionId, transformer = (contents) => contents) {
  const separator = "?";
  const descRefParts = sectionRef.split(separator);
  const sectionName = descRefParts.length > 1 ? descRefParts[1] : "";

  try {
    if (!acceptSection(sectionId, sectionName)) {
      throw new ErrorWithSeverity(
        `Invalid section name and ID: ${sectionName} and ${sectionId}`,
        LOGGER_LEVELS.warning,
      );
    }
    const sectionHeader = DIRECTIVE_CONFIG.SECTION_MAP[sectionId];
    if (!sectionHeader) {
      throw new ErrorWithSeverity(`Unknown section ID: ${sectionId}`, LOGGER_LEVELS.warning);
    }

    const startDirective = `${DIRECTIVE_CONFIG.INDICATOR}${sectionHeader}-START${
      sectionName ? ` ${sectionName}` : ""
    }`;
    const endDirective = `${DIRECTIVE_CONFIG.INDICATOR}${sectionHeader}-END`;
    const contents = resolveSection(data, startDirective, endDirective);

    return transformer(contents);
  } catch (error) {
    logger.error(error);
  }
}

function acceptSection(sectionId, sectionName) {
  if (sectionId === METADATA_SECTIONS.PROPS && !sectionName) return false;
  if (sectionId === METADATA_SECTIONS.EVENTS && !sectionName) return false;
  return true;
}

function resolveSection(data, startDirective, endDirective) {
  startDirective = startDirective.replaceAll("$", "\\$");
  endDirective = endDirective.replaceAll("$", "\\$");
  const match = data.match(new RegExp(`${startDirective}([\\s\\S]*?)${endDirective}`, "i"));
  if (!match || match?.length === 0) {
    return "";
  }

  let section = match[1];
  let sectionLines = strBufferToLines(section);

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
  const metaStart = `${DIRECTIVE_CONFIG.INDICATOR}META`;

  buffer.forEach((line) => {
    if (line.startsWith(metaStart)) {
      buffer[buffer.indexOf(line)] = "";
    }
  });

  return buffer;
}

function findParent(metadata, component) {
  return component.specializedFrom
    ? metadata.find((otherComponent) => otherComponent.displayName === component.specializedFrom)
    : null;
}

function addParentLinkLine(parentName, componentDocsFolder) {
  // TODO: Insert component link
  const result = parentName
    ? `This component is inherited from [${parentName}](/${componentDocsFolder}/${parentName})`
    : "";
  return result ? `${result}\n\n` : "";
}

function findSiblings(metadata, component) {
  return metadata.filter(
    (otherComponent) =>
      otherComponent.specializedFrom === component.specializedFrom &&
      otherComponent.displayName !== component.displayName,
  );
}

function addSiblingLinkLine(siblings = [], componentDocsFolder) {
  const result =
    siblings?.length > 0
      ? `See also: ${siblings
          .map((sibling) => {
            return `[${sibling.displayName}](/${componentDocsFolder}/${sibling.displayName})`;
          })
          .join(", ")}`
      : "";
  return result ? `${result}\n\n` : "";
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
    throw new ErrorWithSeverity(`File ${filePath} does not exist.`, LOGGER_LEVELS.warning);
  }
  if (isDirectory(filePath)) {
    throw new ErrorWithSeverity(
      `File ${filePath} is a directory, cannot be processed.`,
      LOGGER_LEVELS.warning,
    );
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

// --- Section helpers (string manipulation)

function addDeprecationMessage(deprecationMessage) {
  if (!deprecationMessage || deprecationMessage.trim() === "") {
    return "";
  }
  return `>[!WARNING]\n> ${deprecationMessage}\n\n`;
}

function addComponentStatusDisclaimer(status) {
  let disclaimer = "";
  switch (status) {
    case "stable":
      disclaimer = "";
      break;
    // --- Tempoparily removed
    // case "experimental":
    //   disclaimer =
    //     "This component is in an **experimental** state; you can use it in your app. " +
    //     "However, we may modify it, and it may even have breaking changes in the future.";
    //   break;
    case "deprecated":
      disclaimer =
        "This component has been **deprecated**. We may remove it in a future XMLUI version.";
      break;
    case "in progress":
      disclaimer =
        "This component's implementation is **in progress**. This documentation shows the component's planned interface.";
      break;
    default:
      disclaimer = "";
  }

  return disclaimer !== "" ? `>[!WARNING]\n> ${disclaimer}` : "";
}

function appendArticleId(articleId) {
  if (!articleId) return "";
  return ` [#${articleId.toLocaleLowerCase().replace(" ", "-")}]`;
}

function addNonVisualDisclaimer(isNonVisual) {
  return ""; // Temporarily disabled
  // return isNonVisual
  //   ? ">[!WARNING]\n> This component does not show up on the UI; " +
  //       "it merely helps implement UI logic.\n\n"
  //   : "";
}

function addAvailableValues(component) {
  if (
    !(
      component.availableValues &&
      Array.isArray(component.availableValues) &&
      component.availableValues.length > 0
    )
  ) {
    return "";
  }

  let availableValuesBuffer = "";
  const valuesType = typeof component.availableValues[0];
  const valuesTypeIsPrimitive = valuesType === "string" || valuesType === "number";

  if (valuesType === "string" || valuesType === "number") {
    availableValuesBuffer = component.availableValues
      .map((v) => `\`${v}\`${appendDefaultIndicator(v)}`)
      .join(", ");
  } else if (valuesType === "object") {
    availableValuesBuffer = createTable({
      headers: COMMON_TABLE_HEADERS.VALUE_DESCRIPTION,
      rows: component.availableValues.map((v) => [
        `\`${v.value}\``,
        `${v.description}${appendDefaultIndicator(v.value)}`,
      ]),
    });
  }

  if (availableValuesBuffer) {
    return `Available values:${valuesTypeIsPrimitive ? " " : "\n\n"}${availableValuesBuffer}`;
  }
  return "";

  function appendDefaultIndicator(value) {
    return component.defaultValue === value ? " **(default)**" : "";
  }
}

function listThemeVars(component) {
  if (!component.themeVars) {
    return "";
  }

  const defaultThemeVars = component.defaultThemeVars
    ? flattenDefaultThemeVarKeys(component.defaultThemeVars)
    : [];

  const allThemeVars = Array.from(
    new Set([...defaultThemeVars, ...Object.keys(component.themeVars)]),
  );

  const varsWithDefaults = allThemeVars
    .sort((a, b) => {
      // --- Sort by removing the optional base component prefix
      const partsA = a.split(":");
      const partsB = b.split(":");
      const partAValue = partsA.length > 1 ? partsA[1] : partsA[0];
      const partBValue = partsB.length > 1 ? partsB[1] : partsB[0];
      return partAValue.localeCompare(partBValue);
    })
    // --- Only list theme vars that contain the component name
    .filter(
      (themeVar) =>
        !component.limitThemeVarsToComponent || themeVar.indexOf(component.displayName) !== -1,
    )
    .map((themeVar) => {
      const parts = themeVar.split(":");
      if (parts.length > 1) {
        themeVar = parts[1];
      }

      const defaultLightVar =
        component.defaultThemeVars?.["light"]?.[themeVar] ||
        component.defaultThemeVars?.[themeVar] ||
        "*none*";
      const defaultDarkVar =
        component.defaultThemeVars?.["dark"]?.[themeVar] ||
        component.defaultThemeVars?.[themeVar] ||
        "*none*";

      return [provideLinkForThemeVar(themeVar), defaultLightVar, defaultDarkVar];
    });

  return varsWithDefaults.length === 0
    ? ""
    : createTable({
        headers: ["Variable", "Default Value (Light)", "Default Value (Dark)"],
        rows: varsWithDefaults,
      });

  function flattenDefaultThemeVarKeys(defaultThemeVars) {
    const lightDefaults = defaultThemeVars?.["light"] || [];
    if (lightDefaults.length > 0) {
      defaultThemeVars["light"] = undefined;
      delete defaultThemeVars["light"];
    }

    const darkDefaults = defaultThemeVars?.["dark"] || [];
    if (darkDefaults.length > 0) {
      defaultThemeVars["dark"] = undefined;
      delete defaultThemeVars["dark"];
    }

    return Array.from(
      new Set([
        ...Object.keys(defaultThemeVars).filter((key) => key !== "light" && key !== "dark"),
        ...Object.keys?.(lightDefaults),
        ...Object.keys?.(darkDefaults),
      ]),
    );
  }

  function provideLinkForThemeVar(themeVar) {
    if (!themeVar) {
      return "";
    }

    const themeKeywords = Object.keys(themeKeywordLinks);
    const matches = themeKeywords.filter((item) => themeVar.includes(item));
    if (matches.length === 0) {
      return themeVar;
    }

    const result = matches.reduce((longest, current) =>
      current.length > longest.length ? current : longest,
    );

    const parts = themeVar.split(result);
    return parts[0] + themeKeywordLinks[result] + parts[1];
  }
}

/**
 * Creates a buffer that contains the section with the theme variable descriptions
 * @param {Record<string, any>} component Record containing component metadata
 * @returns Buffer with a table of theme variable keys and their descriptions
 */
function addThemeVarDescriptions(component) {
  if (!component.themeVarDescriptions || Object.keys(component.themeVarDescriptions).length === 0) {
    return "";
  }
  let buffer = "\n\n### Variable Explanations\n\n";

  buffer += createTable({
    headers: COMMON_TABLE_HEADERS.THEME_VARIABLE_DESCRIPTION,
    rows: Object.entries(component.themeVarDescriptions).map(([themeVar, description]) => [
      `**\`${themeVar}\`**`,
      description,
    ]),
  });

  return buffer + "\n\n";
}

// Use this object/map to replace the occurrences of the keys and have them be replaced by links
const themeKeywordLinks = {
  animation: "[animation](../styles-and-themes/layout-props/#animation)",
  animationDuration: "[animationDuration](../styles-and-themes/layout-props/#animationDuration)",
  color: "[color](../styles-and-themes/common-units/#color)",
  borderColor: "[borderColor](../styles-and-themes/common-units/#color)",
  borderBottomColor: "[borderBottomColor](../styles-and-themes/common-units/#color)",
  borderTopColor: "[borderTopColor](../styles-and-themes/common-units/#color)",
  borderHorizontalColor: "[borderHorizontalColor](../styles-and-themes/common-units/#color)",
  borderVerticalColor: "[borderVerticalColor](../styles-and-themes/common-units/#color)",
  borderRightColor: "[color](../styles-and-themes/common-units/#color)",
  borderLeftColor: "[color](../styles-and-themes/common-units/#color)",
  backgroundColor: "[backgroundColor](../styles-and-themes/common-units/#color)",
  textDecorationColor: "[textDecorationColor](../styles-and-themes/common-units/#color)",
  textColor: "[textColor](../styles-and-themes/common-units/#color)",
  fill: "[fill](../styles-and-themes/common-units/#color)",
  stroke: "[stroke](../styles-and-themes/common-units/#color)",
  fontWeight: "[fontWeight](../styles-and-themes/common-units/#fontWeight)",
  rounding: "[rounding](../styles-and-themes/common-units/#border-rounding)",
  borderStyle: "[borderStyle](../styles-and-themes/common-units/#border-style)",
  borderBottomStyle: "[borderBottomStyle](../styles-and-themes/common-units/#border-style)",
  borderTopStyle: "[borderTopStyle](../styles-and-themes/common-units/#border-style)",
  borderHorizontalStyle: "[borderHorizontalStyle](../styles-and-themes/common-units/#border-style)",
  borderVerticalStyle: "[borderVerticalStyle](../styles-and-themes/common-units/#border-style)",
  borderRightStyle: "[borderRightStyle](../styles-and-themes/common-units/#border-style)",
  borderLeftStyle: "[borderLeftStyle](../styles-and-themes/common-units/#border-style)",
  size: "[size](../styles-and-themes/common-units/#size)",
  fontSize: "[fontSize](../styles-and-themes/common-units/#size)",
  height: "[height](../styles-and-themes/common-units/#size)",
  minHeight: "[minHeight](../styles-and-themes/common-units/#size)",
  maxHeight: "[maxHeight](../styles-and-themes/common-units/#size)",
  width: "[width](../styles-and-themes/common-units/#size)",
  minWidth: "[minWidth](../styles-and-themes/common-units/#size)",
  maxWidth: "[maxWidth](../styles-and-themes/common-units/#size)",
  distance: "[distance](../styles-and-themes/common-units/#size)",
  thickness: "[thickness](../styles-and-themes/common-units/#size)",
  borderWidth: "[borderWidth](../styles-and-themes/common-units/#size)",
  borderBottomWidth: "[borderBottomWidth](../styles-and-themes/common-units/#size)",
  borderTopWidth: "[borderTopWidth](../styles-and-themes/common-units/#size)",
  borderHorizontalWidth: "[borderHorizontalWidth](../styles-and-themes/common-units/#size)",
  borderVerticalWidth: "[borderVerticalWidth](../styles-and-themes/common-units/#size)",
  borderRightWidth: "[borderRightWidth](../styles-and-themes/common-units/#size)",
  borderLeftWidth: "[borderLeftWidth](../styles-and-themes/common-units/#size)",
  textDecorationThickness: "[textDecorationThickness](../styles-and-themes/common-units/#size)",
  strokeWidth: "[strokeWidth](../styles-and-themes/common-units/#size)",
  offset: "[offset](../styles-and-themes/common-units/#size)",
  padding: "[padding](../styles-and-themes/common-units/#size)",
  paddingTop: "[paddingTop](../styles-and-themes/common-units/#size)",
  paddingRight: "[paddingRight](../styles-and-themes/common-units/#size)",
  paddingBottom: "[paddingBottom](../styles-and-themes/common-units/#size)",
  paddingLeft: "[paddingLeft](../styles-and-themes/common-units/#size)",
  paddingHorizontal: "[paddingHorizontal](../styles-and-themes/common-units/#size)",
  paddingVertical: "[paddingVertical](../styles-and-themes/common-units/#size)",
  margin: "[margin](../styles-and-themes/common-units/#size)",
  marginTop: "[marginTop](../styles-and-themes/common-units/#size)",
  marginBottom: "[marginBottom](../styles-and-themes/common-units/#size)",
  marginLeft: "[marginLeft](../styles-and-themes/common-units/#size)",
  marginRight: "[marginRight](../styles-and-themes/common-units/#size)",
  textDecorationLine: "[textDecorationLine](../styles-and-themes/common-units/#textDecoration)",
  lineHeight: "[lineHeight](../styles-and-themes/common-units/#size)",
  borderEndEndRadius: "[borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)",
  borderEndStartRadius:
    "[borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)",
  borderStartEndRadius:
    "[borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)",
  borderStartStartRadius:
    "[borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)",
  borderRadius: "[borderRadius](../styles-and-themes/common-units/#border-rounding)",
  borderHorizontal: "[borderHorizontal](../styles-and-themes/common-units/#border)",
  borderVertical: "[borderHorizontal](../styles-and-themes/common-units/#border)",
  border: "[border](../styles-and-themes/common-units/#border)",
  borderLeft: "[borderLeft](../styles-and-themes/common-units/#border)",
  borderRight: "[borderRight](../styles-and-themes/common-units/#border)",
  borderTop: "[borderTop](../styles-and-themes/common-units/#border)",
  borderBottom: "[borderBottom](../styles-and-themes/common-units/#border)",
  boxShadow: "[boxShadow](../styles-and-themes/common-units/#boxShadow)",
  direction: "[direction](../styles-and-themes/layout-props#direction)",
  gap: "[gap](../styles-and-themes/common-units/#size)",
  horizontalAlignment: "[horizontalAlignment](../styles-and-themes/common-units/#alignment)",
  verticalAlignment: "[verticalAlignment](../styles-and-themes/common-units/#alignment)",
  alignment: "[alignment](../styles-and-themes/common-units/#alignment)",
  fontFamily: "[fontFamily](../styles-and-themes/common-units/#fontFamily)",
  fontStretch: "[fontStretch](../styles-and-themes/common-units/#fontStretch)",
  fontStyle: "[fontStyle](../styles-and-themes/common-units/#fontStyle)",
  letterSpacing: "[letterSpacing](../styles-and-themes/common-units/#size)",
  textDecorationStyle: "[textDecorationStyle](../styles-and-themes/common-units/#textDecoration)",
  textDecorationThickness:
    "[textDecorationThickness](../styles-and-themes/common-units/#textDecoration)",
  textTransform: "[textTransform](../styles-and-themes/common-units/#textTransform)",
  "maxWidth-content": "[maxWidth-content](../styles-and-themes/common-units/#size)",
  outlineStyle: "[outlineStyle](../styles-and-themes/common-units/#border)",
  outlineWidth: "[outlineWidth](../styles-and-themes/common-units/#size)",
  outlineColor: "[outlineColor](../styles-and-themes/common-units/#color)",
  outlineOffset: "[outlineOffset](../styles-and-themes/common-units/#size)",
  textUnderlineOffset: "[textUnderlineOffset](../styles-and-themes/common-units/#size)",
  opacity: "[opacity](../styles-and-themes/common-units/#opacity)",
  cursor: "[cursor](../styles-and-themes/common-units/#cursor)",
  fontVariant: "[fontVariant](../styles-and-themes/common-units/#font-variant)",
  lineBreak: "[lineBreak](../styles-and-themes/common-units/#line-break)",
  textAlign: "[textAlign](../styles-and-themes/common-units/#text-align)",
  textAlignLast: "[textAlignLast](../styles-and-themes/common-units/#text-align)",
  textIndent: "[textIndent](../styles-and-themes/common-units/#text-indent)",
  textShadow: "[textShadow](../styles-and-themes/common-units/#text-shadow)",
  wordBreak: "[wordBreak](../styles-and-themes/common-units/#word-break)",
  wordSpacing: "[wordSpacing](../styles-and-themes/common-units/#word-spacing)",
  wordWrap: "[wordWrap](../styles-and-themes/common-units/#word-wrap)",
  writingMode: "[writingMode](../styles-and-themes/common-units/#writing-mode)",
  transition: "[transition](../styles-and-themes/common-units/#transition)",
};
