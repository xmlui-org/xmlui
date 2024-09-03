import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { FragmentComponentDef } from "@components-core/Fragment";

import { createPropHolderComponent } from "@components-core/renderers";

interface Slot extends ComponentDef<"Slot"> {}

export const metadata: ComponentDescriptor<FragmentComponentDef> = {
  displayName: "Slot",
  description:
    "Placeholder in a reusable component. " +
    "Signs the slot where the component's injected children should be rendered.",
};

export const SlotHolder = createPropHolderComponent<Slot>("Slot", metadata);
