import { wrapComponent, parseScssVar, createMetadata, type ComponentMetadata } from "xmlui";
import styles from "../PieChart/PieChartNative.module.scss";
import { defaultProps, PieChart, type PieChartProps } from "../PieChart/PieChartReact";

const COMP = "DonutChart";

const defaultPropsDonut = {
  ...defaultProps,
  innerRadius: 60,
};

export const DonutChartMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "A derivative of [PieChart](/components/PieChart) with a hollow center. " +
    "Note that the height of the component or its parent needs to be set explicitly.",
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
      description: "Toggles whether to show labels (`true`) or not (`false`).",
      valueType: "boolean",
      defaultValue: defaultPropsDonut.showLabel,
    },
    innerRadius: {
      description: "Sets the inner radius of the donut chart.",
      valueType: "number",
      defaultValue: defaultPropsDonut.innerRadius,
    },
    showLabelList: {
      description: "Whether to show labels in a list (`true`) or not (`false`).",
      valueType: "boolean",
      defaultValue: defaultPropsDonut.showLabelList,
    },
    showLegend: {
      description: "Whether to show a legend (`true`) or not (`false`).",
      valueType: "boolean",
      defaultValue: defaultPropsDonut.showLegend,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "textColor-labelList-PieChart": "$textColor-primary",
  },
});

export const donutChartComponentRenderer = wrapComponent(COMP, PieChart, DonutChartMd, {
  customRender: (props, context) => (
    <PieChart {...(props as PieChartProps)} innerRadius={props.innerRadius ?? defaultPropsDonut.innerRadius}>
      {context.renderChild(context.node.children)}
    </PieChart>
  ),
});
