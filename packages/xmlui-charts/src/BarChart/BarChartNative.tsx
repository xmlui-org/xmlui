import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../utils/Chart";
import { useMemo } from "react";
import { useColors } from "xmlui";

export type BarChartProps = {
  data: any[];
  layout?: "horizontal" | "vertical";
  nameKey?: string;
  stacked?: boolean;
  dataKeys?: string[];
  style?: React.CSSProperties;
};

export function BarChart({
  data = [],
  layout = "vertical",
  nameKey,
  stacked = false,
  dataKeys = [],
  style,
}: BarChartProps) {
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
      ...dataKeys.map((key, index) => {
        return {
          [key]: {
            label: key,
            color: colorValues[index % colorValues.length],
          },
        };
      }),
    );
  }, [colors, dataKeys]);

  return (
    <ResponsiveContainer style={style}>
      <ChartContainer config={config}>
        <RBarChart accessibilityLayer data={data} layout={layout}>
          <CartesianGrid vertical={true} strokeDasharray="3 3" />
          {layout === "vertical" ? (
            <>
              <XAxis type="number" axisLine={false} />
              <YAxis
                dataKey={nameKey}
                type="category"
                interval={"equidistantPreserveStart"}
                tickLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={nameKey}
                type="category"
                interval={"equidistantPreserveStart"}
                tickLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis type="number" axisLine={false} />
            </>
          )}
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          {Object.keys(config).map((key, index) => (
            <Bar
              key={index}
              dataKey={key}
              fill={config[key].color}
              radius={stacked ? 0 : 8}
              stackId={stacked ? "stacked" : undefined}
            />
          ))}
        </RBarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}
