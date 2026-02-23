import { useCallback, useEffect, useMemo, useState } from "react";
import {
  generateBaseFontSizes,
  generateBaseSpacings,
  generateBaseTones,
  generateBorderSegments,
  generateButtonTones,
  generatePaddingSegments,
  generateTextFontSizes,
  resolveThemeVar,
} from "./transformThemeVars";
import { normalizePath } from "../utils/misc";
import { matchThemeVar } from "../theming/hvar";
import { ThemeContext, ThemesContext } from "../theming/ThemeContext";
import themeVars, { getVarKey } from "../theming/themeVars";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../constants";
import { collectThemeChainByExtends } from "../theming/extendThemeUtils";
import { useComponentRegistry } from "../../components/ComponentRegistryContext";
import {
  XmlUiBlogThemeDefinition,
  XmlUiCyanThemeDefinition,
  XmlUiGrayThemeDefinition,
  XmlUiGreenThemeDefinition,
  XmlUiOrangeThemeDefinition,
  XmlUiPurpleThemeDefinition,
  XmlUiRedThemeDefinition,
  XmlUiThemeDefinition,
  XmlUiWebThemeDefinition,
} from "../theming/themes/xmlui";
import { useIsomorphicLayoutEffect } from "../utils/hooks";
import type {
  AppThemes,
  FontDef,
  ThemeDefinition,
  ThemeScope,
  ThemeTone,
} from "../../abstractions/ThemingDefs";
import { omit } from "lodash-es";
import { ThemeToneKeys } from "./utils";
import { useDomRoot } from "./StyleContext";

export function useCompiledTheme(
  activeTheme: ThemeDefinition | undefined,
  activeTone: ThemeTone,
  themes: ThemeDefinition[] = EMPTY_ARRAY,
  resources: Record<string, string> = EMPTY_OBJECT,
  resourceMap: Record<string, string> = EMPTY_OBJECT,
) {
  const componentRegistry = useComponentRegistry();
  const { componentThemeVars, componentDefaultThemeVars } = componentRegistry;

  const themeDefChain = useMemo(() => {
    if (activeTheme) {
      return collectThemeChainByExtends(activeTheme, themes, componentDefaultThemeVars);
    }
    return undefined;
  }, [activeTheme, componentDefaultThemeVars, themes]);

  const allResources = useMemo(() => {
    let mergedResources: ThemeDefinition["resources"] = {};
    themeDefChain?.forEach((theme) => {
      mergedResources = {
        ...mergedResources,
        ...theme.resources,
        ...theme.tones?.[activeTone]?.resources,
      };
    });
    return {
      ...resources,
      ...mergedResources,
    };
  }, [themeDefChain, resources, activeTone]);

  const allFonts = useMemo(() => {
    const ret: Array<FontDef> = [];
    Object.entries(allResources).forEach(([key, value]) => {
      if (key.startsWith("font.")) {
        ret?.push(value as FontDef);
      }
    });
    return ret;
  }, [allResources]);

  const getResourceUrl = useCallback(
    (resourceString?: string) => {
      let resourceUrl = resourceString;
      if (resourceString?.startsWith("resource:")) {
        const resourceName = resourceString?.replace("resource:", "");
        resourceUrl = allResources[resourceName] as string;
      }
      if (!resourceUrl) {
        return resourceUrl;
      }
      if (resourceMap[resourceUrl]) {
        return resourceMap[resourceUrl];
      }
      if (resourceUrl.startsWith("/") && resourceMap[resourceUrl.substring(1)]) {
        return resourceMap[resourceUrl.substring(1)];
      }
      return normalizePath(resourceUrl);
    },
    [allResources, resourceMap],
  );

  const fontLinks: Array<string> = useMemo(() => {
    return (allFonts?.filter((theme) => typeof theme === "string") || []) as Array<string>;
  }, [allFonts]);

  const themeDefChainVars = useMemo(() => {
    if (!themeDefChain?.length) {
      return [];
    }
    let mergedThemeVars = {};
    themeDefChain?.forEach((theme) => {
      mergedThemeVars = {
        ...mergedThemeVars,
        ...omit(theme.themeVars, "light", "dark"),
        ...(theme.themeVars?.[activeTone] as unknown as Record<string, string>),
        ...theme.tones?.[activeTone]?.themeVars,
      };
    });

    //we put the generated theme vars before the last item in the chain
    const resultedTheme = [
      ...themeDefChain
        .map((themeDef) => ({
            ...omit(themeDef.themeVars, "light", "dark"),
            ...(themeDef.themeVars?.[activeTone] as unknown as Record<string, string>),
            ...themeDef.tones?.[activeTone]?.themeVars,
        }))
        .slice(0, themeDefChain.length - 1),
      {
        ...generateBaseSpacings(mergedThemeVars),
        ...generatePaddingSegments(mergedThemeVars),
        ...generateBorderSegments(mergedThemeVars),
        ...generateBaseTones(mergedThemeVars),
        ...generateButtonTones(mergedThemeVars),
        ...generateBaseFontSizes(mergedThemeVars),
        ...generateTextFontSizes(mergedThemeVars),
      },
      {
        ...omit(themeDefChain[themeDefChain.length - 1].themeVars, "light", "dark"),
        //...generateTextFontSizes(mergedThemeVars),
        ...(themeDefChain[themeDefChain.length - 1].themeVars?.[activeTone] as unknown as Record<
          string,
          string
        >),
        ...themeDefChain[themeDefChain.length - 1].tones?.[activeTone]?.themeVars,
      },
    ];
    return resultedTheme;
  }, [activeTone, themeDefChain]);

  const allThemeVarsWithResolvedHierarchicalVars = useMemo(() => {
    let mergedThemeVars: Record<string, string> = {};

    themeDefChainVars?.forEach((theme) => {
      theme = generatePaddingSegments(theme);
      theme = generateBorderSegments(theme);
      mergedThemeVars = { ...mergedThemeVars, ...theme };
    });

    const resolvedThemeVarsFromChains: Record<string, string> = {};

    new Set([...Object.keys(themeVars.themeVars), ...componentThemeVars]).forEach((themeVar) => {
      const result = matchThemeVar(themeVar, themeDefChainVars);
      if (
        result &&
        result.forValue &&
        result.matchedValue &&
        result.forValue !== result.matchedValue &&
        // Only add fallback if the user hasn't explicitly defined the specific theme var
        mergedThemeVars[result.forValue] === undefined
      ) {
        resolvedThemeVarsFromChains[result.forValue] = `$${result.matchedValue}`;
      }
    });

    return resolveThemeVarsWithCssVars({
      ...mergedThemeVars,
      ...resolvedThemeVarsFromChains,
    });
  }, [componentThemeVars, themeDefChainVars]);

  const themeCssVars = useMemo(() => {
    const ret: Record<string, string> = {};
    Object.entries(allThemeVarsWithResolvedHierarchicalVars).forEach(([key, value]) => {
      const themeKey = `--${themeVars.keyPrefix}-${key}`;
      if (value) {
        ret[themeKey] = value;
      }
    });
    return ret;
  }, [allThemeVarsWithResolvedHierarchicalVars]);

  const getThemeVar = useCallback(
    (varName: string) => {
      return resolveThemeVar(varName, allThemeVarsWithResolvedHierarchicalVars);
    },
    [allThemeVarsWithResolvedHierarchicalVars],
  );

  useEffect(() => {
    allFonts.forEach(async (font) => {
      if (typeof font !== "string") {
        const resolvedSrc = getResourceUrl(font.src);
        let src = `url(${resolvedSrc})`;
        if (font.format) {
          src = `${src} format('${font.format}')`;
        }
        const ff = new FontFace(font.fontFamily, src, {
          weight: font.fontWeight,
          style: font.fontStyle,
          display: font.fontDisplay as any,
        });
        try {
          const loadedFontFace = await ff.load();
          document.fonts.add(loadedFontFace);
        } catch (e) {
          console.error("loading fonts failed", e);
        }
      }
    });
  }, [themeDefChain, getResourceUrl, allFonts]);

  return {
    getResourceUrl,
    fontLinks,
    allThemeVarsWithResolvedHierarchicalVars,
    themeCssVars,
    getThemeVar,
  };
}

export const builtInThemes: Array<ThemeDefinition> = [
  XmlUiThemeDefinition,
  XmlUiGreenThemeDefinition,
  XmlUiGrayThemeDefinition,
  XmlUiOrangeThemeDefinition,
  XmlUiPurpleThemeDefinition,
  XmlUiCyanThemeDefinition,
  XmlUiRedThemeDefinition,
  XmlUiBlogThemeDefinition,
  XmlUiWebThemeDefinition,
  /*SolidThemeDefinition,*/
];

type ThemeProviderProps = {
  children?: React.ReactNode;
  themes?: Array<ThemeDefinition>;
  defaultTheme?: string;
  defaultTone?: ThemeTone;
  resources?: Record<string, string>;
  resourceMap?: Record<string, string>;
  localThemes?: Record<string, string>;
};

// theme-overriding properties change.
function ThemeProvider({
  children,
  themes: custThemes = EMPTY_ARRAY,
  defaultTheme = "xmlui",
  defaultTone = "light",
  resources = EMPTY_OBJECT,
  resourceMap = EMPTY_OBJECT,
  localThemes = EMPTY_OBJECT,
}: ThemeProviderProps) {
  const [activeThemeTone, setActiveThemeTone] = useState<ThemeTone>(() => {
    if (!defaultTone) {
      return ThemeToneKeys[0];
    }
    return defaultTone;
  });

  useEffect(() => {
    if (defaultTone) {
      setActiveThemeTone(defaultTone);
    }
  }, [defaultTone]);

  const themes: Array<ThemeDefinition> = useMemo(() => {
    return [...custThemes, ...builtInThemes];
  }, [custThemes]);

  const availableThemeIds = useMemo(() => {
    return [...new Set(themes.map((theme) => theme.id))];
  }, [themes]);

  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    if (!defaultTheme) {
      return availableThemeIds[0];
    }
    return defaultTheme;
  });

  useIsomorphicLayoutEffect(() => {
    //we sync the activeThemeId with the default theme (mostly for HMR)
    if (defaultTheme && availableThemeIds.includes(defaultTheme)) {
      setActiveThemeId(defaultTheme);
    } else {
      setActiveThemeId(availableThemeIds[0]);
    }
  }, [availableThemeIds, defaultTheme]);

  const activeTheme: ThemeDefinition = useMemo(() => {
    let foundTheme: ThemeDefinition;
    if (activeThemeId) {
      foundTheme = themes.find((theme) => theme.id === activeThemeId);
    }
    if (!foundTheme) {
      throw new Error(`Theme ${activeThemeId} not found, available themes: ${availableThemeIds}`);
    }
    return foundTheme;
  }, [activeThemeId, availableThemeIds, themes]);

  const { allThemeVarsWithResolvedHierarchicalVars, themeCssVars, getResourceUrl, getThemeVar } =
    useCompiledTheme(activeTheme, activeThemeTone, themes, resources, resourceMap);

  const domRoot = useDomRoot();
  const [root, setRoot] = useState(null);

  useIsomorphicLayoutEffect(() => {
    if (typeof document !== "undefined") {
      if(domRoot instanceof ShadowRoot){
        setRoot(domRoot.getElementById("nested-app-root"));
      } else {
        setRoot(document.body);
      }
    }
  }, [domRoot]);

  const themeValue = useMemo(() => {
    const themeVal: AppThemes = {
      themes,
      resources,
      resourceMap,
      activeThemeId,
      activeThemeTone,
      setActiveThemeId,
      setActiveThemeTone,
      availableThemeIds,
      activeTheme,
      toggleThemeTone: () => setActiveThemeTone(activeThemeTone === "light" ? "dark" : "light"),
    };
    return themeVal;
  }, [
    activeTheme,
    activeThemeId,
    activeThemeTone,
    availableThemeIds,
    resourceMap,
    resources,
    themes,
  ]);

  const currentThemeContextValue = useMemo(() => {
    const themeVal: ThemeScope = {
      root,
      setRoot,
      activeThemeId,
      activeThemeTone: activeThemeTone,
      activeTheme,
      themeStyles: themeCssVars,
      themeVars: allThemeVarsWithResolvedHierarchicalVars,
      getResourceUrl,
      getThemeVar,
    };
    return themeVal;
  }, [
    activeTheme,
    activeThemeId,
    activeThemeTone,
    allThemeVarsWithResolvedHierarchicalVars,
    getResourceUrl,
    getThemeVar,
    root,
    themeCssVars,
  ]);

  return (
    <ThemesContext.Provider value={themeValue}>
      <ThemeContext.Provider value={currentThemeContextValue}>{children}</ThemeContext.Provider>
    </ThemesContext.Provider>
  );
}

function resolveThemeVarsWithCssVars(theme?: Record<string, string>) {
  if (!theme) {
    return {};
  }
  const ret: Record<string, string> = {};
  Object.keys(theme).forEach((key) => {
    ret[key] = resolveThemeVarToCssVars(key, theme);
  });
  return ret;

  function resolveThemeVarToCssVars(varName: string, theme: Record<string, string>) {
    const value = theme[varName];
    if (typeof value === "string" && value.includes("$")) {
      return replaceThemeVar(value);
    }
    return value;
  }

  function replaceThemeVar(input: string) {
    const regex = /\$([a-zA-Z0-9_-]+)/gi;
    const matches = input.matchAll(regex);

    //we go from 1, because result[1] is the whole stuff
    if (matches) {
      let ret = input;
      for (const match of matches) {
        const varName = match[1];
        if (varName) {
          ret = ret.replace(match[0], `var(${getVarKey(varName)})`);
        }
      }
      return ret;
    }

    return input;
  }
}

export default ThemeProvider;
