import type {
  ComponentMetadata,
  DefaultThemeVars,
  DefaultThemeVarValue,
  ThemeVarMetadata,
} from "./metadata";
import { runtimeRendererEntries } from "./runtimeRegistry";
import type { XmluiBuiltInRenderer } from "../runtime/rendering/types";
import type { XmluiWrappedRendererMetadata } from "../runtime/rendering/adapter";
import {
  namespaceThemeVariableName,
  normalizeExtensions,
  type Extension,
  type NormalizedExtensions,
} from "../extensions";

export type ComponentThemeMetadataRegistry = {
  componentThemeVars: Set<string>;
  componentDefaultThemeVars: DefaultThemeVars;
  componentThemeVarDeclarations: Map<string, ThemeVarMetadata>;
  componentThemeVarContributorComponents: Map<string, string[]>;
  componentMetadataByName: Map<string, ComponentMetadata>;
};

export type ComponentThemeMetadataEntry = {
  name: string;
  metadata?: ComponentMetadata;
  themeNamespacePrefix?: string;
};

type RendererWithMetadata = XmluiBuiltInRenderer & Partial<XmluiWrappedRendererMetadata>;

export function createCoreComponentThemeMetadataRegistry(): ComponentThemeMetadataRegistry {
  return collectComponentThemeMetadata(
    runtimeRendererEntries.map(({ name, renderer }) => ({
      name,
      metadata: (renderer as RendererWithMetadata | undefined)?.metadata,
    })),
  );
}

export function createComponentThemeMetadataRegistry(
  extensions?: Iterable<Extension | undefined> | NormalizedExtensions,
): ComponentThemeMetadataRegistry {
  const normalizedExtensions = isNormalizedExtensions(extensions)
    ? extensions
    : normalizeExtensions(extensions);
  return collectComponentThemeMetadata([
    ...runtimeRendererEntries.map(({ name, renderer }) => ({
      name,
      metadata: (renderer as RendererWithMetadata | undefined)?.metadata,
    })),
    ...normalizedExtensions.components.map((component) => ({
      name: component.localName,
      metadata: component.metadata,
      themeNamespacePrefix: component.extension.themeNamespacePrefix,
    })),
  ]);
}

export function collectComponentThemeMetadata(
  entries: Iterable<ComponentThemeMetadataEntry>,
): ComponentThemeMetadataRegistry {
  const componentThemeVars = new Set<string>();
  const componentDefaultThemeVars: DefaultThemeVars = {};
  const componentThemeVarDeclarations = new Map<string, ThemeVarMetadata>();
  const componentThemeVarContributorComponents = new Map<string, string[]>();
  const componentMetadataByName = new Map<string, ComponentMetadata>();

  for (const entry of entries) {
    const { metadata } = entry;
    if (!metadata) {
      continue;
    }
    componentMetadataByName.set(entry.name, metadata);

    for (const [name, declaration] of Object.entries(metadata.themeVars ?? {})) {
      const namespacedName = namespaceThemeVar(entry, name);
      componentThemeVars.add(namespacedName);
      if (!componentThemeVarDeclarations.has(namespacedName)) {
        componentThemeVarDeclarations.set(
          namespacedName,
          normalizeThemeVarDeclaration(namespacedName, declaration),
        );
      }
    }

    if (metadata.defaultThemeVars) {
      mergeDefaultThemeVars(componentDefaultThemeVars, metadata.defaultThemeVars, entry);
    }

    if (metadata.themeVarContributorComponents?.length) {
      componentThemeVarContributorComponents.set(
        entry.name,
        [...metadata.themeVarContributorComponents],
      );
    }
  }

  return {
    componentThemeVars,
    componentDefaultThemeVars,
    componentThemeVarDeclarations,
    componentThemeVarContributorComponents,
    componentMetadataByName,
  };
}

function normalizeThemeVarDeclaration(
  name: string,
  declaration: string | ThemeVarMetadata,
): ThemeVarMetadata {
  return typeof declaration === "string"
    ? { name, description: declaration }
    : { ...declaration, name };
}

function mergeDefaultThemeVars(
  target: DefaultThemeVars,
  source: DefaultThemeVars,
  entry: ComponentThemeMetadataEntry,
): DefaultThemeVars {
  for (const [name, value] of Object.entries(source)) {
    const namespacedName = namespaceThemeVar(entry, name);
    if (isDefaultThemeVarObject(value) && isDefaultThemeVarObject(target[namespacedName])) {
      target[namespacedName] = {
        ...(target[namespacedName] as Record<string, string | number | boolean>),
        ...value,
      };
    } else {
      target[namespacedName] = value;
    }
  }
  return target;
}

function namespaceThemeVar(entry: ComponentThemeMetadataEntry, name: string): string {
  return namespaceThemeVariableName(
    entry.themeNamespacePrefix ? { themeNamespacePrefix: entry.themeNamespacePrefix } : undefined,
    name,
  );
}

function isDefaultThemeVarObject(
  value: DefaultThemeVarValue | undefined,
): value is Record<string, string | number | boolean> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNormalizedExtensions(
  extensions: Iterable<Extension | undefined> | NormalizedExtensions | undefined,
): extensions is NormalizedExtensions {
  return Boolean(extensions) && "components" in (extensions as NormalizedExtensions);
}
