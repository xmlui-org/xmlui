import {CSSProperties, forwardRef} from "react";
import React, { Suspense, useMemo } from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import type { ApexOptions } from "apexcharts";
import styles from "./Chart.module.scss";
import { useColors } from "@components-core/utils/hooks";

const ApexChart = React.lazy(() => import("react-apexcharts"));

const defaultOptions: ApexOptions = {
  chart: {
    fontFamily: "inherit",
    sparkline: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
    animations: {
      enabled: false,
      dynamicAnimation: {
        enabled: true,
      },
      animateGradually: {
        enabled: true,
      },
      speed: 300,
    },
  },
  dataLabels: {
    enabled: false,
  },
  fill: {
    //--> area
    opacity: 0.16,
    type: "solid",
  },
  stroke: {
    // width: [2, 1],
    // dashArray: [0, 3],
    width: 2,
    lineCap: "round",
    curve: "smooth",
  },
  tooltip: {
    // --> should come from themes
    theme: "dark",
  },
  grid: {
    strokeDashArray: 4,
    padding: {
      // top: -20,
      right: 0,
      left: -4,
      bottom: -4,
    },
    xaxis: {
      lines: {
        show: true,
      },
    },
  },
  plotOptions: {
    bar: {
      columnWidth: "50%",
    },
  },
  xaxis: {
    labels: {
      // padding: 0,
    },
    tooltip: {
      enabled: false,
    },
    axisBorder: {
      show: false,
    },
    type: "datetime",
  },
  yaxis: {
    labels: {
      padding: 4,
    },
  },
  legend: {
    show: false,
  },
};

type ChartType =
  | "line"
  | "area"
  | "bar"
  | "pie"
  | "donut"
  | "radialBar"
  | "scatter"
  | "bubble"
  | "heatmap"
  | "candlestick"
  | "boxPlot"
  | "radar"
  | "polarArea"
  | "rangeBar"
  | "rangeArea"
  | "treemap";

type ChartProps = {
  type: ChartType;
  labels: string[];
  series: Array<{ name: string; data: any[] }>;
  style: CSSProperties;
  stacked?: boolean;
  showAxisLabels?: boolean;
  tooltipEnabled?: boolean;
  showLegend?: boolean;
};

const Chart = forwardRef(function Chart({
  type,
  labels,
  series,
  style,
  stacked,
  showAxisLabels = true,
  tooltipEnabled = true,
  showLegend = false,
}: ChartProps, ref) {
  const colors = useColors(
    {
      name: "color-primary-500",
      format: "hex",
    },
    {
      name: "color-primary-400",
      format: "hex",
    },
    {
      name: "color-primary-300",
      format: "hex",
    },
    {
      name: "color-primary-200",
      format: "hex",
    }
  );

  const { fill, ...restOptions } = defaultOptions;

  const options = useMemo(() => {
    let opts = {
      ...restOptions,
      chart: {
        ...restOptions.chart,
        stacked,
        sparkline: {
          enabled: !showAxisLabels,
        },
      },
      fill: type === "area" ? fill : {},
      tooltip: {
        ...defaultOptions.tooltip,
        enabled: tooltipEnabled,
      },
      colors: Object.values(colors),
      labels: labels || [],
      legend: {
        show: showLegend,
      },
    };
    if (!labels) {
      delete opts.xaxis;
    }
    return opts;
  }, [colors, fill, labels, restOptions, showAxisLabels, stacked, tooltipEnabled, type]);

  return (
    //   TODO illesg TEMP FLEX 1 STAR SIZING
    <div style={{ ...style }} className={styles.wrapper} ref={ref as any}>
      <Suspense>
        {!!series && <ApexChart options={options} type={type} series={series} height={"100%"} width={"100%"} />}
      </Suspense>
    </div>
  );
});

type ChartDef = ComponentDef<"Chart"> & {
  props: {
    type: string;
    labels: string;
    series: string;
    stacked: string;
    showAxisLabels: string;
    tooltipEnabled: string;
  };
};

export const chartRenderer = createComponentRenderer<ChartDef>(
  "Chart",
  ({ node, extractValue, lookupAction, layoutCss, registerComponentApi }) => {
    return (
      <Chart
        type={extractValue.asString(node.props.type) as ChartType}
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
