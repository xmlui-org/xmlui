import type { ComponentMetadata } from "../../src/abstractions/ComponentDefs";
import type { MetadataHandler, PropDescriptorHash } from "../../src/components-core/markup-check";

export function createTestMetadataHandler(
  desc: Record<string, ComponentMetadata>,
): MetadataHandler {
  return {
    componentRegistered: (type: string) => {
      return !!desc[type];
    },
    getComponentProps: (type: string) => {
      const compDesc = desc[type];
      if (!compDesc) {
        return {};
      }
      const propsToMap = compDesc.props ?? {};
      const mappedProps: PropDescriptorHash = {};
      Object.keys(propsToMap).forEach((key) => {
        const prop = propsToMap[key]!;
        mappedProps[key] = {
          type: prop.valueType,
          availableValues: prop.availableValues,
          defaultValue: prop.defaultValue,
        };
      });
      return mappedProps;
    },
    getComponentEvents(componentName) {
      const compDesc = desc[componentName];
      if (!compDesc) {
        return {};
      }
      const eventsToMap = compDesc.events ?? {};
      const mappedEvents: Record<string, any> = {};
      Object.keys(eventsToMap).forEach((key) => {
        mappedEvents[key] = eventsToMap[key];
      });
      return mappedEvents;
    },
    acceptArbitraryProps: (type: string) => {
      const compDesc = desc[type];
      return compDesc?.allowArbitraryProps ?? false;
    },
    getComponentValidator: (type: string) => {
      if (type === "Button") {
        return (instance, devMode) => {
          if (devMode && (instance.props as any)?.label?.startsWith("q")) {
            return "Label should not start with 'q'";
          }
          return null;
        };
      }
    },
  };
}
