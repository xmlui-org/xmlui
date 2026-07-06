import type { ComponentMetadata, ComponentPropertyMetadata } from "../../component-core/metadata/types";
import { behaviorPropsForComponent } from "../../component-core/behaviors";
import { supportedLayoutPropNames, supportedResponsiveLayoutPropNames } from "../../styling";
import type {
  XmluiComponentContract,
  XmluiComponentContractKind,
  XmluiDeclarationPermission,
  XmluiEventContract,
} from "./types";

export type MetadataContractOptions = {
  name: string;
  kind?: XmluiComponentContractKind;
  allowsChildren?: boolean;
  declarations?: XmluiDeclarationPermission;
  acceptsArbitraryProps?: boolean;
  includeLayoutProps?: boolean;
  eventAttributes?: Record<string, string>;
  contextVariables?: Record<string, { name: string }>;
};

export function contractFromMetadata(
  metadata: ComponentMetadata,
  options: MetadataContractOptions,
): XmluiComponentContract {
  const props = {
    ...propsFromMetadata(
      metadata.props,
      metadata.themeVars,
      metadata.defaultThemeVars,
      options.includeLayoutProps,
    ),
    ...behaviorPropsForComponent({
      componentName: options.name,
      metadata,
    }),
  };
  const templates = templatesFromProps(metadata.props);
  return {
    name: options.name,
    kind: options.kind ?? "builtin",
    acceptsArbitraryProps: options.acceptsArbitraryProps ?? metadata.allowArbitraryProps,
    allowsChildren: options.allowsChildren ?? true,
    declarations: options.declarations ?? { local: true },
    props,
    events: eventsFromMetadata(metadata.events, options.eventAttributes),
    templates: Object.keys(templates).length > 0 ? templates : undefined,
    contextVariables: mergeEntries(
      contextVariablesFromMetadata(metadata),
      options.contextVariables,
    ),
    apis: entriesFromMetadata(metadata.apis),
    parts: entriesFromMetadata(metadata.parts),
    themeVars: entriesFromNames([
      ...entryNames(metadata.themeVars),
      ...defaultThemeVarNames(metadata.defaultThemeVars),
    ]),
    defaultThemeVars: flatDefaultThemeVars(metadata.defaultThemeVars),
    toneSpecificThemeVars: metadata.toneSpecificThemeVars,
  };
}

function flatDefaultThemeVars(
  defaultThemeVars: ComponentMetadata["defaultThemeVars"],
): XmluiComponentContract["defaultThemeVars"] {
  if (!defaultThemeVars) {
    return undefined;
  }
  const flatVars: Record<string, string | number | boolean> = {};
  for (const [name, value] of Object.entries(defaultThemeVars)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      flatVars[name] = value;
    }
  }
  return flatVars;
}

function defaultThemeVarNames(
  defaultThemeVars: ComponentMetadata["defaultThemeVars"],
): string[] {
  return Object.entries(defaultThemeVars ?? {})
    .filter(([, value]) => typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    .map(([name]) => name);
}

function propsFromMetadata(
  props: ComponentMetadata["props"],
  themeVars: ComponentMetadata["themeVars"],
  defaultThemeVars: ComponentMetadata["defaultThemeVars"],
  includeLayoutProps = true,
): XmluiComponentContract["props"] {
  const names = new Set([
    "id",
    "ref",
    "testId",
    ...Object.keys(props ?? {}),
    ...entryNames(themeVars),
    ...defaultThemeVarNames(defaultThemeVars),
  ]);
  if (includeLayoutProps) {
    for (const name of supportedLayoutPropNames) {
      names.add(name);
    }
    for (const name of supportedResponsiveLayoutPropNames) {
      names.add(name);
    }
  }
  return Object.fromEntries([...names].sort().map((name) => [name, { name }]));
}

function templatesFromProps(
  props: ComponentMetadata["props"],
): NonNullable<XmluiComponentContract["templates"]> {
  return Object.fromEntries(
    Object.entries(props ?? {})
      .filter(([, prop]) => isTemplateProp(prop))
      .map(([name]) => [name, { name }]),
  );
}

function isTemplateProp(prop: ComponentPropertyMetadata): boolean {
  return prop.valueType === "ComponentDef";
}

function eventsFromMetadata(
  events: ComponentMetadata["events"],
  eventAttributes: Record<string, string> = {},
): XmluiComponentContract["events"] {
  return Object.fromEntries(
    Object.keys(events ?? {})
      .sort()
      .map((name): [string, XmluiEventContract] => [
        name,
        {
          name,
          attributeName: eventAttributes[name] ?? eventNameToAttributeName(name),
        },
      ]),
  );
}

function contextVariablesFromMetadata(
  metadata: ComponentMetadata,
): Record<string, { name: string }> | undefined {
  const names = new Set([
    ...entryNames(metadata.contextVars),
    ...(metadata.unstableChildInjectedVars ?? []),
  ]);
  return entriesFromNames([...names].sort());
}

function entriesFromMetadata<T extends Record<string, unknown> | readonly unknown[] | undefined>(
  entries: T,
): Record<string, { name: string }> | undefined {
  return entriesFromNames(entryNames(entries));
}

function entriesFromNames(names: string[]): Record<string, { name: string }> | undefined {
  if (names.length === 0) {
    return undefined;
  }
  return Object.fromEntries(names.sort().map((name) => [name, { name }]));
}

function mergeEntries(
  ...entries: Array<Record<string, { name: string }> | undefined>
): Record<string, { name: string }> | undefined {
  const merged = Object.assign({}, ...entries.filter(Boolean));
  return Object.keys(merged).length > 0 ? merged : undefined;
}

function entryNames(entries: Record<string, unknown> | readonly unknown[] | undefined): string[] {
  if (!entries) {
    return [];
  }
  if (Array.isArray(entries)) {
    return entries.flatMap((entry) => {
      if (typeof entry === "string") {
        return [entry];
      }
      if (entry && typeof entry === "object" && typeof (entry as { name?: unknown }).name === "string") {
        return [(entry as { name: string }).name];
      }
      return [];
    });
  }
  return Object.keys(entries);
}

function eventNameToAttributeName(name: string): string {
  if (name.startsWith("on") && name[2] === name[2]?.toUpperCase()) {
    return name;
  }
  return `on${name[0]?.toUpperCase() ?? ""}${name.slice(1)}`;
}
