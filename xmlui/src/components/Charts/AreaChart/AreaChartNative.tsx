import {
  AreaChart as RAreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend as RLegend,
} from "recharts";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";
import { TooltipContent } from "../Tooltip/TooltipContent";
import { useTheme } from "../../../components-core/theming/ThemeContext";

export type AreaChartProps = {
  data: any[];
  nameKey: string;
  dataKeys?: string[];
  style?: CSSProperties;
  hideTickX?: boolean;
  hideTickY?: boolean;
  hideX?: boolean;
  hideY?: boolean;
  hideTooltip?: boolean;
  tickFormatterX?: (value: any) => any;
  tickFormatterY?: (value: any) => any;
  children?: ReactNode;
  showLegend?: boolean;
  stacked?: boolean;
  curved?: boolean;
};

export const defaultProps: Pick<
  AreaChartProps,
  | "hideTickX"
  | "hideTickY"
  | "hideX"
  | "hideY"
  | "hideTooltip"
  | "tickFormatterX"
  | "tickFormatterY"
  | "showLegend"
  | "stacked"
  | "curved"
> = {
  hideTickX: false,
  hideTickY: false,
  hideX: false,
  hideY: false,
  hideTooltip: false,
  tickFormatterX: (value) => value,
  tickFormatterY: (value) => value,
  showLegend: false,
  stacked: false,
  curved: false,
};

export function AreaChart({
  data = [],
  nameKey,
  dataKeys = [],
  hideTickX = defaultProps.hideTickX,
  hideTickY = defaultProps.hideTickY,
  hideY = defaultProps.hideY,
  hideX = defaultProps.hideX,
  hideTooltip = defaultProps.hideTooltip,
  tickFormatterX = defaultProps.tickFormatterX,
  tickFormatterY = defaultProps.tickFormatterY,
  style,
  children,
  showLegend = defaultProps.showLegend,
  stacked = defaultProps.stacked,
  curved = defaultProps.curved,
}: AreaChartProps) {
  // Validate and normalize data
  const validData = Array.isArray(data) ? data : [];
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

  const chartContextValue = useChartContextValue({ dataKeys, nameKey });
  
  // Process data and create chart elements based on dataKeys
  const chartElements = useMemo(() => {
    return dataKeys.map((key, index) => {
      const color = colorValues[index % colorValues.length];
      
      return (
        <Area
          key={key}
          dataKey={key}
          fill={color}
          stroke={color}
          fillOpacity={0.6}
          strokeWidth={2}
          type={curved ? "monotone" : "linear"}
          stackId={stacked ? "1" : undefined}
        />
      );
    });
  }, [dataKeys, colorValues, curved, stacked]);

  // Handle responsive behavior
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Determine if we're in mini mode (very small container)
  const isMiniMode = containerSize.height < 150;

  return (
    <ChartProvider value={chartContextValue}>
      <div ref={containerRef} style={style}>
        <ResponsiveContainer width="100%" height="100%">
          <RAreaChart data={validData}>
            {!hideX && (
              <XAxis
                dataKey={nameKey}
                tick={!hideTickX}
                tickFormatter={tickFormatterX}
                hide={isMiniMode}
              />
            )}
            {!hideY && (
              <YAxis
                tick={!hideTickY}
                tickFormatter={tickFormatterY}
                hide={isMiniMode}
              />
            )}
            <CartesianGrid strokeDasharray="3 3" />
            {!hideTooltip && <Tooltip content={<TooltipContent />} />}
            {showLegend && !isMiniMode && <RLegend />}
            {chartElements}
            {children}
          </RAreaChart>
        </ResponsiveContainer>
      </div>
    </ChartProvider>
  );
}
