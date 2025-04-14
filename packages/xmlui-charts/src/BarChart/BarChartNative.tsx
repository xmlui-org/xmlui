import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend as RLegend,
} from "recharts";

import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { useTheme } from "xmlui";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";
import { TooltipContent } from "../Tooltip/TooltipContent";
import { generateColorPalette } from "../utils/colors";

export type BarChartProps = {
  data: any[];
  layout?: "horizontal" | "vertical";
  nameKey: string;
  stacked?: boolean;
  dataKeys?: string[];
  style?: CSSProperties;
  hideTickX?: boolean;
  hideTickY?: boolean;
  hideX?: boolean;
  hideY?: boolean;
  tickFormatter?: (value: any) => any;
  children?: ReactNode;
  showLegend?: boolean;
};

export const defaultProps: Pick<
  BarChartProps,
  | "layout"
  | "stacked"
  | "hideTickX"
  | "hideTickY"
  | "hideX"
  | "hideY"
  | "tickFormatter"
  | "showLegend"
> = {
  layout: "vertical",
  stacked: false,
  hideTickX: false,
  hideTickY: false,
  hideX: false,
  hideY: false,
  tickFormatter: (value) => value,
  showLegend: false,
};

export function BarChart({
  data = [],
  layout = defaultProps.layout,
  nameKey,
  stacked = defaultProps.stacked,
  dataKeys = [],
  hideTickX = defaultProps.hideTickX,
  hideTickY = defaultProps.hideTickY,
  hideY = defaultProps.hideY,
  hideX = defaultProps.hideX,
  tickFormatter = defaultProps.tickFormatter,
  style,
  children,
  showLegend = defaultProps.showLegend,
}: BarChartProps) {

  const colorValues = useMemo(() => {
    return generateColorPalette({
      count: data?.length || 1,
    });
  }, [data]);

  const config = useMemo(() => {
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
  }, [colorValues, dataKeys]);

  const chartContextValue = useChartContextValue({ dataKeys, nameKey });

  return (
    <ChartProvider value={chartContextValue}>
      {children}
      <ResponsiveContainer style={style}>
        <RBarChart
          accessibilityLayer
          data={data}
          layout={layout}
          margin={{ left: 10, top: 0, bottom: 0, right: 10 }}
        >
          <CartesianGrid vertical={true} strokeDasharray="3 3" />
          {layout === "vertical" ? (
            <>
              <XAxis type="number" axisLine={false} hide={hideX} tick={{ fill: "currentColor" }} />
              <YAxis
                hide={hideY}
                dataKey={nameKey}
                type="category"
                interval={"equidistantPreserveStart"}
                tickLine={false}
                tickFormatter={tickFormatter}
                tick={{ fill: "currentColor" }}
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
                height={hideX ? 0 : 30}
                hide={hideX}
                tick={!hideTickX && { fill: "currentColor" }}
              />
              <YAxis
                type="number"
                axisLine={false}
                tick={!hideTickY && { fill: "currentColor" }}
                hide={hideY}
                width={hideY ? 0 : 60}
              />
            </>
          )}
          <Tooltip content={<TooltipContent />} />
          {Object.keys(config).map((key, index) => (
            <Bar
              key={index}
              dataKey={key}
              fill={config[key].color}
              radius={stacked ? 0 : 8}
              stackId={stacked ? "stacked" : undefined}
            />
          ))}
          {chartContextValue.legend ? chartContextValue.legend : showLegend && <RLegend />}
        </RBarChart>
      </ResponsiveContainer>
    </ChartProvider>
  );
}
