import { createComponentRenderer, createMetadata } from "xmlui";
import {
  defaultProps,
  horizontalAlignmentValues,
  Legend,
  verticalAlignmentValues,
} from "./LegendNative";

const COMP = "Legend";

export const LegendMd = createMetadata({
  description: "Legend component to be displayed in a chart component.",
  props: {
    align: {
      description: "The alignment of the legend",
      valueType: "string",
      availableValues: horizontalAlignmentValues,
      defaultValue: defaultProps.align,
    },
    verticalAlign: {
      description: "The vertical alignment of the legend",
      valueType: "string",
      availableValues: verticalAlignmentValues,
      defaultValue: defaultProps.verticalAlign,
    },
  },
});

export const legendComponentRenderer = createComponentRenderer(
  COMP,
  LegendMd,
  ({ extractValue, node }: any) => {
    return (
      <Legend
        align={extractValue.asOptionalString(node.props?.align)}
        verticalAlign={extractValue.asOptionalString(node.props?.verticalAlign)}
      />
    );
  },
);
