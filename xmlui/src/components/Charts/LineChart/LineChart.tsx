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
    hideTooltip: {
      description:
        "Determines whether the tooltip should be hidden." +
        "If set to (`true`), no tooltip will be shown when hovering over data points.",
      valueType: "boolean",
      defaultValue: defaultProps.hideTooltip,
    },
    tickFormatter: {
      description:
        "A function that formats the axis tick labels. It receives a tick value and returns a formatted string.",
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
  ({ extractValue, node, className, lookupSyncCallback, renderChild }: any) => {
    return (
      <LineChart
        tickFormatter={lookupSyncCallback(node.props?.tickFormatter)}
        data={extractValue(node.props?.data)}
        className={className}
        dataKeys={extractValue(node.props?.dataKeys)}
        nameKey={extractValue(node.props?.nameKey)}
        hideX={extractValue(node.props?.hideX)}
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
