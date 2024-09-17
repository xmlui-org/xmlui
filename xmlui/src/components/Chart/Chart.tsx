import { createMetadata, d, } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { Chart } from "./ChartNative";


const COMP = "Chart";

export const ChartMd = createMetadata({
  description: "(*** OBSOLETE ***) A chart component",
  props: {
    type: d("(*** OBSOLETE ***)"),
    labels: d("(*** OBSOLETE ***)"),
    series: d("(*** OBSOLETE ***)"),
    stacked: d("(*** OBSOLETE ***)"),
    showAxisLabels: d("(*** OBSOLETE ***)"),
    tooltipEnabled: d("(*** OBSOLETE ***)"),
    showLegend: d("(*** OBSOLETE ***)"),
  }
});

export const chartRenderer = createComponentRenderer(
  COMP,
  ChartMd,
  ({ node, extractValue, lookupAction, layoutCss, registerComponentApi }) => {
    return (
      <Chart
        type={extractValue.asString(node.props.type) as any}
        labels={extractValue(node.props.labels)}
        series={extractValue(node.props.series)}
        style={layoutCss}
        showLegend={extractValue.asOptionalBoolean(node.props.showLegend)}
        stacked={extractValue.asOptionalBoolean(node.props.stacked)}
        showAxisLabels={extractValue.asOptionalBoolean(node.props.showAxisLabels)}
        tooltipEnabled={extractValue.asOptionalBoolean(node.props.tooltipEnabled)}
      />
    );
  }
);
