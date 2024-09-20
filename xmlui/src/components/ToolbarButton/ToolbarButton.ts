import { createMetadata, d } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

export const ToolbarButtonMd = createMetadata({
  status: "experimental",
  description: "This component is a button that is used in a toolbar.",
  props: {
    label: d("The label to display on the button."),
    icon: d("The icon to display on the button."),
  },
  defaultThemeVars: {
    "padding-horizontal-ToolbarButton": "$space-1",
    "padding-vertical-ToolbarButton": "$space-1",
  },
});

export const toolbarButtonRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: {
    name: "ToolbarButton",
    component: {
      type: "Button",
      props: {
        variant: "ghost",
        themeColor: "secondary",
        horizontalPadding: "$padding-horizontal-ToolbarButton",
        verticalPadding: "$padding-vertical-ToolbarButton",
        icon: "{$props.icon}",
        label: "{$props.label}",
      },
      events: {
        click: "e => emitEvent('click', e)",
      },
      children: [
        {
          type: "Slot",
        },
      ],
    },
  },
  hints: ToolbarButtonMd,
};
