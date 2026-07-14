import { useMemo } from "react";

import type { ComponentMetadata } from "../../component-core/metadata";
import { useComponentRegistry } from "../../components/ComponentRegistryContext";
import { THEME_VAR_PREFIX } from "./layout-resolver";
import { useStyles } from "./StyleContext";
import { useTheme } from "./ThemeContext";

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

export function useComponentThemeClass(
  descriptor: ComponentMetadata,
  explicitContributors: readonly ComponentMetadata[] = [],
) {
  const themeScope = useTheme();
  const componentRegistry = useComponentRegistry();

  const themeVars = useMemo(() => {
    const ret: Record<string, string> = {};

    let collectedThemeVars = {
      ...(descriptor?.themeVars || {}),
      ...(descriptor?.defaultThemeVars || {}),
    };

    if (explicitContributors.length > 0) {
      for (const contributorDescriptor of explicitContributors) {
        collectedThemeVars = {
          ...collectedThemeVars,
          ...(contributorDescriptor.themeVars || {}),
          ...(contributorDescriptor.defaultThemeVars || {}),
        };
      }
    } else if (descriptor?.themeVarContributorComponents) {
      descriptor.themeVarContributorComponents.forEach((contributorComponent) => {
        const contributorDescriptor = componentRegistry.lookupComponentRenderer(contributorComponent)?.descriptor;
        if (contributorDescriptor) {
          collectedThemeVars = {
            ...collectedThemeVars,
            ...(contributorDescriptor.themeVars || {}),
            ...(contributorDescriptor.defaultThemeVars || {}),
          };
        }
      });
    }

    Object.keys(collectedThemeVars).forEach((key) => {
      const keyWithoutClass = key.replace("Input:", "").replace("Heading:", "");
      const themeVar = themeScope.themeVars[keyWithoutClass];
      if (typeof themeVar === "string" && themeVar.trim() !== "") {
        ret[`--${THEME_VAR_PREFIX}-${keyWithoutClass}`] = themeVar;
      }
    });

    return ret;
  }, [
    descriptor?.themeVars,
    descriptor?.defaultThemeVars,
    descriptor?.themeVarContributorComponents,
    explicitContributors,
    themeScope.themeVars,
    componentRegistry,
  ]);

  return useStyles(themeVars, { layer: "themes" });
}

export function useThemeVariables(): Record<string, string> {
  const themeScope = useTheme();

  return useMemo(() => {
    const compatibleThemeVars: Record<string, string> = {};
    for (const [name, value] of Object.entries(themeScope.themeVars)) {
      if (!isBorderShorthandVar(name)) {
        compatibleThemeVars[name] = value;
      }
    }
    return compatibleThemeVars;
  }, [themeScope.themeVars]);
}

function isBorderShorthandVar(name: string): boolean {
  return /^(border|borderHorizontal|borderVertical|borderTop|borderRight|borderBottom|borderLeft)-/.test(name);
}
