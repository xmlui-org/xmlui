import { createComponentRenderer, createMetadata, d } from "xmlui";
import { LineChart } from "./LineChartNative";

const COMP = "LineChart";

export const LineChartMd = createMetadata({
  description: "A pie chart component",
  props: {
    data: d("The data to be displayed in the pie chart"),
    dataKey: d("The key to use for the data"),
    nameKey: d("The key to use for the name"),
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
        dataKey={extractValue(node.props?.dataKey)}
        nameKey={extractValue(node.props?.nameKey)}
      />
    );
  },
);
