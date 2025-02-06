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
    bars: d("key, color pairs - key is the key in the data, color is the color of the bar"),
    stacked: d(`This property determines how the bars are layed out.`),
    layout: d(
      `This property determines the orientation of the bar chart. The \`vertical\` variant ` +
        `specifies the horizontal axis as the primary and lays out the bars from left to right. ` +
        `The \`horizontal\` variant specifies the vertical axis as the primary and has the bars ` +
        `spread from top to bottom.`,
    ),
    indexBy: d(`Determines which attribute groups the bars together.`),
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
        indexBy={extractValue(node.props?.indexBy)}
        bars={extractValue(node.props?.bars)}
        stacked={extractValue(node.props?.stacked)}
      />
    );
  },
);
