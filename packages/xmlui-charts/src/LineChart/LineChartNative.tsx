import { CartesianGrid, Line, LineChart as RLineChart, XAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../utils/Chart";
import { useColors } from "xmlui";
import { useMemo } from "react";

export type LineChartProps = {
  data: any[];
  dataKey: string;
  nameKey: string;
  style?: React.CSSProperties;
};

export function LineChart({ data, dataKey, nameKey, style }: LineChartProps) {
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

  const chartConfig = useMemo<any>(() => {
    return {
      [nameKey]: {
        label: nameKey,
      },
    };
  }, [nameKey]);

  return (
    <ResponsiveContainer style={style}>
      <ChartContainer config={chartConfig}>
        <RLineChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            interval="preserveStartEnd"
            dataKey={nameKey}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Line dataKey={dataKey} type="monotone" stroke={colors[0]} dot={false} />
        </RLineChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}
