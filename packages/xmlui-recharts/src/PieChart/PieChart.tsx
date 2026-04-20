import type { ComponentMetadata } from "xmlui";
import { defaultProps, PieChart } from "./PieChartReact";
import styles from "./PieChartNative.module.scss";
import { LabelPositionValues } from "../utils/abstractions";
import { parseScssVar, wrapComponent, createMetadata, d } from "xmlui";

const COMP = "PieChart";

export const PieChartMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "`PieChart` visualizes proportional data as circular segments; each slice " +
    "represents a percentage of the whole. Note that the height of the component or " +
    "its parent needs to be set explicitly.",
  docFolder: "Charts/PieChart",
  props: {
    data: {
      description: "The data to be displayed in the chart. Needs to be an array of objects.",
    },
    nameKey: {
      description:
        "Specifies the key in the data objects that will be used to label the different data series.",
      valueType: "string",
    },
    dataKey: {
      description:
        "This property specifies the key in the data objects that will be used to render the chart.",
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
    outerRadius: d(
      "The outer radius of the pie chart, can be a number or a string (e.g., '100%').",
    ),
    showLegend: {
      description: "Toggles whether to show legend (\`true\`) or not (\`false\`).",
      valueType: "boolean",
      defaultValue: defaultProps.showLegend,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "textColor-labelList-PieChart": "$textColor-primary",
  },
});

export const pieChartComponentRenderer = wrapComponent(COMP, PieChart, PieChartMd);
