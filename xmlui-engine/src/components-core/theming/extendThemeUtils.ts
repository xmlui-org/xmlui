import { cloneDeep } from "lodash-es";

import type { ThemeDefinition, ThemeDefinitionDetails, ThemeTone } from "@components-core/theming/abstractions";
import type { DefaultThemeVars } from "@components/ViewComponentRegistryContext";

import { RootThemeDefinition } from "@components-core/theming/themes/root";

function collectExtends(cTheme: ThemeDefinition | undefined, allThemes: Array<ThemeDefinition>) {
  if (!cTheme) {
    return [];
  }
  if (!cTheme.extends) {
    return [];
  }
  const arrayExtends = typeof cTheme.extends === "string" ? [cTheme.extends] : cTheme.extends;
  const ret: Array<ThemeDefinition> = [];

  arrayExtends.forEach((ext: string) => {
    const parentTheme = allThemes.find((theme) => theme.id === ext);
    if (parentTheme) {
      ret.push(...collectExtends(parentTheme, allThemes));
      ret.push(parentTheme);
    }
  });
  return ret;
}

export function collectThemeChainByExtends(
  customTheme: ThemeDefinition,
  allThemes: Array<ThemeDefinition>,
  componentDefaultThemeVars: DefaultThemeVars
) {
  const rootThemeVars: Record<string, string> = cloneDeep(RootThemeDefinition.themeVars) || {};
  const rootTones: Record<string | ThemeTone, ThemeDefinitionDetails> = cloneDeep(RootThemeDefinition.tones) || {};
  Object.entries(componentDefaultThemeVars).forEach(([key, value]) => {
    if (typeof value === "string") {
      rootThemeVars[key] = value;
    } else {
      Object.entries(value).forEach(([themeVarKey, themeVarVal]) => {
        if (!rootTones[key]) {
          rootTones[key] = { themeVars: {} };
        }
        rootTones[key].themeVars = {
          ...rootTones[key].themeVars,
          [themeVarKey]: themeVarVal,
        };
      });
    }
  });

  const root = {
    id: "root",
    themeVars: rootThemeVars,
    resources: {},
    tones: rootTones,
  };
  return [root, ...collectExtends(customTheme, allThemes), customTheme];
}

// --- Extends an existing theme with expanding theme variables
export function expandTheme(newTheme?: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  if (!newTheme) {
    return result;
  }

  // --- Iterate through new theme variables
  Object.keys(newTheme).forEach((key) => {
    // --- Set the theme variable
    result[key] = newTheme[key];

    // --- Check for variables to extend
    Object.keys(themeVariableExpansion).forEach((keyToCheck) => {
      if (!key.startsWith(keyToCheck + "-")) return;

      // --- Candidate for extension
      const varPart = key.substring(keyToCheck.length);
      const keysToExtend = themeVariableExpansion[keyToCheck];

      if (keysToExtend.some((kte) => key.startsWith(kte + "-"))) return;

      keysToExtend.forEach((keyToExtend) => {
        const fullKey = keyToExtend + varPart;
        result[fullKey] = newTheme[key];
      });
    });
  });

  // --- Done.
  return { ...result, ...newTheme };
}

type ThemeVariableExpansion = Record<string, string[]>;

const themeVariableExpansion: ThemeVariableExpansion = {
  padding: ["padding-horizontal", "padding-vertical", "padding-top", "padding-right", "padding-bottom", "padding-left"],
  "padding-horizontal": ["padding-left", "padding-right"],
  "padding-vertical": ["padding-top", "padding-bottom"],
  border: ["border-horizontal", "border-vertical", "border-top", "border-right", "border-bottom", "border-left"],
  "border-horizontal": ["border-left", "border-right"],
  "border-vertical": ["border-top", "border-bottom"],
  "color-border": [
    "color-border-horizontal",
    "color-border-vertical",
    "color-border-top",
    "color-border-right",
    "color-border-bottom",
    "color-border-left",
  ],
  "color-border-horizontal": ["color-border-left", "color-border-right"],
  "color-border-vertical": ["color-border-top", "color-border-bottom"],
  "thickness-border": [
    "thickness-border-horizontal",
    "thickness-border-vertical",
    "thickness-border-top",
    "thickness-border-right",
    "thickness-border-bottom",
    "thickness-border-left",
  ],
  "thickness-border-horizontal": ["thickness-border-left", "thickness-border-right"],
  "thickness-border-vertical": ["thickness-border-top", "thickness-border-bottom"],
  "style-border": [
    "style-border-horizontal",
    "style-border-vertical",
    "style-border-top",
    "style-border-right",
    "style-border-bottom",
    "style-border-left",
  ],
  "style-border-horizontal": ["style-border-left", "style-border-right"],
  "style-border-vertical": ["style-border-top", "style-border-bottom"],
};
