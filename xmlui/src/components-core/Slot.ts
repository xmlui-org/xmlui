import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createPropHolderComponentNew } from "@components-core/renderers";

const COMP = "Slot";

export const SlotMd = createMetadata({
  status: "in review",
  description:
    "Placeholder in a reusable component. " +
    "Signs the slot where the component's injected children should be rendered.",
  props: {
    name: d(`This optional property defines the name of the slot.`),
  },
  allowArbitraryProps: true,
});

export const SlotHolder = createPropHolderComponentNew(COMP, SlotMd);
