import {
  Line,
  LineChart as RLineChart,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Legend as RLegend,
} from "recharts";
import type { ReactNode } from "react";
import type React from "react";
import { useMemo } from "react";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";
import { TooltipContent } from "../Tooltip/TooltipContent";
import { useTheme } from "xmlui";
import { generateColorPalette } from "../utils/colors";

export type LineChartProps = {
  data: any[];
  dataKeys: string[];
  nameKey: string;
  style?: React.CSSProperties;
  hideX?: boolean;
  hideTooltip?: boolean;
  tickFormatter?: (value: any) => any;
  children?: ReactNode;
  showLegend?: boolean;
};

export const defaultProps: Pick<LineChartProps, "hideX" | "hideTooltip" | "showLegend"> = {
  hideX: false,
  hideTooltip: false,
  showLegend: false,
};

export function LineChart({
  data,
  dataKeys = [],
  nameKey,
  style,
  hideX = false,
  hideTooltip = false,
  tickFormatter,
  children,
  showLegend = false,
}: LineChartProps) {
  const { getThemeVar } = useTheme();

  const colorValues = useMemo(() => {
    const baseColors = [
      getThemeVar("color-primary-500"),
      getThemeVar("color-primary-400"),
      getThemeVar("color-primary-300"),
      getThemeVar("color-primary-200"),
    ] as any;

    return generateColorPalette({
      count: data?.length || 1,
      baseColors,
    });
  }, [data, getThemeVar]);

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

  const chartContextValue = useChartContextValue({ nameKey, dataKeys });

  return (
    <ChartProvider value={chartContextValue}>
      {children}
      <ResponsiveContainer style={style}>
        <RLineChart accessibilityLayer data={data}>
          <XAxis
            interval="preserveStartEnd"
            dataKey={nameKey}
            tickLine={false}
            hide={hideX}
            axisLine={false}
            tick={{ fill: "currentColor" }}
            tickFormatter={tickFormatter}
          />
          {!hideTooltip && <Tooltip content={<TooltipContent />} />}
          {Object.keys(config).map((key, index) => (
            <Line
              key={index}
              dataKey={key}
              type="monotone"
              stroke={config[key].color}
              dot={false}
            />
          ))}
          {chartContextValue.legend ? chartContextValue.legend : showLegend && <RLegend />}
        </RLineChart>
      </ResponsiveContainer>
    </ChartProvider>
  );
}
