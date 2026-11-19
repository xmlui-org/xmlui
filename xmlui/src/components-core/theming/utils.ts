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

/**
 * The theme-variable object for a component type in a theme scope is the same for
 * every instance, so it's built once per (descriptor, scope theme vars, registry)
 * and shared (#3969). Every instance used to build its own 79-entry (Text) to
 * 221-entry (Button) object, keep it alive in a memo, and have `useStyles`
 * serialize it again; in WebKit that cost about 0.125 MB per instance.
 */
const componentThemeVarsCache = new WeakMap<
  object,
  WeakMap<object, WeakMap<object, Record<string, string>>>
>();

export function useComponentThemeClass(descriptor: ComponentMetadata) {
  let themeScope = useTheme();
  const componentRegistry = useComponentRegistry();

  const themeVars = useMemo(() => {
    // --- Shared per component type and theme scope
    const scopeVars = themeScope.themeVars as object | undefined;
    const byScope =
      descriptor && scopeVars && componentRegistry
        ? componentThemeVarsCache.get(descriptor)?.get(scopeVars)
        : undefined;
    const cached = byScope?.get(componentRegistry as object);
    if (cached) return cached;

    const ret = {};

    // --- Theme vars defined by the component itself
    let collectedThemeVars = {
      ...(descriptor?.themeVars || {}),
      ...(descriptor?.defaultThemeVars || {}),
    };

    if (descriptor?.themeVarContributorComponents) {
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

    Object.entries(collectedThemeVars).forEach(([key]) => {
      let keyWithoutClass = key.replace("Input:", "").replace("Heading:", "");
      // Use themeScope.themeVars (allThemeVarsWithResolvedHierarchicalVars) instead of getThemeVar,
      // because getThemeVar only follows pure $-reference chains and does NOT resolve embedded
      // $-references in compound values like "1px solid $borderColor".
      // themeScope.themeVars has already gone through resolveThemeVarsWithCssVars, which converts
      // all $varName occurrences to var(--xmlui-varName), even inside compound values.
      let themeVar = themeScope.themeVars[keyWithoutClass];
      if (themeVar != undefined && (typeof themeVar === "string" && themeVar.trim() !== "")) {
        ret[`--${THEME_VAR_PREFIX}-` + keyWithoutClass] = themeVar;
      }
    });

    if (descriptor && scopeVars && componentRegistry) {
      let perScope = componentThemeVarsCache.get(descriptor);
      if (!perScope) {
        perScope = new WeakMap();
        componentThemeVarsCache.set(descriptor, perScope);
      }
      let perRegistry = perScope.get(scopeVars);
      if (!perRegistry) {
        perRegistry = new WeakMap();
        perScope.set(scopeVars, perRegistry);
      }
      perRegistry.set(componentRegistry as object, ret);
    }
    return ret;
  }, [
    descriptor?.themeVars,
    descriptor?.defaultThemeVars,
    descriptor?.themeVarContributorComponents,
    themeScope,
    themeScope.themeVars,
    componentRegistry,
  ]);

  return useStyles(themeVars);
}
