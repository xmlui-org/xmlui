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
import { useTheme } from "../../../components-core/theming/ThemeContext";

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
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
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
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
}: LineChartProps) {
  const { getThemeVar } = useTheme();

  const colorValues = useMemo(() => {
    return [
      getThemeVar("color-primary-500"),
      getThemeVar("color-primary-300"),
      getThemeVar("color-success-500"),
      getThemeVar("color-success-300"),
      getThemeVar("color-warn-500"),
      getThemeVar("color-warn-300"),
      getThemeVar("color-danger-500"),
      getThemeVar("color-danger-300"),
      getThemeVar("color-info-500"),
      getThemeVar("color-info-300"),
      getThemeVar("color-secondary-500"),
      getThemeVar("color-secondary-300"),
      getThemeVar("color-primary-600"),
      getThemeVar("color-primary-400"),
      getThemeVar("color-success-600"),
      getThemeVar("color-success-400"),
      getThemeVar("color-warn-600"),
      getThemeVar("color-warn-400"),
      getThemeVar("color-danger-600"),
      getThemeVar("color-danger-400"),
      getThemeVar("color-info-600"),
      getThemeVar("color-info-400"),
      getThemeVar("color-secondary-600"),
      getThemeVar("color-secondary-400"),
      getThemeVar("color-primary-900"),
      getThemeVar("color-primary-700"),
      getThemeVar("color-success-900"),
      getThemeVar("color-success-700"),
      getThemeVar("color-warn-900"),
      getThemeVar("color-warn-700"),
      getThemeVar("color-danger-900"),
      getThemeVar("color-danger-700"),
      getThemeVar("color-info-900"),
      getThemeVar("color-info-700"),
      getThemeVar("color-secondary-900"),
      getThemeVar("color-secondary-700"),
    ];
  }, [getThemeVar]);

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
      <div
        style={{
          flexGrow: 1,
          minHeight: 0,
          width: style.width || "100%",
          height: style.height || "100%",
        }}
      >
        <ResponsiveContainer style={style} width="100%" height="100%">
          <RLineChart
            accessibilityLayer
            data={data}
            margin={{ top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft }}
          >
            <XAxis
              interval="preserveEnd"
              dataKey={nameKey}
              tickLine={false}
              hide={hideX}
              axisLine={false}
              tick={{ fill: "currentColor" }}
              tickFormatter={tickFormatter}
              minTickGap={5}
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
      </div>
    </ChartProvider>
  );
}
