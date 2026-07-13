import type {
  FontDef,
  ThemeDefinition,
  ThemeDefinitionDetails,
  ThemeTone,
} from "../../abstractions/ThemingDefs";
import type { ComponentThemeMetadataRegistry } from "../../component-core/themeMetadata";
import { defaultThemeVariableLayers, mergeThemeVariableLayers } from "../../styling";
import { normalizePath } from "../utils/misc";
import { matchThemeVar } from "./hvar";
import {
  collectThemeChainByExtends,
  generateBaseFontSizes,
  generateBaseSpacings,
  generateBaseTones,
  generateBootstrapBaseColumns,
  generateBorderSegments,
  generateButtonTones,
  generatePaddingSegments,
  generateTextFontSizes,
  resolveThemeVar,
  resolveThemeVarsWithCssVars,
  type OldDefaultThemeVars,
  type OldThemeDefinition,
  type OldThemeVars,
} from "./transformThemeVars";

export type CompileOldThemeModelInput = {
  builtInThemes?: ThemeDefinition[];
  customThemes?: ThemeDefinition[];
  activeThemeId?: string;
  defaultTheme?: string;
  defaultTone?: ThemeTone;
  componentThemeMetadata: Pick<
    ComponentThemeMetadataRegistry,
    "componentThemeVars" | "componentDefaultThemeVars"
  >;
  resources?: Record<string, string | FontDef>;
  resourceMap?: Record<string, string>;
};

export type CompiledOldThemeModel = {
  activeThemeId: string;
  activeThemeTone: ThemeTone;
  availableThemeIds: string[];
  activeTheme: ThemeDefinition;
  themeDefChain: OldThemeDefinition[];
  themeDefChainVars: OldThemeVars[];
  themeCssVars: Record<string, string>;
  themeVars: OldThemeVars;
  rawAllThemeVars: OldThemeVars;
  invalidThemeVarNames: Set<string>;
  getThemeVar: (themeVar: string) => string | undefined;
  getResourceUrl: (resourceString?: string) => string | undefined;
  fontLinks: string[];
  resources: Record<string, string | FontDef>;
};

const CSS_VAR_PREFIX = "xmlui";

export function compileOldThemeModel(input: CompileOldThemeModelInput): CompiledOldThemeModel {
  const activeThemeTone = input.defaultTone ?? "light";
  const themes = [...(input.customThemes ?? []), ...(input.builtInThemes ?? [])];
  const availableThemeIds = [...new Set(themes.map((theme) => theme.id))];
  const preferredThemeId = input.activeThemeId ?? input.defaultTheme ?? availableThemeIds[0];
  const activeTheme =
    themes.find((theme) => theme.id === preferredThemeId) ??
    themes.find((theme) => theme.id === availableThemeIds[0]);

  if (!activeTheme) {
    throw new Error(`Theme "${preferredThemeId}" not found and no fallback themes are available.`);
  }

  const activeThemeId = activeTheme.id;
  const rootThemeVars = stringRecord(mergeThemeVariableLayers(defaultThemeVariableLayers, activeThemeTone));
  const themeDefChain = collectThemeChainByExtends(
    toOldThemeDefinition(activeTheme),
    themes.map(toOldThemeDefinition),
    toOldDefaultThemeVars(input.componentThemeMetadata.componentDefaultThemeVars),
    {
      id: "root",
      themeVars: rootThemeVars,
      resources: {},
      tones: {},
    },
  );
  const allResources = mergeResources(themeDefChain, activeThemeTone, input.resources ?? {});
  const themeDefChainVars = compileThemeDefChainVars(themeDefChain, activeThemeTone);
  const rawAllThemeVars = cleanThemeVars(
    compileRawAllThemeVars(themeDefChainVars, input.componentThemeMetadata, rootThemeVars),
  );
  const themeVars = resolveThemeVarsWithCssVars(rawAllThemeVars);
  const themeCssVars = Object.fromEntries(
    Object.entries(themeVars)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [`--${CSS_VAR_PREFIX}-${key}`, value]),
  );

  return {
    activeThemeId,
    activeThemeTone,
    availableThemeIds,
    activeTheme,
    themeDefChain,
    themeDefChainVars,
    themeCssVars,
    themeVars,
    rawAllThemeVars,
    invalidThemeVarNames: new Set<string>(),
    getThemeVar: (themeVar) => resolveThemeVar(themeVar, rawAllThemeVars),
    getResourceUrl: (resourceString) => getResourceUrl(resourceString, allResources, input.resourceMap ?? {}),
    fontLinks: collectFontLinks(allResources),
    resources: allResources,
  };
}

function compileThemeDefChainVars(
  themeDefChain: OldThemeDefinition[],
  activeTone: ThemeTone,
): OldThemeVars[] {
  if (!themeDefChain.length) {
    return [];
  }

  let mergedThemeVars: OldThemeVars = {};
  themeDefChain.forEach((theme) => {
    mergedThemeVars = {
      ...mergedThemeVars,
      ...themeVarsForTone(theme, activeTone),
    };
  });

  return [
    ...themeDefChain
      .map((theme) => themeVarsForTone(theme, activeTone))
      .slice(0, themeDefChain.length - 1),
    {
      ...generateBootstrapBaseColumns(mergedThemeVars),
      ...generateBaseSpacings(mergedThemeVars),
      ...generatePaddingSegments(mergedThemeVars),
      ...generateBorderSegments(mergedThemeVars),
      ...generateBaseTones(mergedThemeVars),
      ...generateButtonTones(mergedThemeVars),
      ...generateBaseFontSizes(mergedThemeVars),
      ...generateTextFontSizes(mergedThemeVars),
    },
    themeVarsForTone(themeDefChain[themeDefChain.length - 1], activeTone),
  ];
}

function compileRawAllThemeVars(
  themeDefChainVars: OldThemeVars[],
  componentThemeMetadata: Pick<ComponentThemeMetadataRegistry, "componentThemeVars">,
  rootThemeVars: OldThemeVars,
): OldThemeVars {
  let mergedThemeVars: OldThemeVars = {};
  themeDefChainVars.forEach((themeVars) => {
    mergedThemeVars = {
      ...mergedThemeVars,
      ...generatePaddingSegments(themeVars),
      ...generateBorderSegments(themeVars),
    };
  });

  const resolvedThemeVarsFromChains: OldThemeVars = {};
  const knownThemeVars = new Set([
    ...Object.keys(rootThemeVars),
    ...componentThemeMetadata.componentThemeVars,
  ]);
  knownThemeVars.forEach((themeVar) => {
    const result = matchThemeVar(themeVar, themeDefChainVars);
    if (
      result?.forValue &&
      result.matchedValue &&
      result.forValue !== result.matchedValue &&
      mergedThemeVars[result.forValue] === undefined
    ) {
      resolvedThemeVarsFromChains[result.forValue] = `$${result.matchedValue}`;
    }
  });

  return {
    ...mergedThemeVars,
    ...resolvedThemeVarsFromChains,
  };
}

function cleanThemeVars(themeVars: OldThemeVars): OldThemeVars {
  return Object.fromEntries(
    Object.entries(themeVars)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, String(value)]),
  );
}

function themeVarsForTone(theme: OldThemeDefinition, activeTone: ThemeTone): OldThemeVars {
  return {
    ...omitToneKeys(theme.themeVars ?? {}),
    ...stringRecord((theme.themeVars as Record<string, unknown> | undefined)?.[activeTone]),
    ...stringRecord(theme.tones?.[activeTone]?.themeVars),
  };
}

function mergeResources(
  themeDefChain: OldThemeDefinition[],
  activeTone: ThemeTone,
  resources: Record<string, string | FontDef>,
): Record<string, string | FontDef> {
  let mergedResources: Record<string, string | FontDef> = {};
  themeDefChain.forEach((theme) => {
    mergedResources = {
      ...mergedResources,
      ...(theme.resources as Record<string, string | FontDef> | undefined),
      ...(theme.tones?.[activeTone]?.resources as Record<string, string | FontDef> | undefined),
    };
  });
  return {
    ...resources,
    ...mergedResources,
  };
}

function getResourceUrl(
  resourceString: string | undefined,
  allResources: Record<string, string | FontDef>,
  resourceMap: Record<string, string>,
): string | undefined {
  let resourceUrl = resourceString;
  if (resourceString?.startsWith("resource:")) {
    const resourceName = resourceString.replace("resource:", "");
    const resource = allResources[resourceName];
    resourceUrl = typeof resource === "string" ? resource : resource?.src;
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
}

function collectFontLinks(resources: Record<string, string | FontDef>): string[] {
  return Object.entries(resources)
    .filter(([key, value]) => key.startsWith("font.") && typeof value === "string")
    .map(([, value]) => value as string);
}

function toOldThemeDefinition(theme: ThemeDefinition): OldThemeDefinition {
  return {
    ...theme,
    themeVars: stringRecord(theme.themeVars),
    resources: theme.resources,
    tones: toOldThemeTones(theme.tones),
  };
}

function toOldThemeTones(
  tones: ThemeDefinition["tones"] | undefined,
): OldThemeDefinition["tones"] {
  if (!tones) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(tones).map(([tone, details]) => [
      tone,
      {
        ...details,
        themeVars: stringRecord(details.themeVars),
      } satisfies ThemeDefinitionDetails,
    ]),
  );
}

function toOldDefaultThemeVars(
  defaultThemeVars: ComponentThemeMetadataRegistry["componentDefaultThemeVars"],
): OldDefaultThemeVars {
  return Object.fromEntries(
    Object.entries(defaultThemeVars).map(([key, value]) => [
      key,
      typeof value === "object" && value !== null && !Array.isArray(value)
        ? stringRecord(value)
        : String(value),
    ]),
  );
}

function omitToneKeys(themeVars: OldThemeVars): OldThemeVars {
  const { light, dark, ...rest } = themeVars as OldThemeVars & {
    light?: string;
    dark?: string;
  };
  return rest;
}

function stringRecord(value: unknown): OldThemeVars {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined && entryValue !== null)
      .map(([key, entryValue]) => [key, String(entryValue)]),
  );
}
