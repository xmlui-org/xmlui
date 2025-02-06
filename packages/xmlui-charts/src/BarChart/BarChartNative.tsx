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
  indexBy?: string;
  stacked?: boolean;
  bars?: {
    key: string;
    color?: string;
    label?: string;
  }[];
  style?: React.CSSProperties;
};

export function BarChart({
  data = [],
  layout = "vertical",
  indexBy,
  stacked = false,
  bars = [],
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
    <ResponsiveContainer style={style}>
      <ChartContainer config={config}>
        <RBarChart accessibilityLayer data={data} layout={layout}>
          <CartesianGrid vertical={true} strokeDasharray="3 3" />
          {layout === "vertical" ? (
            <>
              <XAxis type="number" axisLine={false} />
              <YAxis
                dataKey={indexBy}
                type="category"
                interval={"equidistantPreserveStart"}
                tickLine={false}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={indexBy}
                type="category"
                interval={"equidistantPreserveStart"}
                tickLine={false}
              />
              <YAxis type="number" axisLine={false} />
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
              stackId={stacked ? "stacked" : undefined}
            />
          ))}
        </RBarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}
