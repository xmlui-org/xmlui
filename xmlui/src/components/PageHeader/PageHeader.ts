import { createMetadata, d } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

const COMP = "PageHeader";
export const PageHeaderMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` component is a component that displays a title and an ` +
    `optional pre-title. The pre-title is displayed above the title.`,
  props: {
    preTitle: d("The pre-title to display above the title."),
    title: d("The title to display."),
  },
  defaultThemeVars: {
    "gap-PageHeader": "$space-2",
  },
});

export const pageHeaderRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: {
    name: "PageHeader",
    component: {
      type: "HStack",
      props: {
        gap: "$gap-PageHeader",
        verticalAlignment: "center",
      },
      children: [
        {
          type: "VStack",
          props: {
            gap: 0,
          },
          children: [
            {
              type: "Text",
              props: {
                variant: "subheading",
                when: "{$props.preTitle !== undefined}",
                value: "{$props.preTitle}",
              },
            },
            {
              type: "H2",
              props: {
                value: "{$props.title}",
                margin: "0",
              },
            },
          ],
        },
        {
          type: "SpaceFiller",
        },
        {
          type: "Slot",
        },
      ],
    },
  },
  hints: PageHeaderMd,
};
