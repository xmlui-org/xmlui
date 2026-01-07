import type {
  ComponentMetadata,
  ComponentPropertyMetadata,
} from "../../../abstractions/ComponentDefs";
import { layoutOptionKeys } from "../../../components-core/descriptorHelper";
import { onPrefixRegex, stripOnPrefix } from "../../../parsers/xmlui-parser";
import { viewportSizeMd } from "../../../components/abstractions";

type RestrictedComponentMetadata = Pick<
  ComponentMetadata,
  | "description"
  | "status"
  | "props"
  | "events"
  | "apis"
  | "contextVars"
  | "allowArbitraryProps"
  | "shortDescription"
>;

export type ComponentMetadataCollection = Record<string, RestrictedComponentMetadata>;

export class MetadataProvider {
  constructor(private readonly metadataCollection: ComponentMetadataCollection) {}

  componentNames(): string[] {
    return Object.keys(this.metadataCollection);
  }

  getComponent(componentName: string): ComponentMetadataProvider | null {
    const providerData = this.metadataCollection[componentName];
    if (!providerData) {
      return null;
    }

    return new ComponentMetadataProvider(providerData);
  }
}

export type AttributeKind = "prop" | "event" | "api" | "implicit" | "layout";
export type TaggedAttribute = { name: string; kind: AttributeKind };

export class ComponentMetadataProvider {
  constructor(private readonly metadata: RestrictedComponentMetadata) {}

  /**
   * Retrieves the metadata for a given property, explicit or implicit.
   * @param name The name of the property.
   * @returns The metadata for the property, or `undefined` if not found.
   */
  getProp(name: string) {
    return this.metadata.props[name] ?? implicitPropsMetadata[name];
  }

  getAttr(name: string) {
    if (onPrefixRegex.test(name)) {
      const eventName = stripOnPrefix(name);
      const event = this.metadata.events?.[eventName];
      if (event) {
        return event;
      }
    }
    const explicitProp = this.metadata.props?.[name];
    if (explicitProp) {
      return explicitProp;
    }
    const api = this.metadata.apis?.[name];
    if (api) {
      return api;
    }

    const layout = layoutMdForKey(name);
    if (layout) {
      return layout;
    }
    return implicitPropsMetadata[name];
  }

  getAttrForKind({ name, kind }: TaggedAttribute) {
    switch (kind) {
      case "api":
        return this.metadata.apis[name];
      case "event":
        return this.metadata.events[name];
      case "prop":
        return this.metadata.props[name];
      case "implicit":
        return implicitPropsMetadata[name];
      case "layout":
        return layoutMdForKey(name);
    }
  }

  getAllAttributes() {
    const attrNames: TaggedAttribute[] = [];
    for (const key of Object.keys(this.metadata.props ?? {})) {
      attrNames.push({ name: key, kind: "prop" });
    }
    for (const key of Object.keys(this.metadata.events ?? {})) {
      attrNames.push({ name: key, kind: "event" });
    }
    for (const key of Object.keys(this.metadata.apis ?? {})) {
      attrNames.push({ name: key, kind: "api" });
    }
    for (const layoutKey of layoutOptionKeys) {
      attrNames.push({ name: layoutKey, kind: "layout" });
    }
    for (const implicitPropKey of Object.keys(implicitPropsMetadata)) {
      attrNames.push({ name: implicitPropKey, kind: "implicit" });
    }

    return attrNames;
  }

  getEvent(name: string) {
    return this.metadata.events?.[name];
  }

  getApi(name: string) {
    return this.metadata.apis?.[name];
  }

  get events(): Record<string, string> {
    return this.metadata.events;
  }

  get apis(): Record<string, string> {
    return this.metadata.apis;
  }

  get contextVars(): Record<string, string> {
    return this.metadata.contextVars;
  }

  get allowArbitraryProps(): boolean {
    return this.metadata.allowArbitraryProps;
  }

  get shortDescription(): string {
    return this.metadata.shortDescription;
  }

  getMetadata(): RestrictedComponentMetadata {
    return this.metadata;
  }
}

function layoutMdForKey(name: string): ComponentPropertyMetadata {
  const metadata = {
    description: "Layout property. Not yet documented",
  };
  if (layoutOptionKeys.includes(name)) {
    return metadata;
  }
  for (const size of viewportSizeMd) {
    const suffix =
      "-" +
      (
        size as {
          value: string | number;
          description: string;
        }
      ).value;

    if (name.endsWith(suffix)) {
      const nameWithoutSize = name.slice(0, -suffix.length);
      if (layoutOptionKeys.includes(nameWithoutSize)) {
        return metadata;
      }
    }
  }
  return null;
}

const implicitPropsMetadata: Record<string, ComponentPropertyMetadata> = {
  inspect: {
    description: "Determines whether the component can be inspected or not",
    defaultValue: false,
    valueType: "boolean",
  },
  data: {
    description:
      "Specifies the data source for a component. Can be a URL string (fetched automatically), a DataSource or an expression to evaluate. Changes to this property trigger UI updates once data is loaded.",
  },
  when: {
    description: "Specifies a condition that must be met for the component to be displayed",
    defaultValue: true,
    valueType: "boolean",
  },
};

export function addOnPrefix(name: string) {
  return "on" + name[0].toUpperCase() + name.substring(1);
}
