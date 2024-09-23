import React, { type CSSProperties, Suspense } from "react";

import { useTheme } from "@components-core/theming/ThemeContext";
import colorSchemes from "@components/chart-color-schemes";
import { useColors } from "@components-core/utils/hooks";

const ResponsiveBar = React.lazy(() =>
  import("@nivo/bar").then((module) => ({ default: module.ResponsiveBar })),
);

type BarChartProps = {
  data: any[];
  keys: string[];
  groupMode?: "stacked" | "grouped";
  layout?: "horizontal" | "vertical";
  indexBy?: string;
  style?: CSSProperties;
};

export const BarChart = ({
  data,
  keys = [],
  groupMode = "grouped",
  layout = "vertical",
  indexBy = "id",
  style,
}: BarChartProps) => {
  console.log(keys, data);

  const { getThemeVar } = useTheme();

  const colors = useColors(
    {
      name: "color-text-BarChart",
      format: "hex",
    },
    {
      name: "color-ticks-BarChart",
      format: "hex",
    },
    {
      name: "color-bg-tooltip-BarChart",
      format: "hex",
    },
    {
      name: "color-text-tooltip-BarChart",
      format: "hex",
    },
    {
      name: "color-axis-BarChart",
      format: "hex",
    },
  );

  return (
    <div style={style}>
      <Suspense>
        <ResponsiveBar
          data={data}
          keys={keys}
          layout={layout}
          groupMode={groupMode}
          theme={{
            background: "transparent",
            text: {
              fontSize: 11,
              fill: colors["color-text-BarChart"],
              outlineWidth: 0,
              outlineColor: "transparent",
            },
            axis: {
              domain: {
                line: {
                  stroke: colors["color-axis-BarChart"],
                  strokeWidth: 1,
                },
              },
              legend: {
                text: {
                  fontSize: 12,
                  fill: colors["border-color-BarChart"],
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
                  fill: colors["color-ticks-BarChart"],
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
            legends: {
              title: {
                text: {
                  fontSize: 11,
                  fill: "#333333",
                  outlineWidth: 0,
                  outlineColor: "transparent",
                },
              },
              text: {
                fontSize: 11,
                fill: "#333333",
                outlineWidth: 0,
                outlineColor: "transparent",
              },
              ticks: {
                line: {},
                text: {
                  fontSize: 10,
                  fill: "#333333",
                  outlineWidth: 0,
                  outlineColor: "transparent",
                },
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
                background: colors["color-bg-tooltip-BarChart"],
                color: colors["color-text-tooltip-BarChart"],
                fontSize: 12,
              },
              basic: {},
              chip: {},
              table: {},
              tableCell: {},
              tableCellValue: {},
            },
          }}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          indexBy={indexBy}
          margin={{ top: 10, bottom: 40, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: colorSchemes[getThemeVar("scheme-BarChart") || "nivo"] }}
          axisTop={null}
          axisRight={null}
          labelSkipWidth={12}
          labelSkipHeight={12}
          role="application"
        />
      </Suspense>
    </div>
  );
};
