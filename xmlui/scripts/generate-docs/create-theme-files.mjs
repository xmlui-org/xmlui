import { join, dirname } from "path";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { collectedThemes, collectedComponentMetadata } from "../../dist/metadata/xmlui-metadata.mjs";
import { ERROR_HANDLING, ERROR_MESSAGES } from "./constants.mjs";
import { handleFatalError, validateDependencies } from "./error-handling.mjs";
import { createScopedLogger } from "./logging-standards.mjs";
import { pathResolver } from "./configuration-management.mjs";
import { 
  processComponentThemeVars, 
  iterateObjectEntries,
  writeFileWithLogging 
} from "./pattern-utilities.mjs";

const OUTPUT_DIR = pathResolver.getOutputPaths().themes;
const logger = createScopedLogger("ThemeGenerator");

/**
 * Counts the number of theme variables, excluding those that start with "---"
 * @param {Object} themeVars - The theme variables object
 * @returns {number} - The count of non-separator theme variables
 */
function countThemeVars(themeVars) {
  if (!themeVars || typeof themeVars !== 'object') {
    return 0;
  }
  
  return Object.keys(themeVars).filter(key => !key.startsWith("---")).length;
}

async function generateThemeFiles() {
  logger.operationStart("theme file generation");
  
  try {
    // --- Create the output folder
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Validate required dependencies
    validateDependencies({
      THEME_INFO: collectedThemes,
      COMPONENT_METADATA: collectedComponentMetadata
    });

    const rootTheme = collectedThemes.root;

    // Extract theme variable information from components using utility
    const themeVarsData = processComponentThemeVars(collectedComponentMetadata, logger);

    // Write theme files with error handling
    let totalThemeVars = 0;
    let exportedThemeCount = 0;
    
    await iterateObjectEntries(collectedThemes, async (themeName, themeData) => {
      // Skip the abstract root theme
      if (themeName === "root") return;

      // Prepare the complete theme vars object
      const completeThemeVars = {
        "--- App-bound root theme variables": "",
        ...rootTheme.themeVars,
        "--- App-bound theme-specific variables": "",
        ...themeData.themeVars,
        "--- Component-bound theme variables": "",
        ...themeVarsData.base,
        light: { ...themeData.themeVars.light, ...themeVarsData.light },
        dark: { ...themeData.themeVars.dark, ...themeVarsData.dark },
      };

      // Count theme vars (excluding separators)
      const themeVarCount = countThemeVars(completeThemeVars);
      totalThemeVars += themeVarCount;
      exportedThemeCount++;
      
      const themePath = join(OUTPUT_DIR, `${themeName}.json`);
      const themeContent = JSON.stringify(
        {
          ...themeData,
          themeVars: completeThemeVars,
        },
        null,
        2,
      );

      await writeFileWithLogging(themePath, themeContent, logger);
      
      logger.info(`Theme '${themeName}' exported with ${themeVarCount} theme variables`);
    }, { async: true });
    
    // Display summary of all exported themes
    if (exportedThemeCount > 0) {
      logger.info(`\n=== Theme Export Summary ===`);
      logger.info(`Exported ${exportedThemeCount} theme files with a total of ${totalThemeVars} theme variables`);
      logger.info(`Average of ${Math.round(totalThemeVars / exportedThemeCount)} theme variables per theme file`);
    }

    logger.operationComplete("theme file generation");
    
  } catch (error) {
    handleFatalError(error, ERROR_HANDLING.EXIT_CODES.GENERAL_ERROR, "theme file generation");
  }
}

// Execute the main function
generateThemeFiles();