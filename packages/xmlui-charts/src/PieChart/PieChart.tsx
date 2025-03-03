import { createComponentRenderer, createMetadata, d, parseScssVar } from "xmlui";
import { PieChart } from "./PieChartNative";
import styles from "./PieChartNative.module.scss";

const COMP = "PieChart";

export const PieChartMd = createMetadata({
  description: "A pie chart component",
  props: {
    data: d("The data to be displayed in the pie chart"),
    dataKey: d("The key to use for the data"),
    nameKey: d("The key to use for the name"),
    showLabel: d("Whether to show labels"),
    showLabelList: d("Whether to show labels in a list"),
    labelListPosition: d("The position of the label list"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-text-labelList-PieChart": "$color-text-primary",
  }
});

export const pieChartComponentRenderer = createComponentRenderer(
  COMP,
  PieChartMd,
  ({ extractValue, node, layoutCss, renderChild }: any) => {
    return (
      <PieChart
        showLabelList={extractValue.asOptionalBoolean(node.props?.showLabelList)}
        labelListPosition={extractValue.asOptionalString(node.props?.labelListPosition)}
        data={extractValue(node.props?.data)}
        style={layoutCss}
        showLabel={extractValue.asOptionalBoolean(node.props?.showLabel)}
        showLegend={extractValue.asOptionalBoolean(node.props?.showLegend)}
        dataKey={extractValue(node.props?.dataKey)}
        nameKey={extractValue(node.props?.nameKey)}
      >
        {renderChild(node.children)}
      </PieChart>
    );
  },
);
