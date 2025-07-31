import { createMetadata, d } from "../metadata-helpers";
import { createPropHolderComponent } from "../../components-core/renderers";

const COMP = "Slot";

export const SlotMd = createMetadata({
  status: "experimental",
  description:
    "Placeholder in a reusable component. " +
    "Signs the slot where the component's injected children should be rendered.",
  props: {
    name: d(`This optional property defines the name of the slot.`),
  },
  allowArbitraryProps: true,
  opaque: true
});

export const SlotHolder = createPropHolderComponent(COMP, SlotMd);
