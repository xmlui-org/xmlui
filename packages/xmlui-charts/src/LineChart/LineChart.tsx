import { createComponentRenderer, createMetadata, d } from "xmlui";
import { LineChart } from "./LineChartNative";

const COMP = "LineChart";

export const LineChartMd = createMetadata({
  description: "A line chart component",
  props: {
    data: d(
      "The data to be displayed in the line chart. It should be an array of objects, where each object represents a data point.",
    ),
    dataKeys: d(
      "This property specifies the keys in the data objects that should be used for rendering the lines.",
    ),
    nameKey: d("The key in the data objects used for labeling different data series."),
    hideX: d(
      "Determines whether the X-axis should be hidden. If set to true, the axis will not be displayed.",
    ),
    hideTooltip: d(
      "Determines whether the tooltip should be hidden. If set to true, no tooltip will be shown when hovering over data points.",
    ),
  },
});

export const lineChartComponentRenderer = createComponentRenderer(
  COMP,
  LineChartMd,
  ({ extractValue, node, layoutCss }: any) => {
    return (
      <LineChart
        data={extractValue(node.props?.data)}
        style={layoutCss}
        dataKeys={extractValue(node.props?.dataKeys)}
        nameKey={extractValue(node.props?.nameKey)}
        hideX={extractValue(node.props?.hideX)}
        hideTooltip={extractValue(node.props?.hideTooltip)}
      />
    );
  },
);
