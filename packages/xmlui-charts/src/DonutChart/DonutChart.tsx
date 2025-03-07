import { createComponentRenderer, createMetadata, d, parseScssVar } from "xmlui";
import styles from "../PieChart/PieChartNative.module.scss";
import { defaultProps, PieChart } from "../PieChart/PieChartNative";

const COMP = "DonutChart";

const defaultPropsDonut = {
  ...defaultProps,
  innerRadius: 60,
};

export const DonutChartMd = createMetadata({
  description: "Represents a derivative of the pie chart that is a donut chart.",
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
      defaultValue: defaultPropsDonut.showLabel,
    },
    innerRadius: {
      description: "Sets the inner radius of the donut chart.",
      valueType: "number",
      defaultValue: defaultPropsDonut.innerRadius,
    },
    showLabelList: {
      description: "Whether to show labels in a list (\`true\`) or not (\`false\`).",
      valueType: "boolean",
      defaultValue: defaultPropsDonut.showLabelList,
    },
    showLegend: {
      description: "Whether to show a legend (\`true\`) or not (\`false\`).",
      valueType: "boolean",
      defaultValue: defaultPropsDonut.showLegend,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-text-labelList-PieChart": "$color-text-primary",
  },
});

export const donutChartComponentRenderer = createComponentRenderer(
  COMP,
  DonutChartMd,
  ({ extractValue, node, layoutCss, renderChild }: any) => {
    return (
      <PieChart
        showLabelList={extractValue.asOptionalBoolean(
          node.props?.showLabelList,
          defaultPropsDonut.showLabelList,
        )}
        innerRadius={extractValue.asOptionalNumber(
          node.props?.innerRadius,
          defaultPropsDonut.innerRadius,
        )}
        data={extractValue(node.props?.data)}
        style={layoutCss}
        showLabel={extractValue.asOptionalBoolean(
          node.props?.showLabel,
          defaultPropsDonut.showLabel,
        )}
        dataKey={extractValue(node.props?.dataKey)}
        nameKey={extractValue(node.props?.nameKey)}
        showLegend={extractValue.asOptionalBoolean(
          node.props?.showLegend,
          defaultPropsDonut.showLegend,
        )}
      >
        {renderChild(node.children)}
      </PieChart>
    );
  },
);
