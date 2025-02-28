import { createComponentRenderer, createMetadata, d, parseScssVar } from "xmlui";
import styles from "../PieChart/PieChartNative.module.scss";
import { PieChart } from "../PieChart/PieChartNative";

const COMP = "DonutChart";

export const DonutChartMd = createMetadata({
  description: "A donut chart component",
  props: {
    data: d("The data to be displayed in the pie chart"),
    dataKey: d("The key to use for the data"),
    nameKey: d("The key to use for the name"),
    showLabel: d("Whether to show labels"),
    innerRadius: d("The inner radius of the donut chart"),
    showLabelList: d("Whether to show labels in a list"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-text-labelList-PieChart": "$color-text-primary",
  },
});

export const donutChartComponentRenderer = createComponentRenderer(
  COMP,
  DonutChartMd,
  ({ extractValue, node, layoutCss }: any) => {
    return (
      <PieChart
        showLabelList={extractValue.asOptionalBoolean(node.props?.showLabelList)}
        innerRadius={extractValue(node.props?.innerRadius || 60)}
        data={extractValue(node.props?.data)}
        style={layoutCss}
        showLabel={extractValue.asOptionalBoolean(node.props?.showLabel)}
        dataKey={extractValue(node.props?.dataKey)}
        nameKey={extractValue(node.props?.nameKey)}
      />
    );
  },
);
