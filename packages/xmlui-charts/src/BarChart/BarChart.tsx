import { BarChart } from "./BarChartNative";
import { createComponentRenderer, createMetadata, d } from "xmlui";

const COMP = "BarChart";

export const BarChartMd = createMetadata({
  description: `The \`BarChart\` component represents a bar chart.`,
  props: {
    data: d(
      `This property is used to provide the component with data to display. The data itself needs ` +
        `to be an array of objects.`,
    ),
    dataKeys: d(
      "This property specifies the keys in the data objects that should be used for rendering the bars.",
    ),
    stacked: d(`This property determines how the bars are layed out.`),
    layout: d(
      `This property determines the orientation of the bar chart. The \`vertical\` variant ` +
        `specifies the horizontal axis as the primary and lays out the bars from left to right. ` +
        `The \`horizontal\` variant specifies the vertical axis as the primary and has the bars ` +
        `spread from top to bottom.`,
    ),
    nameKey: d("Specifies the key in the data objects that will be used to group bars together."),
  },
});

export const barChartComponentRenderer = createComponentRenderer(
  COMP,
  BarChartMd,
  ({ extractValue, node, layoutCss }: any) => {
    return (
      <BarChart
        style={layoutCss}
        data={extractValue(node.props?.data)}
        layout={extractValue(node.props?.layout)}
        nameKey={extractValue(node.props?.nameKey)}
        dataKeys={extractValue(node.props?.dataKeys)}
        stacked={extractValue(node.props?.stacked)}
      />
    );
  },
);
