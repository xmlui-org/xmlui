import style from "@components/PieChart/PieChart.module.scss";

import { createMetadata, d } from "@abstractions/ComponentDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { createComponentRenderer } from "@components-core/renderers";
import { BarChart } from "./BarChartNative";

const COMP = "BarChart";

export const BarChartMd = createMetadata({
  status: "deprecated",
  description: `The \`BarChart\` component represents a bar chart.`,
  props: {
    data: d(
      `This property is used to provide the component with data to display. The data itself needs ` +
        `to be an array of objects.`,
    ),
    keys: d(`This property specifies what the label texts are for each bar.`),
    groupMode: d(
      `This property determines how the bars are layed out. The \`grouped\` variant lays out the ` +
        `bars next to each other on the primary axis. The \`stacked\` variant stacks the bars on ` +
        `top of each other.`,
    ),
    layout: d(
      `This property determines the orientation of the bar chart. The \`vertical\` variant ` +
        `specifies the horizontal axis as the primary and lays out the bars from left to right. ` +
        `The \`horizontal\` variant specifies the vertical axis as the primary and has the bars ` +
        `spread from top to bottom.`,
    ),
    indexBy: d(`Determines which attribute groups the bars together.`),
  },
  themeVars: parseScssVar(style.themeVars),
  defaultThemeVars: {
    "scheme-BarChart": "pastel1",
    "color-text-BarChart": "$color-text-secondary",
    "color-ticks-BarChart": "$color-text-primary",
    "color-bg-tooltip-BarChart": "$color-bg-primary",
    "color-text-tooltip-BarChart": "$color-text-primary",
    "color-axis-BarChart": "$color-text-primary",
    light: {
      "scheme-BarChart": "set3",
    },
    dark: {
      "scheme-BarChart": "dark2",
    },
  },
});

export const barChartComponentRenderer = createComponentRenderer(
  COMP,
  BarChartMd,
  ({ extractValue, node, layoutCss }) => {
    return (
      <BarChart
        style={layoutCss}
        data={extractValue(node.props?.data)}
        keys={extractValue(node.props?.keys)}
        groupMode={extractValue(node.props?.groupMode)}
        layout={extractValue(node.props?.layout)}
        indexBy={extractValue(node.props?.indexBy)}
      />
    );
  },
);
