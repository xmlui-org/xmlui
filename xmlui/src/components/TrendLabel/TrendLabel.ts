import { createMetadata, d } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

export const TrendLabelMd = createMetadata({
  description: "This component displays a trend label.",
  props: {
    change: d("The change percentage."),
  },
});

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
  hints: TrendLabelMd,
};
