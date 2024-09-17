import { createMetadata, d } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

const COMP = "TableHeader";

export const TableHeaderMd = createMetadata({
  description:
    `The \`${COMP}\` component can be used within a \`Table\` to define a particular table ` +
    `column's visual properties and data bindings.`,
  props: {
    title: d("The title of the table header."),
  },
  defaultThemeVars: {
    [`padding-vertical-${COMP}`]: "$space-4",
    [`padding-horizontal-${COMP}`]: "$space-5",
  },
});

export const tableHeaderRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: {
    name: COMP,
    component: {
      type: "VStack",
      props: {
        verticalAlignment: "center",
        verticalPadding: "$padding-vertical-TableHeader",
        horizontalPadding: "$padding-horizontal-TableHeader",
      },
      children: [
        {
          type: "Text",
          props: {
            variant: "strong",
            value: "{$props.title}",
          },
        },
      ],
    },
  },
  hints: TableHeaderMd,
};
