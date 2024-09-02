import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { FragmentComponentDef } from "@components-core/Fragment";

import { createPropHolderComponent } from "@components-core/renderers";

interface ChildrenSlot extends ComponentDef<"ChildrenSlot"> {}

export const metadata: ComponentDescriptor<FragmentComponentDef> = {
  displayName: "ChildrenSlot",
  description:
    "Placeholder in a reusable component. " +
    "Signs the slot where the component's injected children should be rendered.",
};

export const childrenSlotHolder = createPropHolderComponent<ChildrenSlot>("ChildrenSlot", metadata);
