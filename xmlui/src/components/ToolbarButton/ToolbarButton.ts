import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

/**
 * (Document it)
 */
export interface ToolbarButtonComponentDef
  extends ComponentDef<"ToolbarButton"> {
  props: {
    /**
     * @descriptionRef
     */
    label?: string;
    /**
     * @descriptionRef
     */
    icon?: string;
  };
  events: {
    click: (event: any) => void;
  }
}

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
        click: "e => $events.click(e)",
      },
      children: [
        {
          type: "ChildrenSlot",
        },
      ],
    },
  },
  hints: {
    defaultThemeVars: {
        "padding-horizontal-ToolbarButton": "$space-1",
        "padding-vertical-ToolbarButton": "$space-1",
    }
  }
};
