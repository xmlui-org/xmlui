import type {
  XmluiComponentContract,
  XmluiComponentContractKind,
  XmluiDeclarationPermission,
  XmluiEventContract,
} from "../../compiler/contracts";
import { supportedLayoutPropNames } from "../../styling";
import { behaviorPropsForComponent } from "../behaviors";
import type { ComponentMetadata, ComponentPropertyMetadata } from "./types";

export type ComponentMetadataContractOptions = {
  name: string;
  kind?: XmluiComponentContractKind;
  allowsChildren?: boolean;
  declarations?: XmluiDeclarationPermission;
  acceptsArbitraryProps?: boolean;
  includeLayoutProps?: boolean;
  eventAttributes?: Record<string, string>;
};

export function componentMetadataToContract(
  metadata: ComponentMetadata,
  options: ComponentMetadataContractOptions,
): XmluiComponentContract {
  const props = {
    ...propsFromMetadata(metadata.props, options.includeLayoutProps),
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
    contextVariables: entriesFromMetadata(metadata.contextVars),
    apis: entriesFromMetadata(metadata.apis),
  };
}

function propsFromMetadata(
  props: ComponentMetadata["props"],
  includeLayoutProps = true,
): XmluiComponentContract["props"] {
  const names = new Set(Object.keys(props ?? {}));
  if (includeLayoutProps) {
    for (const name of supportedLayoutPropNames) {
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

function entriesFromMetadata<T extends Record<string, unknown> | undefined>(
  entries: T,
): Record<string, { name: string }> | undefined {
  if (!entries || Object.keys(entries).length === 0) {
    return undefined;
  }
  return Object.fromEntries(Object.keys(entries).sort().map((name) => [name, { name }]));
}

function eventNameToAttributeName(name: string): string {
  if (name.startsWith("on") && name[2] === name[2]?.toUpperCase()) {
    return name;
  }
  return `on${name[0]?.toUpperCase() ?? ""}${name.slice(1)}`;
}
