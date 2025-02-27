import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

import { useMemo } from "react";
import { useColors } from "xmlui";

export type BarChartProps = {
  data: any[];
  layout?: "horizontal" | "vertical";
  nameKey?: string;
  stacked?: boolean;
  dataKeys?: string[];
  style?: React.CSSProperties;
  hideTickX?: boolean;
  hideTickY?: boolean;
  hideX?: boolean;
  hideY?: boolean;
  tickFormatter?: (value: any) => any;
};

export function BarChart({
  data = [],
  layout = "vertical",
  nameKey,
  stacked = false,
  dataKeys = [],
  hideTickX = false,
  hideTickY = false,
  hideY = false,
  hideX = false,
  tickFormatter = (value) => value,
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
      <RBarChart
        accessibilityLayer
        data={data}
        layout={layout}
        margin={{ left: 10, top: 0, bottom: 0, right: 10 }}
      >
        <Legend />
        <CartesianGrid vertical={true} strokeDasharray="3 3" />
        {layout === "vertical" ? (
          <>
            <XAxis type="number" axisLine={false} hide={hideX} />
            <YAxis
              hide={hideY}
              dataKey={nameKey}
              type="category"
              interval={"equidistantPreserveStart"}
              tickLine={false}
              tickFormatter={tickFormatter}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={nameKey}
              type="category"
              interval={"equidistantPreserveStart"}
              tickLine={false}
              tickFormatter={tickFormatter}
              tick={!hideTickX}
              height={hideX ? 0 : 30}
              hide={hideX}
            />
            <YAxis
              type="number"
              axisLine={false}
              tick={!hideTickY}
              hide={hideY}
              width={hideY ? 0 : 60}
            />
          </>
        )}
        <Tooltip />
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
    </ResponsiveContainer>
  );
}
