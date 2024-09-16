import { createComponentRendererNew } from "@components-core/renderers";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import styles from "./PieChart.module.scss";
import { parseScssVar } from "@components-core/theming/themeVars";
import { PieChart } from "./PieChartNative";

const COMP = "PieChart";

export const PieChartMd = createMetadata({
  description: "A pie chart component",
  props: {
    data: d("The data to be displayed in the pie chart"),
    isInteractive: d("Whether the chart is interactive"),
    showLabels: d("Whether to show labels"),
    showLegends: d("Whether to show legends"),
    legendPosition: d("The position of the legend"),
    legendDirection: d("The direction of the legend"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`scheme-${COMP}`]: "nivo",
    [`color-text-${COMP}`]: "$color-text-secondary",
    [`color-ticks-${COMP}`]: "$color-text-primary",
    [`color-bg-tooltip-${COMP}`]: "$color-bg-primary",
    [`color-text-tooltip-${COMP}`]: "$color-text-primary",
    [`color-axis-${COMP}`]: "$color-text-primary",
    [`color-text-legend-${COMP}`]: "$color-text-primary",
    light: {
      [`scheme-${COMP}`]: "set3",
    },
    dark: {
      [`scheme-${COMP}`]: "dark2",
    },
  },
});

export const pieChartComponentRenderer = createComponentRendererNew(
  COMP,
  PieChartMd,
  ({ extractValue, node, layoutCss }) => {
    return (
      <PieChart
        data={extractValue(node.props?.data)}
        isInteractive={extractValue.asOptionalBoolean(node.props?.isInteractive)}
        showLabels={extractValue.asOptionalBoolean(node.props?.showLabels)}
        style={layoutCss}
        showLegends={extractValue.asOptionalBoolean(node.props?.showLegends)}
        legendPosition={extractValue(node.props?.legendPosition)}
        legendDirection={extractValue(node.props?.legendDirection)}
      />
    );
  },
);
