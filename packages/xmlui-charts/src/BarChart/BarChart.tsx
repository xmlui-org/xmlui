import { BarChart } from "./BarChartNative";
import { createComponentRenderer, createMetadata, d } from "xmlui";

const COMP = "BarChart";

export const BarChartMd = createMetadata({
  props: {
    data: d(
      `This property is used to provide the component with data to display. The data itself needs ` +
        `to be an array of objects.`,
    ),
    dataKeys: d(
      "This property specifies the keys in the data objects that should be used for rendering the bars.",
    ),
    stacked: d(
      `This property determines how the bars are laid out. If set to true, bars with the same category will be stacked on top of each other rather than placed side by side.`,
    ),
    layout: d(
      `This property determines the orientation of the bar chart. The \`vertical\` variant ` +
        `specifies the horizontal axis as the primary and lays out the bars from left to right. ` +
        `The \`horizontal\` variant specifies the vertical axis as the primary and has the bars ` +
        `spread from top to bottom.`,
    ),
    nameKey: d("Specifies the key in the data objects that will be used to group bars together."),
    hideX: d(
      "Determines whether the X-axis should be hidden. If set to true, the axis will not be rendered.",
    ),
    hideY: d(
      "Determines whether the Y-axis should be hidden. If set to true, the axis will not be rendered.",
    ),
    hideTickX: d(
      "Controls the visibility of the X-axis ticks. If set to true, tick labels on the X-axis will be hidden.",
    ),
    hideTickY: d(
      "Controls the visibility of the Y-axis ticks. If set to true, tick labels on the Y-axis will be hidden.",
    ),
    tickFormatter: d(
      "A function that formats the axis tick labels. It receives a tick value and returns a formatted string.",
    ),
  },
});

export const barChartComponentRenderer = createComponentRenderer(
  COMP,
  BarChartMd,
  ({ extractValue, node, layoutCss, lookupSyncCallback }: any) => {
    return (
      <BarChart
        style={layoutCss}
        tickFormatter={lookupSyncCallback(node.props?.tickFormatter)}
        data={extractValue(node.props?.data)}
        layout={extractValue(node.props?.layout)}
        nameKey={extractValue(node.props?.nameKey)}
        dataKeys={extractValue(node.props?.dataKeys)}
        stacked={extractValue.asOptionalBoolean(node.props?.stacked)}
        hideX={extractValue.asOptionalBoolean(node.props?.hideX)}
        hideY={extractValue.asOptionalBoolean(node.props?.hideY)}
        hideTickX={extractValue.asOptionalBoolean(node.props?.hideTickX)}
        hideTickY={extractValue.asOptionalBoolean(node.props?.hideTickY)}
      />
    );
  },
);
