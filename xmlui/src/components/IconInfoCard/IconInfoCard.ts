import { createMetadata, d } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

export const IconInfoCardMd = createMetadata({
  description: "This component displays an icon and some content in a card.",
  props: {
    height: d("The height of the card."),
    iconBackgroundColor: d("The background color of the icon."),
    iconName: d("The name of the icon to display."),
  },
});

export const iconInfoCardRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: {
    name: "IconInfoCard",
    component: {
      type: "Card",
      props: {
        height: "{$props.height}",
      },
      children: [
        {
          type: "HStack",
          props: {
            gap: "$space-4",
            verticalAlignment: "center",
          },
          children: [
            {
              type: "CHStack",
              props: {
                backgroundColor: "{$props.iconBackgroundColor}",
                color: "white",
                width: "$space-10",
                height: "$space-10",
                radius: "$radius",
              },
              children: [
                {
                  type: "Icon",
                  props: {
                    name: "{$props.iconName}",
                    size: "$space-6",
                  },
                },
              ],
            },
            {
              type: "VStack",
              children: [
                {
                  type: "Slot",
                },
              ],
            },
          ],
        },
      ],
    },
  },
  hints: IconInfoCardMd,
};
