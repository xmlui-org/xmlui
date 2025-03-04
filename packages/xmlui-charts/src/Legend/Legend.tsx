import { createComponentRenderer, createMetadata, d } from "xmlui";
import { Legend } from "./LegendNative";

const COMP = "Legend";

export const LegendMd = createMetadata({
  description: "A legend component",
  props: {
    align: d("The alignment of the legend"),
    verticalAlign: d("The vertical alignment of the legend"),
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
