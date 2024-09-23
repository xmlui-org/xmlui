import { createMetadata, d } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

export const ToolbarMd = createMetadata({
  status: "experimental",
  description: "This component is a container for a toolbar.",
  props: {
    alignment: d("The alignment of the toolbar."),
  },
  defaultThemeVars: {
    "gap-Toolbar": "$space-2",
  },
});

export const toolbarRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: {
    name: "Toolbar",
    component: {
      type: "HStack",
      props: {
        gap: "$gap-Toolbar",
        verticalAlignment: "center",
        horizontalAligmnent: "{$props.alignment ?? 'end' }",
      },
      children: [
        {
          type: "Slot",
        },
      ],
    },
  },
  hints: ToolbarMd,
};
