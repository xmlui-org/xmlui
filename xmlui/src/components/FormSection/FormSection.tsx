import { createMetadata } from "@abstractions/ComponentDefs";
import { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

const COMP = "FormSection";

export const FormSectionMd = createMetadata({
  description:
    `The \`${COMP}\` is a component that groups cohesive elements together within ` +
    `a \`Form\`. This grouping is indicated visually: the child components of the \`${COMP}\` ` +
    `are placed in a [\`FlowLayout\`](./FlowLayout.mdx) component.`,
});

export const formSectionRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: {
    name: "FormSection",
    component: {
      type: "VStack",
      props: {
        paddingBottom: "{$props.paddingBottom ?? '1rem'}",
      },
      children: [
        {
          type: "Heading",
          when: "{!!$props.heading}",
          props: {
            marginBottom: "0.5rem",
            level: "{$props.headingLevel ?? 'h3'}",
            fontWeight: "{$props.headingWeight ?? 'bold'}",
            value: "{$props.heading}",
          },
        },
        {
          type: "Text",
          when: "{!!$props.info}",
          props: {
            fontSize: "{$props.infoFontSize ?? '0.8rem'}",
            paddingBottom: "1.25rem",
            value: "{$props.info}",
          },
        },
        {
          type: "FlowLayout",
          props: {
            columnGap: "{$props.columnGap ?? '3rem'}",
            rowGap: "{$props.rowGap ?? '1rem'}",
          },
          children: [
            {
              type: "Slot",
            },
          ],
        },
      ],
    },
  },
  hints: FormSectionMd,
};
