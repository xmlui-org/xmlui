import {
  createMetadata,
  type ComponentDef,
  type CompoundComponentDef,
} from "@abstractions/ComponentDefs";
import { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

const COMP = "FormSection";

export interface FormSectionComponentDef extends ComponentDef<"FormSection"> {
  props: {
    /**
     * This optional string property is used to provide a heading text for the section.
     * @descriptionRef
     */
    heading?: string;
    /**
     * Customize the level of the heading using this property.
     * All regular heading levels are supported in the h1-h6 range.
     * The default level is \`h3\`.
     * @descriptionRef
     */
    headingLevel?: string;
    /**
     * Customize the weight of the heading using this property.
     * This property is canonical to the
     * [font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight) CSS rule.
     * Available weights are also determined by the chosen font for the heading.
     * @descriptionRef
     */
    headingWeight?: string;
    /**
     * This optional string property is used to provide details and information for a grouped section.
     * @descriptionRef
     */
    info?: string;
    /**
     * This property is used to customize the font size of the [\`info\`](#info) text.
     * It is set to \`0.8rem\` by default.
     * @descriptionRef
     */
    infoFontSize?: string;
    /**
     * **NOTE:** This property might be redundant.
     *
     * Sets the bottom padding of the component.
     * The default size is \`1rem\`.
     * @descriptionRef
     */
    paddingBottom?: number | string;
    /**
     * This optional property is used to customize the gap between the columns of the \`FormSection\`.
     * The default column gap size is \`3rem\`.
     * @descriptionRef
     */
    columnGap?: number | string;
    /**
     * This optional property is used to customize the gap between the rows of the \`FormSection\`.
     * The default row gap size is \`1rem\`.
     * @descriptionRef
     */
    rowGap?: number | string;

    // These come from VStack, not used here
    // reverse?: boolean;
    // hoverContainer?: string;
    // visibleOnHover?: string;
  };
  // These come from VStack, not used here
  events: {
    /** @internal */
    click: string;
    /** @internal */
    mounted: string;
  };
}

export const FormSectionMd = createMetadata({
  description: `The \`${COMP}\` is a component that groups cohesive elements together within ` + 
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
};
