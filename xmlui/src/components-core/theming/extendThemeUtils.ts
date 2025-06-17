import { cloneDeep } from "lodash-es";

import { RootThemeDefinition } from "../theming/themes/root";
import { DefaultThemeVars, ThemeDefinition, ThemeDefinitionDetails, ThemeTone } from "../../abstractions/ThemingDefs";

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
  componentDefaultThemeVars: DefaultThemeVars,
) {
  const rootThemeVars: Record<string, string> = cloneDeep(RootThemeDefinition.themeVars) || {};
  const rootTones: Record<string | ThemeTone, ThemeDefinitionDetails> = cloneDeep(RootThemeDefinition.tones) || {};
  Object.entries(componentDefaultThemeVars).forEach(([key, value]) => {
    if (typeof value === "string") {
      rootThemeVars[key.trim()] = value;
    } else {
      Object.entries(value).forEach(([themeVarKey, themeVarVal]) => {
        if (!rootTones[key]) {
          rootTones[key] = { themeVars: {} };
        }
        rootTones[key].themeVars = {
          ...rootTones[key].themeVars,
          [themeVarKey.trim()]: themeVarVal,
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
