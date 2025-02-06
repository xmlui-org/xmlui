import { createComponentRenderer, createMetadata, d } from "xmlui";
import { PieChart } from "./PieChartNative";

const COMP = "PieChart";

export const PieChartMd = createMetadata({
  description: "A pie chart component",
  props: {
    data: d("The data to be displayed in the pie chart"),
    dataKey: d("The key to use for the data"),
    nameKey: d("The key to use for the name"),
    showLabel: d("Whether to show labels"),
  },
});

export const pieChartComponentRenderer = createComponentRenderer(
  COMP,
  PieChartMd,
  ({ extractValue, node, layoutCss }: any) => {
    return (
      <PieChart
        data={extractValue(node.props?.data)}
        style={layoutCss}
        showLabel={extractValue.asOptionalBoolean(node.props?.showLabel)}
        dataKey={extractValue(node.props?.dataKey)}
        nameKey={extractValue(node.props?.nameKey)}
      />
    );
  },
);
