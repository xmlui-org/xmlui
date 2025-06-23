import { defaultProps, PieChart } from "./PieChartNative";
import styles from "./PieChartNative.module.scss";
import { LabelPositionValues } from "../utils/abstractions";
import { createMetadata, d } from "../../../abstractions/ComponentDefs";
import { parseScssVar } from "../../../components-core/theming/themeVars";
import { createComponentRenderer } from "../../../components-core/renderers";

const COMP = "PieChart";

export const PieChartMd = createMetadata({
  description:
    "`PieChart` visualizes proportional data as circular segments; each slice " +
    "represents a percentage of the whole.",
  status: "experimental",
  docFolder: "Charts/PieChart",
  props: {
    data: {
      description: "The data to be displayed in the chart. Needs to be an array of objects.",
    },
    dataKeys: {
      description:
        "This property specifies the keys in the data objects that should be used for rendering the bars.",
      valueType: "string",
    },
    nameKey: {
      description:
        "Specifies the key in the data objects that will be used to label the different data series.",
      valueType: "string",
    },
    showLabel: {
      description: "Toggles whether to show labels (\`true\`) or not (\`false\`).",
      valueType: "boolean",
      defaultValue: defaultProps.showLabel,
    },
    showLabelList: {
      description: "Whether to show labels in a list (\`true\`) or not (\`false\`).",
      valueType: "boolean",
      defaultValue: defaultProps.showLabelList,
    },
    labelListPosition: {
      description: "The position of the label list.",
      valueType: "string",
      defaultValue: defaultProps.labelListPosition,
      availableValues: LabelPositionValues,
    },
    width: d("The width of the chart"),
    height: d("The height of the chart"),
    outerRadius: d(
      "The outer radius of the pie chart, can be a number or a string (e.g., '100%').",
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "textColor-labelList-PieChart": "$textColor-primary",
  },
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
