import { ComponentMetadata } from "../../abstractions/ComponentDefs";
import { useTheme } from "./ThemeContext";
import { useMemo } from "react";
import { useStyles } from "./StyleContext";
import { THEME_VAR_PREFIX } from "./component-layout-resolver";
import { useComponentRegistry } from "../../components/ComponentRegistryContext";

/**
 * Each theme can have a light or a dark tone.
 */
export const ThemeToneKeys = ["light", "dark"] as const;

export const SizeScaleKeys = {
  // small scale
  none: "none",
  xs: "xs",
  sm: "sm",
  md: "md",
  // large scale
  lg: "lg",
  xl: "xl",
  "2xl": "2xl",
  "3xl": "3xl",
} as const;

export const SizeScaleReadableKeys = {
  // small scale
  none: "None",
  xs: "Extra Small",
  sm: "Small",
  md: "Medium",
  // large scale
  lg: "Large",
  xl: "Extra Large",
  "2xl": "Double Extra Large",
  "3xl": "Triple Extra Large",
} as const;

export function useComponentThemeClass(descriptor: ComponentMetadata) {
  let themeScope = useTheme();
  //console.log({ descriptor, themeScope });
  const componentRegistry = useComponentRegistry();

  const themeVars = useMemo(() => {
    const ret = {};
    let collectedThemeVars = {
      ...(descriptor?.themeVars || {}),
      ...(descriptor?.defaultThemeVars || {}),
    };
    const contributorComponents = descriptor?.themeVarContributorComponents || [];
    contributorComponents.forEach((componentName) => {
      const componentThmemeVars =
        componentRegistry.lookupComponentRenderer(componentName)?.descriptor?.themeVars;
      const componentDefaultThemeVars =
        componentRegistry.lookupComponentRenderer(componentName)?.descriptor?.defaultThemeVars;
      collectedThemeVars = {
        ...collectedThemeVars,
        ...(componentThmemeVars || {}),
        ...(componentDefaultThemeVars || {}),
      };
    });

    Object.entries(collectedThemeVars).forEach(([key]) => {
      let keyWithoutClass = key.replace("Input:", "").replace("Heading:", "");
      // Use themeScope.themeVars (allThemeVarsWithResolvedHierarchicalVars) instead of getThemeVar,
      // because getThemeVar only follows pure $-reference chains and does NOT resolve embedded
      // $-references in compound values like "1px solid $borderColor".
      // themeScope.themeVars has already gone through resolveThemeVarsWithCssVars, which converts
      // all $varName occurrences to var(--xmlui-varName), even inside compound values.
      let themeVar = themeScope.themeVars[keyWithoutClass];
      if (themeVar !== undefined) {
        ret[`--${THEME_VAR_PREFIX}-` + keyWithoutClass] = themeVar;
      }
    });

    return ret;
  }, [descriptor?.defaultThemeVars, descriptor?.themeVars, themeScope]);

  return useStyles(themeVars);
}
