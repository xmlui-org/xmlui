import { BarChart, defaultProps } from "./BarChartNative";
import { createComponentRenderer } from "../../../components-core/renderers";
import { createMetadata } from "../../metadata-helpers";

const COMP = "BarChart";

export const BarChartMd = createMetadata({
  status: "experimental",
  description:
    "`BarChart` displays data as horizontal or vertical bars, supporting both grouped " +
    "and stacked layouts. It's ideal for comparing values across categories, showing " +
    "revenue trends, or displaying any quantitative data over time or categories.",
  docFolder: "Charts/BarChart",
  props: {
    data: {
      description:
        `This property is used to provide the component with data to display.` +
        `The data needs to be an array of objects.`,
    },
    dataKeys: {
      description:
        "This property specifies the keys in the data objects that should be used for rendering the bars." +
        `E.g. 'id' or 'key'.`,
      valueType: "string",
    },
    stacked: {
      description:
        `This property determines how the bars are laid out.` +
        `If set to \`true\`, bars with the same category will be stacked on top of each other rather than placed side by side.`,
      valueType: "boolean",
      defaultValue: defaultProps.stacked,
    },
    layout: {
      description:
        `This property determines the orientation of the bar chart. The \`vertical\` variant ` +
        `specifies the horizontal axis as the primary and lays out the bars from left to right. ` +
        `The \`horizontal\` variant specifies the vertical axis as the primary and has the bars ` +
        `spread from top to bottom.`,
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultProps.layout,
    },
    nameKey: {
      description:
        "Specifies the key in the data objects that will be used to label the different data series.",
      valueType: "string",
    },
    hideX: {
      description:
        "Determines whether the X-axis should be hidden. If set to `true`, the axis will not be rendered.",
      valueType: "boolean",
      defaultValue: defaultProps.hideX,
    },
    hideY: {
      description:
        "Determines whether the Y-axis should be hidden. If set to `true`, the axis will not be rendered.",
      valueType: "boolean",
      defaultValue: defaultProps.hideY,
    },
    hideTickX: {
      description:
        "Controls the visibility of the X-axis ticks. If set to `true`, tick labels on the X-axis will be hidden.",
      valueType: "boolean",
      defaultValue: defaultProps.hideTickX,
    },
    hideTickY: {
      description:
        "Controls the visibility of the Y-axis ticks. If set to `true`, tick labels on the Y-axis will be hidden.",
      valueType: "boolean",
      defaultValue: defaultProps.hideTickY,
    },
    tickFormatterX: {
      description: "A function that formats the tick labels on the X-axis. ",
      defaultValue: JSON.stringify(defaultProps.tickFormatterX),
    },
    tickFormatterY: {
      description: "A function that formats the tick labels on the Y-axis. ",
      defaultValue: JSON.stringify(defaultProps.tickFormatterY),
    },
    showLegend: {
      description: "Determines whether the legend should be displayed.",
      valueType: "boolean",
      defaultValue: defaultProps.showLegend,
    },
  },
});

export const barChartComponentRenderer = createComponentRenderer(
  COMP,
  BarChartMd,
  ({ extractValue, node, className, lookupSyncCallback, renderChild }: any) => {
    return (
      <BarChart
        className={className}
        width={extractValue.asSize(node.props.width)}
        height={extractValue.asSize(node.props.height)}
        tickFormatterX={lookupSyncCallback(node.props?.tickFormatterX)}
        tickFormatterY={lookupSyncCallback(node.props?.tickFormatterY)}
        data={extractValue(node.props?.data)}
        layout={extractValue(node.props?.layout)}
        nameKey={extractValue(node.props?.nameKey)}
        dataKeys={extractValue(node.props?.dataKeys)}
        stacked={extractValue.asOptionalBoolean(node.props?.stacked)}
        hideX={extractValue.asOptionalBoolean(node.props?.hideX)}
        hideY={extractValue.asOptionalBoolean(node.props?.hideY)}
        hideTickX={extractValue.asOptionalBoolean(node.props?.hideTickX)}
        hideTickY={extractValue.asOptionalBoolean(node.props?.hideTickY)}
        showLegend={extractValue.asOptionalBoolean(node.props?.showLegend)}
      >
        {renderChild(node.children)}
      </BarChart>
    );
  },
);
