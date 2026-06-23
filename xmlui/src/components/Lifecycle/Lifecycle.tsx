import { createMetadata } from "../../component-core/metadata/helpers";

export const LifecycleMd = createMetadata({
  status: "experimental",
  nonVisual: true,
  description:
    "`Lifecycle` is a non-visual component for mount, unmount, and key-change side effects.",
  props: {
    keyValue: {
      description: "When this value changes, unmount then mount handlers run again.",
      valueType: "any",
    },
  },
  events: {
    mount: {
      description: "Runs when the lifecycle component mounts and after key changes.",
      signature: "mount(): void | Promise<void>",
    },
    unmount: {
      description: "Runs when the lifecycle component unmounts and before key-change remount.",
      signature: "unmount(): void",
    },
    error: {
      description: "Runs when a lifecycle handler throws.",
      signature: "error(payload: { source: string; error: { message: string; stack?: string } }): void",
    },
  },
});
