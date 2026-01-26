import { join } from "path";
import { writeFile } from "fs/promises";
import { logger, LOGGER_LEVELS } from "./logger.mjs";
import { collectedComponentMetadata } from "../../dist/metadata/xmlui-metadata.js";
import { FOLDERS } from "./folders.mjs";
import { createTable } from "./utils.mjs";

logger.setLevels(LOGGER_LEVELS.warning, LOGGER_LEVELS.error);

/**
 * Generates a comprehensive context variables summary page
 */
async function generateContextVariablesSummary() {
  logger.info("Generating context variables summary...");

  // Collect all context variables from all components
  const contextVarsByName = new Map();

  // Iterate through all components
  for (const [componentName, componentData] of Object.entries(collectedComponentMetadata)) {
    // Skip if component has no context variables
    if (!componentData.contextVars || Object.keys(componentData.contextVars).length === 0) {
      continue;
    }

    // Process each context variable in this component
    for (const [varName, varData] of Object.entries(componentData.contextVars)) {
      // Skip internal context variables
      if (varData.isInternal) {
        continue;
      }

      // Initialize the context variable entry if it doesn't exist
      if (!contextVarsByName.has(varName)) {
        contextVarsByName.set(varName, {
          name: varName,
          occurrences: [],
        });
      }

      // Add this component as an occurrence
      const varEntry = contextVarsByName.get(varName);
      varEntry.occurrences.push({
        componentName,
        description: varData.description || "No description provided",
      });
    }
  }

  // Sort context variables by name
  const sortedContextVars = Array.from(contextVarsByName.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Generate the markdown content
  let markdown = generateMarkdown(sortedContextVars);

  // Write to file
  const outputPath = join(FOLDERS.docsRoot, "content", "pages", "context-variables2.md");
  await writeFile(outputPath, markdown, "utf8");

  logger.info(`Context variables summary generated: ${outputPath}`);
  logger.info(`Total unique context variables: ${sortedContextVars.length}`);
}

/**
 * Generates the markdown content for the context variables summary
 * @param {Array} contextVars Array of context variable objects
 * @returns {string} Markdown content
 */
function generateMarkdown(contextVars) {
  let markdown = "";

  // Add header
  markdown += "# Context Variables Summary\n\n";
  markdown += "This page provides a comprehensive overview of all context variables exposed by XMLUI components. ";
  markdown += "Context variables are values that components make available to their children, accessible using the `$variableName` syntax.\n\n";

  // Add table of contents
  markdown += "## Available Context Variables\n\n";
  markdown += "Jump to:\n\n";
  for (const contextVar of contextVars) {
    const anchor = contextVar.name.toLowerCase().replace(/\$/g, "").replace(/[^a-z0-9-]/g, "-");
    markdown += `- [\`${contextVar.name}\`](#${anchor})\n`;
  }
  markdown += "\n---\n\n";

  // Generate section for each context variable
  for (const contextVar of contextVars) {
    markdown += generateContextVarSection(contextVar);
  }

  return markdown;
}

/**
 * Generates a section for a single context variable
 * @param {object} contextVar Context variable object with name and occurrences
 * @returns {string} Markdown section
 */
function generateContextVarSection(contextVar) {
  let section = "";
  const anchor = contextVar.name.toLowerCase().replace(/\$/g, "").replace(/[^a-z0-9-]/g, "-");

  // Add context variable name as heading
  section += `## \`${contextVar.name}\` [#${anchor}]\n\n`;

  // Generate summary description
  const summary = generateSummaryDescription(contextVar);
  section += `${summary}\n\n`;

  // Add "Used by" info
  if (contextVar.occurrences.length === 1) {
    section += `**Used by:** 1 component\n\n`;
  } else {
    section += `**Used by:** ${contextVar.occurrences.length} components\n\n`;
  }

  // Sort occurrences by component name
  const sortedOccurrences = contextVar.occurrences.sort((a, b) =>
    a.componentName.localeCompare(b.componentName)
  );

  // Create table of components that expose this context variable
  const tableRows = sortedOccurrences.map((occurrence) => {
    const componentLink = `[${occurrence.componentName}](/components/${occurrence.componentName})`;
    return [componentLink, occurrence.description];
  });

  const table = createTable({
    headers: ["Component", "Description"],
    rows: tableRows,
  });

  section += table;
  section += "\n";

  return section;
}

/**
 * Generates a summary description based on the occurrences
 * @param {object} contextVar Context variable object
 * @returns {string} Summary description
 */
function generateSummaryDescription(contextVar) {
  // If all components have the same description, use it
  const descriptions = contextVar.occurrences.map((occ) => occ.description);
  const uniqueDescriptions = [...new Set(descriptions)];

  if (uniqueDescriptions.length === 1) {
    return uniqueDescriptions[0];
  }

  // If descriptions vary, generate a generic summary
  const varNameWithoutDollar = contextVar.name.replace(/^\$/, "");
  
  // Try to infer what the variable represents based on its name
  if (varNameWithoutDollar.toLowerCase().includes("item")) {
    return `Provides access to the current item being rendered in a list or iteration context.`;
  } else if (varNameWithoutDollar.toLowerCase().includes("index")) {
    return `Provides the index of the current item in an iteration or list context.`;
  } else if (varNameWithoutDollar.toLowerCase().includes("value")) {
    return `Provides access to the current value in the component's context.`;
  } else if (varNameWithoutDollar.toLowerCase().includes("state")) {
    return `Provides access to the current state of the component.`;
  } else if (varNameWithoutDollar.toLowerCase().includes("data")) {
    return `Provides access to data exposed by the component.`;
  } else {
    return `Context variable exposed by the following components. See individual component descriptions for details.`;
  }
}

// Run the generation
await generateContextVariablesSummary();
