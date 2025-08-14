import { AreaChart, defaultProps } from "./AreaChartNative";
import { createComponentRenderer } from "../../../components-core/renderers";
import { createMetadata } from "../../metadata-helpers";

const COMP = "AreaChart";

export const AreaChartMd = createMetadata({
  status: "experimental",
  description: "Interactive area chart for showing data trends over time with filled areas under the curve",
  docFolder: "Charts/AreaChart",
  
  props: {
    data: {
      description:
        "This property is used to provide the component with data to display. " +
        "The data needs to be an array of objects.",
    },
    dataKeys: {
      description:
        "This property specifies the keys in the data objects that should be used for rendering the chart elements. " +
        "E.g. 'value' or 'amount'.",
      valueType: "string",
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
        "Determines whether the X-axis tick labels should be hidden. If set to `true`, the tick labels will not be rendered.",
      valueType: "boolean",
      defaultValue: defaultProps.hideTickX,
    },
    hideTickY: {
      description:
        "Determines whether the Y-axis tick labels should be hidden. If set to `true`, the tick labels will not be rendered.",
      valueType: "boolean",
      defaultValue: defaultProps.hideTickY,
    },
    hideTooltip: {
      description:
        "Determines whether the tooltip should be hidden. If set to `true`, the tooltip will not be rendered.",
      valueType: "boolean",
      defaultValue: defaultProps.hideTooltip,
    },
    showLegend: {
      description:
        "Determines whether the legend should be shown. If set to `true`, the legend will be rendered.",
      valueType: "boolean",
      defaultValue: defaultProps.showLegend,
    },
    stacked: {
      description:
        "Determines whether multiple areas should be stacked on top of each other. If set to `true`, areas will be stacked.",
      valueType: "boolean",
      defaultValue: defaultProps.stacked,
    },
    curved: {
      description:
        "Determines whether the area lines should be curved (smooth) or straight. If set to `true`, lines will be curved.",
      valueType: "boolean",
      defaultValue: defaultProps.curved,
    },
  },
  
  events: {
    // Standard chart events - customize based on chart type
  },
  
  apis: {
    // Chart-specific APIs if needed
  },
  
  contextVars: {
    // Add context variables if needed
  },
});

// Component renderer
export const areaChartComponentRenderer = createComponentRenderer(
  COMP,
  AreaChartMd,
  ({ extractValue, node, layoutCss, lookupSyncCallback, renderChild }: any) => {
    return (
      <AreaChart
        style={layoutCss}
        tickFormatterX={lookupSyncCallback(node.props?.tickFormatterX)}
        tickFormatterY={lookupSyncCallback(node.props?.tickFormatterY)}
        data={extractValue(node.props?.data)}
        nameKey={extractValue(node.props?.nameKey)}
        dataKeys={extractValue(node.props?.dataKeys)}
        hideX={extractValue.asOptionalBoolean(node.props?.hideX)}
        hideY={extractValue.asOptionalBoolean(node.props?.hideY)}
        hideTickX={extractValue.asOptionalBoolean(node.props?.hideTickX)}
        hideTickY={extractValue.asOptionalBoolean(node.props?.hideTickY)}
        hideTooltip={extractValue.asOptionalBoolean(node.props?.hideTooltip)}
        showLegend={extractValue.asOptionalBoolean(node.props?.showLegend)}
        stacked={extractValue.asOptionalBoolean(node.props?.stacked)}
        curved={extractValue.asOptionalBoolean(node.props?.curved)}
      >
        {renderChild(node.children)}
      </AreaChart>
    );
  },
);
