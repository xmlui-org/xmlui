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

import type { ReactNode, ForwardedRef, HTMLAttributes, MutableRefObject } from "react";
import { useEffect, useRef, useState, useCallback, forwardRef, memo, useMemo } from "react";
import classnames from "classnames";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";
import { TooltipContent } from "../Tooltip/TooltipContent";

import { useTheme } from "xmlui";

export type AreaChartProps = Omit<HTMLAttributes<HTMLDivElement>, "data"> & {
  data: any[];
  nameKey: string;
  dataKeys?: string[];
  className?: string;
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
  tooltipRenderer?: (tooltipData: any) => ReactNode;
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

export const AreaChart = memo(
  forwardRef(function AreaChart({
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
  className,
  children,
  showLegend = defaultProps.showLegend,
  stacked = defaultProps.stacked,
  curved = defaultProps.curved,
  tooltipRenderer,
  style,
  ...rest
}: AreaChartProps, ref: ForwardedRef<HTMLDivElement>) {
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

  // Determine if we're in mini mode (very small container).
  // Only enter mini mode once we have real measurements (width > 0 && height > 0)
  // so the chart doesn't start in mini mode before the ResizeObserver has fired.
  const isMiniMode = containerSize.width > 0 && containerSize.height > 0 && containerSize.height < 150;

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
      <div {...rest} ref={setDivRef} className={classnames(className)} style={style}>
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
            {!hideY && <YAxis tick={!hideTickY} tickFormatter={tickFormatterY} hide={isMiniMode} />}
            <CartesianGrid strokeDasharray="3 3" />
            {!isMiniMode && !hideTooltip && <Tooltip content={safeTooltipRenderer} />}
            {showLegend && !isMiniMode && <RLegend />}
            {chartElements}
            {children}
          </RAreaChart>
        </ResponsiveContainer>
      </div>
    </ChartProvider>
  );
}),
);
