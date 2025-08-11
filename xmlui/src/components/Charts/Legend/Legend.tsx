import { createComponentRenderer } from "../../../components-core/renderers";
import { createMetadata } from "../../metadata-helpers";
import {
  defaultProps,
  horizontalAlignmentValues,
  Legend,
  verticalAlignmentValues,
} from "./LegendNative";

const COMP = "Legend";

export const LegendMd = createMetadata({
  status: "experimental",
  description:
    "`Legend` provides a standalone legend for chart components when you need " +
    "custom positioning or styling beyond the chart's built-in `showLegend` " +
    "property. Most charts can display legends automatically, but this component " +
    "offers precise control over legend placement and alignment.",
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
