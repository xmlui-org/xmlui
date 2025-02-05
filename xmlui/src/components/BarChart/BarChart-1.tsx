import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer} from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./Chart";
import { useMemo } from "react";
import { useColors } from "@components-core/utils/hooks";

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
  style?: React.CSSProperties;
};

export default function Barchart1({
  data = [],
  orientation = "horizontal",
  indexBy,
  stacked = false,
  bars = [],
  style,
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
      <ResponsiveContainer style={style}>
        <ChartContainer config={config}>
          <BarChart
              accessibilityLayer
              data={data}
              layout={orientation}
              margin={{
                left: -25,
              }}
          >
            <CartesianGrid vertical={true} strokeDasharray="3 3" />
            {orientation === "horizontal" ? (
                <>
                  <XAxis
                      type="category"
                      dataKey={indexBy}
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      allowDataOverflow={false}
                  />
                  <YAxis />
                </>
            ) : (
                <>
                  <XAxis />
                  <YAxis
                      allowDataOverflow={false}
                      dataKey={"label"}
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
      </ResponsiveContainer>
  );
}
