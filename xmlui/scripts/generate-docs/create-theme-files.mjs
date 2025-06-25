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
    await iterateObjectEntries(collectedThemes, async (themeName, themeData) => {
      // Skip the abstract root theme
      if (themeName === "root") return;

      const themePath = join(OUTPUT_DIR, `${themeName}.json`);
      const themeContent = JSON.stringify(
        {
          ...themeData,
          themeVars: {
            "--- App-bound root theme variables": "",
            ...rootTheme.themeVars,
            "--- App-bound theme-specific variables": "",
            ...themeData.themeVars,
            "--- Component-bound theme variables": "",
            ...themeVarsData.base,
            light: { ...themeData.themeVars.light, ...themeVarsData.light },
            dark: { ...themeData.themeVars.dark, ...themeVarsData.dark },
          },
        },
        null,
        2,
      );

      await writeFileWithLogging(themePath, themeContent, logger);
    }, { async: true });

    logger.operationComplete("theme file generation");
    
  } catch (error) {
    handleFatalError(error, ERROR_HANDLING.EXIT_CODES.GENERAL_ERROR, "theme file generation");
  }
}

// Execute the main function
generateThemeFiles();