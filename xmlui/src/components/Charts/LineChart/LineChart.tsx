import { defaultProps, LineChart } from "./LineChartNative";
import { createComponentRenderer } from "../../../components-core/renderers";
import { createMetadata, d } from "../../metadata-helpers";

const COMP = "LineChart";

export const LineChartMd = createMetadata({
  status: "experimental",
  description:
    "`LineChart` displays data as connected points over a continuous axis, ideal " +
    "for showing trends, changes over time, or relationships between variables. " +
    "Use it time series data, progress tracking, and comparing multiple data " +
    "series on the same scale.",
  docFolder: "Charts/LineChart",
  props: {
    data: {
      description:
        "The data to be displayed in the line chart." +
        "It needs to be an array of objects, where each object represents a data point.",
    },
    dataKeys: {
      description:
        "This property specifies the keys in the data objects that should be used for rendering the lines.",
      valueType: "string",
    },
    nameKey: {
      description: "The key in the data objects used for labeling different data series.",
      valueType: "string",
    },
    hideX: {
      description:
        "Determines whether the X-axis should be hidden. If set to (`true`), the axis will not be displayed.",
      valueType: "boolean",
      defaultValue: defaultProps.hideX,
    },
    hideY: {
      description:
        "Determines whether the Y-axis should be hidden. If set to (`true`), the axis will not be displayed.",
      valueType: "boolean",
      defaultValue: defaultProps.hideY,
    },
    hideTickX: {
      description:
        "Determines whether the X-axis ticks should be hidden. If set to (`true`), the ticks will not be displayed.",
      valueType: "boolean",
      defaultValue: defaultProps.hideTickX,
    },
    hideTickY: {
      description:
        "Determines whether the Y-axis ticks should be hidden. If set to (`true`), the ticks will not be displayed.",
      valueType: "boolean",
      defaultValue: defaultProps.hideTickY,
    },
    hideTooltip: {
      description:
        "Determines whether the tooltip should be hidden." +
        "If set to (`true`), no tooltip will be shown when hovering over data points.",
      valueType: "boolean",
      defaultValue: defaultProps.hideTooltip,
    },
    tickFormatterX: {
      description:
        "A function that formats the X-axis tick labels. It receives a tick value and returns a formatted string.",
    },
    tickFormatterY: {
      description:
        "A function that formats the Y-axis tick labels. It receives a tick value and returns a formatted string.",
    },
    showLegend: {
      description: "Determines whether the legend should be displayed.",
      valueType: "boolean",
      defaultValue: defaultProps.showLegend,
    },
    marginTop: d("The top margin of the chart"),
    marginRight: d("The right margin of the chart"),
    marginBottom: d("The bottom margin of the chart"),
    marginLeft: d("The left margin of the chart"),
  },
});

export const lineChartComponentRenderer = createComponentRenderer(
  COMP,
  LineChartMd,
  ({ extractValue, node, layoutCss, lookupSyncCallback, renderChild }: any) => {
    return (
      <LineChart
        tickFormatterX={lookupSyncCallback(node.props?.tickFormatterX)}
        tickFormatterY={lookupSyncCallback(node.props?.tickFormatterY)}
        hideTickX={extractValue(node.props?.hideTickX)}
        hideTickY={extractValue(node.props?.hideTickY)}
        data={extractValue(node.props?.data)}
        style={layoutCss}
        dataKeys={extractValue(node.props?.dataKeys)}
        nameKey={extractValue(node.props?.nameKey)}
        hideX={extractValue(node.props?.hideX)}
        hideY={extractValue(node.props?.hideY)}
        hideTooltip={extractValue(node.props?.hideTooltip)}
        showLegend={extractValue.asOptionalBoolean(node.props?.showLegend)}
        marginTop={extractValue.asOptionalNumber(node.props?.marginTop)}
        marginRight={extractValue.asOptionalNumber(node.props?.marginRight)}
        marginBottom={extractValue.asOptionalNumber(node.props?.marginBottom)}
        marginLeft={extractValue.asOptionalNumber(node.props?.marginLeft)}
      >
        {renderChild(node.children)}
      </LineChart>
    );
  },
);
