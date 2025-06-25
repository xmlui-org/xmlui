import { join, dirname } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { collectedThemes, collectedComponentMetadata } from "../../dist/metadata/xmlui-metadata.mjs";
import { ERROR_HANDLING, ERROR_MESSAGES } from "./constants.mjs";
import { handleFatalError, validateDependencies, withFileErrorHandling } from "./error-handling.mjs";
import { createScopedLogger } from "./logging-standards.mjs";

const OUTPUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../dist/themes");
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

    // --- Extract theme variable information from components
    let themeVarsData = {};
    let light = {};
    let dark = {};

    // --- Obtain theme variables from components

    // --- Obtain theme variables from components
    Object.keys(collectedComponentMetadata)
      //.toSorted() <- Not supported in Node versions under 20
      .slice().sort()
      .forEach((key) => {
        const component = collectedComponentMetadata[key];
        const { themeVars, defaultThemeVars } = component;

        logger.componentProcessing(key);

        if (themeVars) {
          // --- Component-specific theme variables

          // --- Get the theme variable keys
          const themeVarKeys = [...Object.keys(themeVars), ...Object.keys(defaultThemeVars ?? {})];
          const themeVarKeysWithoutTones = themeVarKeys.filter(
            (key) => ["light", "dark"].indexOf(key) === -1,
          );

          // --- Iterate through the component-specific theme variables
          let compThemeVars = {};
          themeVarKeysWithoutTones.forEach((themeVarKey) => {
            // --- Get the theme variable values
            compThemeVars[themeVarKey] = defaultThemeVars?.[themeVarKey] ?? null;
          });
          themeVarsData = {...themeVarsData, ...compThemeVars};
          
          // --- Iterate through the component-specific light theme variables
          let compLight = {};
          const lightKeys = [...Object.keys(defaultThemeVars?.light ?? {})];
          lightKeys.forEach((themeVarKey) => {
            // --- Get the theme variable values
            compLight[themeVarKey] = defaultThemeVars?.light?.[themeVarKey] ?? null;
          });
          light = {...light, ...compLight};

          // --- Iterate through the component-specific dark theme variables
          let compDark = {};
          const darkKeys = [...Object.keys(defaultThemeVars?.dark ?? {})];
          darkKeys.forEach((themeVarKey) => {
            // --- Get the theme variable values
            compDark[themeVarKey] = defaultThemeVars?.dark?.[themeVarKey] ?? null;
          });
          dark = {...dark, ...compDark};
        }
      });

    themeVarsData.light = light;
    themeVarsData.dark = dark;

    // Write theme files with error handling
    for (const [themeName, themeData] of Object.entries(collectedThemes)) {
      // --- No output for the abstract root theme
      if (themeName === "root") continue;

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
            ...themeVarsData,
            light: { ...themeData.themeVars.light, ...themeVarsData.light },
            dark: { ...themeData.themeVars.dark, ...themeVarsData.dark },
          },
        },
        null,
        2,
      );

      logger.fileWritten(themePath);

      await withFileErrorHandling(
        () => writeFileSync(themePath, themeContent),
        themePath,
        "write"
      );
    }

    logger.operationComplete("theme file generation");
    
  } catch (error) {
    handleFatalError(error, ERROR_HANDLING.EXIT_CODES.GENERAL_ERROR, "theme file generation");
  }
}

// Execute the main function
generateThemeFiles();