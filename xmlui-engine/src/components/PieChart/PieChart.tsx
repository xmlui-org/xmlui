import React, { CSSProperties, Suspense, useMemo } from "react";
import { createComponentRenderer } from "@components-core/renderers";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import styles from "./PieChart.module.scss";
import { parseScssVar } from "@components-core/theming/themeVars";
import { useTheme } from "@components-core/theming/ThemeContext";
import colorSchemes from "@components/chart-color-schemes";
import classnames from "classnames";
import { useColors } from "@components-core/utils/hooks";

const ResponsivePie = React.lazy(() => import("@nivo/pie").then((module) => ({ default: module.ResponsivePie })));

type PieChartData = {
  id: string;
  label: string;
  value: number;
};

type PieChartProps = {
  data: PieChartData[];
  style?: CSSProperties;
  isInteractive?: boolean;
  showLabels?: boolean;
  showLegends?: boolean;
  legendPosition?: "top" | "right" | "bottom" | "left";
  legendDirection?: "row" | "column";
};

const PieChart = ({
  data = [],
  isInteractive = true,
  style,
  showLabels = false,
  showLegends = true,
  legendPosition = "bottom",
  legendDirection = "row",
}: PieChartProps) => {
  const { getThemeVar } = useTheme();
  const [customLegendData, setCustomLegendData] = React.useState<any>([]);

  const colors = useColors(
    {
      name: "color-text-PieChart",
      format: "hex",
    },
    {
      name: "color-ticks-PieChart",
      format: "hex",
    },
    {
      name: "color-bg-tooltip-PieChart",
      format: "hex",
    },
    {
      name: "color-text-tooltip-PieChart",
      format: "hex",
    },
    {
      name: "color-axis-PieChart",
      format: "hex",
    },
    {
      name: "color-text-legend-PieChart",
      format: "hex",
    }
  );

  const pieChart = useMemo(
    () => (
      <ResponsivePie
        fit={true}
        data={data}
        colors={{ scheme: colorSchemes[getThemeVar("scheme-PieChart")!!] }}
        margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
        forwardLegendData={setCustomLegendData}
        theme={{
          background: "transparent",
          text: {
            fontSize: 11,
            fill: colors["color-text-PieChart"],
            outlineWidth: 0,
            outlineColor: "transparent",
          },
          axis: {
            domain: {
              line: {
                stroke: colors["color-axis-PieChart"],
                strokeWidth: 1,
              },
            },
            legend: {
              text: {
                fontSize: 12,
                fill: colors["color-text-legend-PieChart"],
                outlineWidth: 0,
                outlineColor: "transparent",
              },
            },
            ticks: {
              line: {
                stroke: "#777777",
                strokeWidth: 1,
              },
              text: {
                fontSize: 11,
                fill: colors["color-ticks-PieChart"],
                outlineWidth: 0,
                outlineColor: "transparent",
              },
            },
          },
          grid: {
            line: {
              stroke: "#dddddd",
              strokeWidth: 1,
            },
          },
          annotations: {
            text: {
              fontSize: 13,
              fill: "#333333",
              outlineWidth: 2,
              outlineColor: "#ffffff",
              outlineOpacity: 1,
            },
            link: {
              stroke: "#000000",
              strokeWidth: 1,
              outlineWidth: 2,
              outlineColor: "#ffffff",
              outlineOpacity: 1,
            },
            outline: {
              stroke: "#000000",
              strokeWidth: 2,
              outlineWidth: 2,
              outlineColor: "#ffffff",
              outlineOpacity: 1,
            },
            symbol: {
              fill: "#000000",
              outlineWidth: 2,
              outlineColor: "#ffffff",
              outlineOpacity: 1,
            },
          },
          tooltip: {
            wrapper: {},
            container: {
              background: colors["color-bg-tooltip-PieChart"],
              color: colors["color-text-tooltip-PieChart"],
              fontSize: 12,
            },
            basic: {},
            chip: {},
            table: {},
            tableCell: {},
            tableCellValue: {},
          },
        }}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        enableArcLinkLabels={showLabels}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsThickness={2}
        arcLabelsSkipAngle={10}
        isInteractive={isInteractive}
      />
    ),
    [showLegends, data, colors, isInteractive, legendPosition, legendDirection]
  );

  return (
    <Suspense>
      <div style={{ ...style }}>
        <div
          className={classnames(styles.chart, {
            [styles.legendTop]: legendPosition === "top",
            [styles.legendRight]: legendPosition === "right",
            [styles.legendBottom]: legendPosition === "bottom",
            [styles.legendLeft]: legendPosition === "left",
          })}
        >
          <div className={styles.wrapper}>
            <div className={styles.chartContainer}>{pieChart}</div>
          </div>
          {showLegends && (
            <div
              className={classnames(styles.legends, {
                [styles.legendRow]: legendDirection === "row",
                [styles.legendColumn]: legendDirection === "column",
              })}
            >
              {customLegendData.map((item: any, i: number) => (
                <div key={i} className={styles.legendItem}>
                  <div className={styles.legendBullet} style={{ backgroundColor: item.color }} />
                  <div className={styles.legendLabel}>{item.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
};

interface PieChartDef extends ComponentDef<"PieChart"> {
  props: {
    data: PieChartData[];
    isInteractive?: boolean;
    showLabels?: boolean;
    showLegends?: boolean;
    legendPosition?: "top" | "right" | "bottom" | "left";
    legendDirection?: "row" | "column";
  };
}

const metadata: ComponentDescriptor<PieChartDef> = {
  displayName: "PieChart",
  description: "A pie chart component",
  props: {
    data: desc("The data to be displayed in the pie chart"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "scheme-PieChart": "nivo",
    "color-text-PieChart": "$color-text-secondary",
    "color-ticks-PieChart": "$color-text-primary",
    "color-bg-tooltip-PieChart": "$color-bg-primary",
    "color-text-tooltip-PieChart": "$color-text-primary",
    "color-axis-PieChart": "$color-text-primary",
    "color-text-legend-PieChart": "$color-text-primary",
    light: {
      "scheme-PieChart": "set3",
    },
    dark: {
      "scheme-PieChart": "dark2",
    },
  },
};

export const pieChartComponentRenderer = createComponentRenderer<PieChartDef>(
  "PieChart",
  ({ extractValue, node, layoutCss }) => {
    return (
      <PieChart
        data={extractValue(node.props?.data)}
        isInteractive={extractValue.asOptionalBoolean(node.props?.isInteractive)}
        showLabels={extractValue.asOptionalBoolean(node.props?.showLabels)}
        style={layoutCss}
        showLegends={extractValue.asOptionalBoolean(node.props?.showLegends)}
        legendPosition={extractValue(node.props?.legendPosition)}
        legendDirection={extractValue(node.props?.legendDirection)}
      />
    );
  },
  metadata
);
