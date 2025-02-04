"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./Chart";
import { Suspense, useMemo } from "react";
import { useColors } from "@components-core/utils/hooks";

export const description = "A bar chart";

export type BarChart1Props = {
  data: any[];
  orientation?: "horizontal" | "vertical";
  indexBy?: string;
  stacked?: boolean;
  bars?: {
    key: string;
    color?: string;
    label?: string;
  }[];
};

export default function Barchart1({
  data = [],
  orientation = "horizontal",
  indexBy,
  stacked = false,
  bars = [],
}: BarChart1Props) {
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
    },
  );

  const config = useMemo(() => {
    const colorValues = Object.values(colors);
    return Object.assign(
      {},
      ...bars.map((bar, index) => {
        return {
          [bar.key]: {
            label: bar.label,
            color: bar.color || colorValues[index % colorValues.length],
          },
        };
      }),
    );
  }, [colors, bars]);

  return (
    <Suspense fallback={<span>Loading...</span>}>
      <ChartContainer config={config}>
        <BarChart
          accessibilityLayer
          data={data}
          layout={orientation}
          margin={{
            left: -25,
          }}
        >
          <CartesianGrid vertical={true} strokeDasharray="4 4" />
          {orientation === "horizontal" ? (
            <>
              <XAxis
                type="category"
                dataKey={"label"}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                allowDataOverflow={false}
              />
              <YAxis
                type="number"
                dataKey="web"
                axisLine={false}
                tickLine={false}
                allowDataOverflow={false}
              />
            </>
          ) : (
            <>
              <XAxis type="number" dataKey="desktop" />
              <YAxis
                allowDataOverflow={false}
                dataKey={indexBy}
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
            </>
          )}
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          {Object.keys(config).map((key, index) => (
            <Bar
              key={index}
              label={config[key].label}
              dataKey={key}
              fill={config[key].color}
              radius={stacked ? 0 : 8}
              stackId={stacked && "stacked"}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </Suspense>
  );
}
