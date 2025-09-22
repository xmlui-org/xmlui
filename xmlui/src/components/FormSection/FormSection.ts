import { createUserDefinedComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import componentSource from "./FormSection.xmlui?raw";

const COMP = "FormSection";

export const FormSectionMd = createMetadata({
  status: "experimental",
  description:
    "`FormSection` groups elements within a `Form`. Child components are placed in " +
    "a [FlowLayout](/components/FlowLayout).",
  props: {
    heading: {
      description: "The heading text to be displayed at the top of the form section.",
      type: "string",
    },
    headingLevel: {
      description: "The semantic and visual level of the heading.",
      availableValues: ["h1", "h2", "h3", "h4", "h5", "h6"],
      defaultValue: "h3",
    },
    headingWeight: {
      description: "The font weight of the heading.",
      type: "string",
      defaultValue: "bold",
    },
    info: {
      description: "Informational text displayed below the heading.",
      type: "string",
    },
    infoFontSize: {
      description: "The font size of the informational text.",
      type: "string",
      defaultValue: "0.8rem",
    },
    paddingTop: {
      description: "The top padding of the FlowLayout where the section's children are placed.",
      type: "string",
      defaultValue: "$space-normal",
    },
    columnGap: {
      description: "The gap between columns of items within the section.",
      type: "string",
      defaultValue: "3rem",
    },
    rowGap: {
      description: "The gap between rows of items within the section.",
      type: "string",
      defaultValue: "$space-normal",
    },
  },
});

export const formSectionRenderer = createUserDefinedComponentRenderer(
  FormSectionMd,
  componentSource,
);
