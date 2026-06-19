import type {
  ComponentExtension,
  Extension,
  NormalizedExtensionComponent,
  NormalizedExtensions,
  XmluiExtensionComponent,
} from "./types";
import type { XmluiComponentContract } from "../compiler/contracts";

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
    contract: componentContract(component),
  };
}

function componentContract(component: ComponentExtension): XmluiComponentContract {
  return {
    name: component.name,
    kind: "extension",
    acceptsArbitraryProps: component.acceptsArbitraryProps,
    allowsChildren: component.allowsChildren ?? true,
    declarations: { local: true },
    props: Object.fromEntries((component.props ?? []).map((name) => [name, { name }])),
    events: Object.fromEntries((component.events ?? []).map((name) => [name, {
      name,
      attributeName: `on${name.slice(0, 1).toUpperCase()}${name.slice(1)}`,
    }])),
    templates: Object.fromEntries((component.templates ?? []).map((name) => [name, { name }])),
    contextVariables: Object.fromEntries((component.contextVariables ?? []).map((name) => [name, { name }])),
    apis: Object.fromEntries((component.apis ?? []).map((name) => [name, { name }])),
  };
}

