import { RadarChart, defaultProps } from "./RadarChartNative";
import { createComponentRenderer } from "../../../components-core/renderers";
import { createMetadata } from "../../metadata-helpers";
import { MemoizedItem } from "../../container-helpers";

const COMP = "RadarChart";

export const RadarChartMd = createMetadata({
  status: "experimental",
  description: "Interactive radar chart for displaying multivariate data in a two-dimensional chart of three or more quantitative variables",
  docFolder: "Charts/RadarChart",
  
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
    hideGrid: {
      description:
        "Determines whether the polar grid should be hidden. If set to `true`, the grid will not be rendered.",
      valueType: "boolean",
      defaultValue: defaultProps.hideGrid,
    },
    hideAngleAxis: {
      description:
        "Determines whether the angle axis should be hidden. If set to `true`, the angle axis will not be rendered.",
      valueType: "boolean",
      defaultValue: defaultProps.hideAngleAxis,
    },
    hideRadiusAxis: {
      description:
        "Determines whether the radius axis should be hidden. If set to `true`, the radius axis will not be rendered.",
      valueType: "boolean",
      defaultValue: defaultProps.hideRadiusAxis,
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
    filled: {
      description:
        "Determines whether the radar areas should be filled. If set to `true`, areas will be filled with color.",
      valueType: "boolean",
      defaultValue: defaultProps.filled,
    },
    strokeWidth: {
      description:
        "Sets the stroke width for the radar lines. Higher values create thicker lines.",
      valueType: "number",
      defaultValue: defaultProps.strokeWidth,
    },
    fillOpacity: {
      description:
        "Sets the fill opacity for the radar areas when filled is true. Value between 0 and 1.",
      valueType: "number",
      defaultValue: defaultProps.fillOpacity,
    },
    tooltipTemplate: {
      description: "This property allows replacing the default template to display a tooltip.",
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
export const radarChartComponentRenderer = createComponentRenderer(
  COMP,
  RadarChartMd,
  ({ extractValue, node, className, renderChild }: any) => {
    return (
      <RadarChart
        className={className}
        data={extractValue(node.props?.data)}
        nameKey={extractValue(node.props?.nameKey)}
        dataKeys={extractValue(node.props?.dataKeys)}
        hideGrid={extractValue.asOptionalBoolean(node.props?.hideGrid)}
        hideAngleAxis={extractValue.asOptionalBoolean(node.props?.hideAngleAxis)}
        hideRadiusAxis={extractValue.asOptionalBoolean(node.props?.hideRadiusAxis)}
        hideTooltip={extractValue.asOptionalBoolean(node.props?.hideTooltip)}
        showLegend={extractValue.asOptionalBoolean(node.props?.showLegend)}
        filled={extractValue.asOptionalBoolean(node.props?.filled)}
        strokeWidth={extractValue.asOptionalNumber(node.props?.strokeWidth)}
        fillOpacity={extractValue.asOptionalNumber(node.props?.fillOpacity)}
        tooltipRenderer={
          node.props.tooltipTemplate
            ? (tooltipData) => {
                return (
                  <MemoizedItem
                    node={node.props.tooltipTemplate}
                    item={tooltipData}
                    contextVars={{
                      $tooltip: tooltipData,
                    }}
                    renderChild={renderChild}
                  />
                );
              }
            : undefined
        }
      >
        {renderChild(node.children)}
      </RadarChart>
    );
  },
);
