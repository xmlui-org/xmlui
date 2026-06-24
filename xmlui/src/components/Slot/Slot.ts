import { createMetadata } from "../../component-core/metadata/helpers";

export const SlotMd = createMetadata({
  status: "experimental",
  description:
    "Placeholder in a reusable component where injected children should be rendered.",
  allowArbitraryProps: true,
  opaque: true,
  props: {
    name: {
      description: "This optional property defines the name of the slot.",
      valueType: "string",
    },
  },
});
