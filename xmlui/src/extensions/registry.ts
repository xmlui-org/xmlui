import type {
  ComponentExtension,
  Extension,
  NormalizedExtensionComponent,
  NormalizedExtensions,
  XmluiExtensionComponent,
} from "./types";
import type { XmluiComponentContract } from "../compiler/contracts";
import { supportedLayoutPropNames, supportedResponsiveLayoutPropNames } from "../styling";
import type { ComponentMetadata, DefaultThemeVarValue, DefaultThemeVars } from "../component-core/metadata";

export type ExtensionRegisteredCallback = (extension: Extension) => void;

export class StandaloneExtensionManager {
  private readonly subscriptions = new Set<ExtensionRegisteredCallback>();
  private readonly registeredExtensions: Extension[] = [];

  subscribeToRegistrations(callback: ExtensionRegisteredCallback): void {
    this.subscriptions.add(callback);
    for (const extension of this.registeredExtensions) {
      callback(extension);
    }
  }

  unSubscribeFromRegistrations(callback: ExtensionRegisteredCallback): void {
    this.subscriptions.delete(callback);
  }

  registerExtension(extensionOrExtensions: Extension | Extension[] | undefined): void {
    if (!extensionOrExtensions) {
      return;
    }
    const extensions = Array.isArray(extensionOrExtensions)
      ? extensionOrExtensions
      : [extensionOrExtensions];
    for (const extension of extensions) {
      this.registeredExtensions.push(extension);
      for (const callback of this.subscriptions) {
        callback(extension);
      }
    }
  }

  listExtensions(): Extension[] {
    return [...this.registeredExtensions];
  }
}

export const globalExtensionManager = new StandaloneExtensionManager();

export function registerExtension(extensionOrExtensions: Extension | Extension[] | undefined): void {
  globalExtensionManager.registerExtension(extensionOrExtensions);
}

export function listRegisteredExtensions(): Extension[] {
  return globalExtensionManager.listExtensions();
}

export function normalizeExtensions(
  extensions: Iterable<Extension | undefined> = [],
): NormalizedExtensions {
  const extensionList = [...extensions].filter((extension): extension is Extension => Boolean(extension));
  const components: NormalizedExtensionComponent[] = [];
  const renderers: Record<string, XmluiExtensionComponent> = {};
  const functions: Record<string, (...args: unknown[]) => unknown> = {};
  const themes = extensionList.flatMap((extension) => [...(extension.themes ?? [])]);

  for (const extension of extensionList) {
    for (const [name, fn] of Object.entries(extension.functions ?? {})) {
      functions[name] = fn;
    }
    for (const component of extension.components ?? []) {
      const normalized = normalizeComponent(extension, component);
      components.push(normalized);
      renderers[normalized.localName] = normalized.component;
      renderers[normalized.qualifiedName] = normalized.component;
    }
  }

  return {
    extensions: extensionList,
    components,
    contracts: components.flatMap((component) => [
      component.contract,
      ...(component.qualifiedName === component.localName
        ? []
        : [{ ...component.contract, name: component.qualifiedName }]),
    ]),
    renderers,
    functions,
    themes,
    functionNames: Object.keys(functions).sort(),
  };
}

export function extensionComponentNames(extensions: Iterable<Extension | undefined>): string[] {
  return normalizeExtensions(extensions).contracts.map((contract) => contract.name).sort();
}

function normalizeComponent(
  extension: Extension,
  component: ComponentExtension,
): NormalizedExtensionComponent {
  const namespace = extension.namespace;
  const qualifiedName = namespace ? `${namespace}.${component.name}` : component.name;
  return {
    extension,
    namespace,
    localName: component.name,
    qualifiedName,
    component: component.component,
    description: component.description,
    metadata: component.metadata,
    contract: componentContract(extension, component),
  };
}

function componentContract(extension: Extension, component: ComponentExtension): XmluiComponentContract {
  const commonProps = [
    "id",
    "testId",
    ...supportedLayoutPropNames,
    ...supportedResponsiveLayoutPropNames,
  ];
  const themeVars = component.themeVars ?? component.metadata?.themeVars;
  const defaultThemeVars = component.defaultThemeVars ?? component.metadata?.defaultThemeVars;
  return {
    name: component.name,
    kind: "extension",
    acceptsArbitraryProps: component.acceptsArbitraryProps ?? true,
    allowsChildren: component.allowsChildren ?? true,
    declarations: { local: true },
    props: Object.fromEntries([...commonProps, ...(component.props ?? [])].map((name) => [name, { name }])),
    events: Object.fromEntries((component.events ?? []).map((name) => [name, {
      name,
      attributeName: `on${name.slice(0, 1).toUpperCase()}${name.slice(1)}`,
    }])),
    templates: Object.fromEntries((component.templates ?? []).map((name) => [name, { name }])),
    contextVariables: Object.fromEntries((component.contextVariables ?? []).map((name) => [name, { name }])),
    apis: Object.fromEntries((component.apis ?? []).map((name) => [name, { name }])),
    themeVars: themeVarContracts(extension, themeVars, defaultThemeVars),
    defaultThemeVars: flatDefaultThemeVars(extension, defaultThemeVars),
    toneSpecificThemeVars: namespaceToneSpecificThemeVars(
      extension,
      component.toneSpecificThemeVars ?? component.metadata?.toneSpecificThemeVars,
    ),
  };
}

function themeVarContracts(
  extension: Extension,
  themeVars: ComponentMetadata["themeVars"],
  defaultThemeVars: DefaultThemeVars | undefined,
): XmluiComponentContract["themeVars"] {
  const names = new Set([
    ...Object.keys(themeVars ?? {}),
    ...Object.entries(defaultThemeVars ?? {})
      .filter(([, value]) => isPrimitiveDefaultThemeVarValue(value))
      .map(([name]) => name),
  ]);
  return names.size > 0
    ? Object.fromEntries([...names].sort().map((name) => {
      const namespacedName = namespaceThemeVariableName(extension, name);
      return [namespacedName, { name: namespacedName }];
    }))
    : undefined;
}

function flatDefaultThemeVars(
  extension: Extension,
  defaultThemeVars: DefaultThemeVars | undefined,
): XmluiComponentContract["defaultThemeVars"] {
  if (!defaultThemeVars) {
    return undefined;
  }
  const flatVars: Record<string, string | number | boolean> = {};
  for (const [name, value] of Object.entries(defaultThemeVars)) {
    if (isPrimitiveDefaultThemeVarValue(value)) {
      flatVars[namespaceThemeVariableName(extension, name)] = value;
    }
  }
  return Object.keys(flatVars).length > 0 ? flatVars : undefined;
}

function namespaceToneSpecificThemeVars(
  extension: Extension,
  toneSpecificThemeVars: ComponentMetadata["toneSpecificThemeVars"],
): XmluiComponentContract["toneSpecificThemeVars"] {
  if (!toneSpecificThemeVars) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(toneSpecificThemeVars).map(([tone, vars]) => [
      tone,
      Object.fromEntries(
        Object.entries(vars).map(([name, value]) => [
          namespaceThemeVariableName(extension, name),
          value,
        ]),
      ),
    ]),
  );
}

export function namespaceThemeVariableName(extension: Extension | undefined, name: string): string {
  const prefix = extension?.themeNamespacePrefix;
  if (!prefix || name.startsWith(`${prefix}:`)) {
    return name;
  }
  return `${prefix}:${name}`;
}

function isPrimitiveDefaultThemeVarValue(
  value: DefaultThemeVarValue,
): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
