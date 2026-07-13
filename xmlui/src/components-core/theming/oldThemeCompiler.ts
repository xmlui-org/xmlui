import type {
  FontDef,
  ThemeDefinition,
  ThemeDefinitionDetails,
  ThemeTone,
} from "../../abstractions/ThemingDefs";
import type { ThemeVarMetadata } from "../../abstractions/ComponentDefs";
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
import type { ThemeDiagnostic } from "./validator/diagnostics";
import { validateTheme } from "./validator";

export type CompileOldThemeModelInput = {
  builtInThemes?: ThemeDefinition[];
  customThemes?: ThemeDefinition[];
  activeThemeId?: string;
  defaultTheme?: string;
  defaultTone?: ThemeTone;
  componentThemeMetadata: Pick<
    ComponentThemeMetadataRegistry,
    "componentThemeVars" | "componentDefaultThemeVars" | "componentThemeVarDeclarations"
  >;
  strictTheming?: boolean;
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
  knownThemeVarNames: Set<string>;
  themeDiagnostics: ThemeDiagnostic[];
  invalidThemeVarNames: Set<string>;
  getThemeVar: (themeVar: string) => string | undefined;
  getResourceUrl: (resourceString?: string) => string | undefined;
  fontLinks: string[];
  resources: Record<string, string | FontDef>;
};

const CSS_VAR_PREFIX = "xmlui";

export function compileOldThemeModel(input: CompileOldThemeModelInput): CompiledOldThemeModel {
  const strictTheming = input.strictTheming !== false;
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
  const declaredThemeVarNames = collectDeclaredThemeVarNames(
    rootThemeVars,
    input.componentThemeMetadata,
  );
  const {
    themeDefChainVars,
    invalidThemeVarNames: layerInvalidThemeVarNames,
    themeDiagnostics: layerThemeDiagnostics,
  } = compileThemeDefChainVars(
    themeDefChain,
    activeThemeTone,
    strictTheming,
    input.componentThemeMetadata.componentThemeVarDeclarations,
    declaredThemeVarNames,
  );
  const knownThemeVarNames = collectKnownThemeVarNames(
    rootThemeVars,
    input.componentThemeMetadata,
    themeDefChainVars,
  );
  const rawAllThemeVars = cleanThemeVars(
    compileRawAllThemeVars(themeDefChainVars, input.componentThemeMetadata, rootThemeVars),
  );
  const allThemeDiagnostics = validateOldThemeDiagnostics(
    rawAllThemeVars,
    input.componentThemeMetadata.componentThemeVarDeclarations,
    knownThemeVarNames,
    strictTheming,
    true,
  );
  const displayThemeDiagnostics = validateOldThemeDiagnostics(
    rawAllThemeVars,
    input.componentThemeMetadata.componentThemeVarDeclarations,
    knownThemeVarNames,
    strictTheming,
  );
  const finalInvalidThemeVarNames = collectInvalidThemeVarNames(allThemeDiagnostics);
  const invalidThemeVarNames = new Set([
    ...layerInvalidThemeVarNames,
    ...finalInvalidThemeVarNames,
  ]);
  const filteredRawAllThemeVars = invalidThemeVarNames.size
    ? Object.fromEntries(
        Object.entries(rawAllThemeVars).filter(([key]) => !invalidThemeVarNames.has(key)),
      )
    : rawAllThemeVars;
  const themeVars = resolveThemeVarsWithCssVars(filteredRawAllThemeVars);
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
    rawAllThemeVars: filteredRawAllThemeVars,
    knownThemeVarNames,
    themeDiagnostics: [...layerThemeDiagnostics, ...displayThemeDiagnostics],
    invalidThemeVarNames,
    getThemeVar: (themeVar) => resolveThemeVar(themeVar, filteredRawAllThemeVars),
    getResourceUrl: (resourceString) => getResourceUrl(resourceString, allResources, input.resourceMap ?? {}),
    fontLinks: collectFontLinks(allResources),
    resources: allResources,
  };
}

export function validateOldThemeDiagnostics(
  rawThemeVars: OldThemeVars,
  declarations: ReadonlyMap<string, ThemeVarMetadata>,
  knownThemeVarNames: ReadonlySet<string>,
  strictTheming: boolean,
  includeDerived = false,
): ThemeDiagnostic[] {
  if (!strictTheming) {
    return [];
  }
  const resolvedForValidation = new Map<string, string>();
  Object.keys(rawThemeVars).forEach((key) => {
    resolvedForValidation.set(key, resolveThemeVar(key, rawThemeVars));
  });
  return validateTheme(resolvedForValidation, declarations, {
    strict: true,
    knownNames: knownThemeVarNames,
    includeDerived,
  });
}

function compileThemeDefChainVars(
  themeDefChain: OldThemeDefinition[],
  activeTone: ThemeTone,
  strictTheming: boolean,
  declarations: ReadonlyMap<string, ThemeVarMetadata>,
  knownNames: ReadonlySet<string>,
): {
  themeDefChainVars: OldThemeVars[];
  invalidThemeVarNames: Set<string>;
  themeDiagnostics: ThemeDiagnostic[];
} {
  if (!themeDefChain.length) {
    return {
      themeDefChainVars: [],
      invalidThemeVarNames: new Set<string>(),
      themeDiagnostics: [],
    };
  }

  let mergedThemeVars: OldThemeVars = {};
  const invalidThemeVarNames = new Set<string>();
  const themeDiagnostics: ThemeDiagnostic[] = [];
  themeDefChain.forEach((theme) => {
    const varsForTone = sanitizeThemeVarsForStrictTheming(
      themeVarsForTone(theme, activeTone),
      strictTheming,
      declarations,
      knownNames,
      invalidThemeVarNames,
      themeDiagnostics,
    );
    mergedThemeVars = {
      ...mergedThemeVars,
      ...varsForTone,
    };
  });

  return {
    themeDefChainVars: [
      ...themeDefChain
        .map((theme) =>
          sanitizeThemeVarsForStrictTheming(
            themeVarsForTone(theme, activeTone),
            strictTheming,
            declarations,
            knownNames,
            invalidThemeVarNames,
            themeDiagnostics,
          ),
        )
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
      sanitizeThemeVarsForStrictTheming(
        themeVarsForTone(themeDefChain[themeDefChain.length - 1], activeTone),
        strictTheming,
        declarations,
        knownNames,
        invalidThemeVarNames,
        themeDiagnostics,
      ),
    ],
    invalidThemeVarNames,
    themeDiagnostics,
  };
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

function collectDeclaredThemeVarNames(
  rootThemeVars: OldThemeVars,
  componentThemeMetadata: Pick<
    ComponentThemeMetadataRegistry,
    "componentThemeVars" | "componentDefaultThemeVars"
  >,
): Set<string> {
  const known = new Set<string>();
  Object.keys(rootThemeVars).forEach((name) => addKnownThemeVarName(known, name));
  componentThemeMetadata.componentThemeVars.forEach((name) => addKnownThemeVarName(known, name));
  collectThemeVarKeys(componentThemeMetadata.componentDefaultThemeVars).forEach((name) =>
    addKnownThemeVarName(known, name),
  );
  return known;
}

function collectKnownThemeVarNames(
  rootThemeVars: OldThemeVars,
  componentThemeMetadata: Pick<
    ComponentThemeMetadataRegistry,
    "componentThemeVars" | "componentDefaultThemeVars"
  >,
  themeDefChainVars: OldThemeVars[],
): Set<string> {
  const known = new Set<string>();
  Object.keys(rootThemeVars).forEach((name) => addKnownThemeVarName(known, name));
  componentThemeMetadata.componentThemeVars.forEach((name) => addKnownThemeVarName(known, name));
  collectThemeVarKeys(componentThemeMetadata.componentDefaultThemeVars).forEach((name) =>
    addKnownThemeVarName(known, name),
  );
  themeDefChainVars.forEach((theme) => {
    const generated = {
      ...generateBootstrapBaseColumns(theme),
      ...generateBaseSpacings(theme),
      ...generatePaddingSegments(theme),
      ...generateBorderSegments(theme),
      ...generateBaseTones(theme),
      ...generateButtonTones(theme),
      ...generateBaseFontSizes(theme),
      ...generateTextFontSizes(theme),
    };
    Object.keys(generated).forEach((name) => addKnownThemeVarName(known, name));
  });
  return known;
}

function sanitizeThemeVarsForStrictTheming(
  vars: OldThemeVars | undefined,
  strictTheming: boolean,
  declarations: ReadonlyMap<string, ThemeVarMetadata>,
  knownNames: ReadonlySet<string>,
  invalidNames: Set<string>,
  diagnostics: ThemeDiagnostic[],
): OldThemeVars {
  if (!vars || !strictTheming) {
    return vars ?? {};
  }
  const normalizedVars = cleanThemeVars(vars);
  const resolved = new Map<string, string>();
  Object.keys(normalizedVars).forEach((key) => {
    resolved.set(key, resolveThemeVar(key, normalizedVars));
  });
  const allDiagnostics = validateTheme(resolved, declarations, {
    strict: true,
    knownNames,
    includeDerived: true,
  });
  diagnostics.push(
    ...validateTheme(resolved, declarations, { strict: true, knownNames }).filter(
      (diagnostic) => diagnostic.code === "invalid-theme-value",
    ),
  );
  collectInvalidThemeVarNames(allDiagnostics).forEach((name) => invalidNames.add(name));
  if (!invalidNames.size) {
    return normalizedVars;
  }
  return Object.fromEntries(
    Object.entries(normalizedVars).filter(([key]) => !invalidNames.has(key)),
  );
}

function collectInvalidThemeVarNames(diagnostics: ThemeDiagnostic[]): Set<string> {
  return new Set(
    diagnostics
      .filter(
        (diagnostic) =>
          diagnostic.severity === "error" &&
          diagnostic.code !== "unknown-theme-variable" &&
          diagnostic.variableName,
      )
      .map((diagnostic) => diagnostic.variableName!),
  );
}

function collectThemeVarKeys(value: unknown, keys: Set<string> = new Set()): Set<string> {
  if (!value || typeof value !== "object") return keys;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (key === "light" || key === "dark" || key === "tones") {
      collectThemeVarKeys(nested, keys);
      continue;
    }
    keys.add(key);
    if (nested && typeof nested === "object") {
      collectThemeVarKeys(nested, keys);
    }
  }
  return keys;
}

function addKnownThemeVarName(known: Set<string>, name: string): void {
  known.add(name);
  const denamespaced = name.substring(name.lastIndexOf(":") + 1);
  known.add(denamespaced);
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
