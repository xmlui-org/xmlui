import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

/**
 * (Document it)
 */
export interface TrendLabelComponentDef extends ComponentDef<"TrendLabel"> {
  props: {
    /**
     * @descriptionRef
     */
    change?: number;
  };
}

export const trendLabelRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: {
    name: "TrendLabel",
    component: {
      type: "Fragment",
      children: [
        {
          type: "Text",
          when: "{$props.change > 0}",
          props: {
            marginLeft: "$space-2",
            color: "$color-valid",
          },
          children: [
            {
              type: "TextNode",
              props: {
                value: "{Math.floor($props.change * 100)}% ",
              },
            },
            {
              type: "Icon",
              props: {
                name: "trending-up",
              },
            },
          ],
        },
        {
          type: "Text",
          when: "{$props.change === 0}",
          props: {
            marginLeft: "$space-2",
            color: "$color-warning",
          },
          children: [
            {
              type: "TextNode",
              props: {
                value: "{Math.floor($props.change * 100)}% ",
              },
            },
            {
              type: "Icon",
              props: {
                name: "trending-up",
              },
            },
          ],
        },
        {
          type: "Text",
          when: "{$props.change < 0}",
          props: {
            marginLeft: "$space-2",
            color: "$color-error",
          },
          children: [
            {
              type: "TextNode",
              props: {
                value: "{Math.floor($props.change * 100)}% ",
              },
            },
            {
              type: "Icon",
              props: {
                name: "trending-up",
              },
            },
          ],
        },
      ],
    },
  },
};
