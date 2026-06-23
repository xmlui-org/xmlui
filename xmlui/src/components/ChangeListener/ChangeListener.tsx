import { createMetadata } from "../../component-core/metadata/helpers";

export const ChangeListenerMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`ChangeListener` is a non-visual component that fires an event when a watched value changes.",
  props: {
    listenTo: {
      description: "The value to watch for changes.",
      valueType: "any",
    },
    listenToSources: {
      description: "Named or indexed values to watch as independent change sources.",
      valueType: "any",
    },
    throttleWaitInMs: {
      description: "Throttle delay for the didChange event.",
      valueType: "number",
      defaultValue: 0,
    },
    debounceWaitInMs: {
      description: "Debounce delay for the didChange event. Takes precedence over throttling.",
      valueType: "number",
      defaultValue: 0,
    },
  },
  events: {
    didChange: {
      description: "This event fires when the watched value changes.",
      signature: "didChange(change: { prevValue: any; newValue: any }): void",
    },
  },
});
