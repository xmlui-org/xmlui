import {
  RadarChart as RRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend as RLegend,
} from "recharts";

import type { ReactNode, ForwardedRef, HTMLAttributes, MutableRefObject } from "react";
import { useEffect, useRef, useState, useCallback, forwardRef, memo, useMemo } from "react";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";
import { TooltipContent } from "../Tooltip/TooltipContent";
import { useTheme } from "xmlui";

export type RadarChartProps = Omit<HTMLAttributes<HTMLDivElement>, "data"> & {
  data: any[];
  nameKey: string;
  dataKeys?: string[];
  className?: string;
  hideGrid?: boolean;
  hideAngleAxis?: boolean;
  hideRadiusAxis?: boolean;
  hideTooltip?: boolean;
  children?: ReactNode;
  showLegend?: boolean;
  filled?: boolean;
  strokeWidth?: number;
  fillOpacity?: number;
  tooltipRenderer?: (tooltipData: any) => ReactNode;
};

export const defaultProps: Pick<
  RadarChartProps,
  | "hideGrid"
  | "hideAngleAxis"
  | "hideRadiusAxis"
  | "hideTooltip"
  | "showLegend"
  | "filled"
  | "strokeWidth"
  | "fillOpacity"
> = {
  hideGrid: false,
  hideAngleAxis: false,
  hideRadiusAxis: false,
  hideTooltip: false,
  showLegend: false,
  filled: true,
  strokeWidth: 2,
  fillOpacity: 0.3,
};

export const RadarChart = memo(
  forwardRef(function RadarChart({
  data = [],
  nameKey,
  dataKeys = [],
  hideGrid = defaultProps.hideGrid,
  hideAngleAxis = defaultProps.hideAngleAxis,
  hideRadiusAxis = defaultProps.hideRadiusAxis,
  hideTooltip = defaultProps.hideTooltip,
  className,
  children,
  showLegend = defaultProps.showLegend,
  filled = defaultProps.filled,
  strokeWidth = defaultProps.strokeWidth,
  fillOpacity = defaultProps.fillOpacity,
  tooltipRenderer,
  style,
  ...rest
}: RadarChartProps, ref: ForwardedRef<HTMLDivElement>) {
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
  
  // Process data and create radar elements based on dataKeys
  const radarElements = useMemo(() => {
    return dataKeys.map((key, index) => {
      const color = colorValues[index % colorValues.length];
      
      return (
        <Radar
          key={key}
          name={key}
          dataKey={key}
          stroke={color}
          fill={filled ? color : "none"}
          fillOpacity={filled ? fillOpacity : 0}
          strokeWidth={strokeWidth}
        />
      );
    });
  }, [dataKeys, colorValues, filled, fillOpacity, strokeWidth]);

  // Handle responsive behavior
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const setDivRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        (ref as MutableRefObject<HTMLDivElement | null>).current = el;
      }
    },
    [ref],
  );

  // Determine if we're in mini mode (very small container)
  const isMiniMode = containerSize.height < 150;

  const safeTooltipRenderer = useCallback(
    (props: any) => {
      if (!tooltipRenderer) return <TooltipContent {...props} />;

      const payloadObject: Record<string, any> = {};

      if (props.payload && props.payload.length > 0 && props.payload[0].payload) {
        Object.assign(payloadObject, props.payload[0].payload);
      }

      // Extract tooltip data from Recharts props
      const tooltipData = {
        label: props.label,
        payload: payloadObject,
        active: props.active,
      };

      return tooltipRenderer(tooltipData);
    },
    [tooltipRenderer],
  );

  return (
    <ChartProvider value={chartContextValue}>
      <div {...rest} ref={setDivRef} className={className} style={style}>
        <ResponsiveContainer width="100%" height="100%">
          <RRadarChart data={validData}>
            {!hideGrid && <PolarGrid />}
            {!hideAngleAxis && (
              <PolarAngleAxis
                dataKey={nameKey}
                hide={isMiniMode}
              />
            )}
            {!hideRadiusAxis && (
              <PolarRadiusAxis
                hide={isMiniMode}
              />
            )}
            {!isMiniMode && !hideTooltip && (
              <Tooltip content={safeTooltipRenderer} />
            )}
            {showLegend && !isMiniMode && <RLegend />}
            {radarElements}
            {children}
          </RRadarChart>
        </ResponsiveContainer>
      </div>
    </ChartProvider>
  );
}),
);
