import { createMetadata } from "../../component-core/metadata/helpers";

export const AppStateMd = createMetadata({
  status: "stable",
  nonVisual: true,
  deprecationMessage:
    "The AppState component is deprecated. Use global variables for new applications.",
  description:
    "`AppState` is a non-visual component that exposes shared bucket state through an id-based API.",
  props: {
    id: {
      description: "The identifier used to expose the AppState API in XMLUI expressions.",
      valueType: "string",
    },
    bucket: {
      description: "The shared state bucket name.",
      valueType: "string",
      defaultValue: "default",
    },
    initialValue: {
      description: "Initial state merged into the bucket when the component mounts.",
      valueType: "any",
    },
  },
  events: {
    didUpdate: {
      description: "This event fires when the bucket value changes.",
      signature: "didUpdate(updateInfo: { bucket: string; value: any; previousValue: any }): void",
    },
  },
  apis: {
    value: { description: "The current bucket value." },
    update: { description: "Merges a patch into the bucket value.", signature: "update(patch: object): void" },
    appendToList: { description: "Appends an item to a list property.", signature: "appendToList(key: string, item: any): void" },
    removeFromList: { description: "Removes an item from a list property.", signature: "removeFromList(key: string, item: any): void" },
    listIncludes: { description: "Checks if a list property contains an item.", signature: "listIncludes(key: string, item: any): boolean" },
  },
});
