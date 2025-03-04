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
    tickFormatter: d(
      "A function that formats the axis tick labels. It receives a tick value and returns a formatted string.",
    ),
    showLegend: d("Determines whether the legend should be displayed."),
  },
});

export const lineChartComponentRenderer = createComponentRenderer(
  COMP,
  LineChartMd,
  ({ extractValue, node, layoutCss, lookupSyncCallback, renderChild }: any) => {
    return (
      <LineChart
        tickFormatter={lookupSyncCallback(node.props?.tickFormatter)}
        data={extractValue(node.props?.data)}
        style={layoutCss}
        dataKeys={extractValue(node.props?.dataKeys)}
        nameKey={extractValue(node.props?.nameKey)}
        hideX={extractValue(node.props?.hideX)}
        hideTooltip={extractValue(node.props?.hideTooltip)}
        showLegend={extractValue.asOptionalBoolean(node.props?.showLegend)}
      >
        {renderChild(node.children)}
      </LineChart>
    );
  },
);
