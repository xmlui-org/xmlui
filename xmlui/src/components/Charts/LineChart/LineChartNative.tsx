import {
  Line,
  LineChart as RLineChart,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Legend as RLegend,
  YAxis,
} from "recharts";
import type { ForwardedRef, ReactNode } from "react";
import type React from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";
import { TooltipContent } from "../Tooltip/TooltipContent";
import { useTheme } from "../../../components-core/theming/ThemeContext";
import classnames from "classnames";
import styles from './LineChart.module.scss';

export type LineChartProps = {
  data: any[];
  dataKeys: string[];
  nameKey: string;
  style?: React.CSSProperties;
  hideTickX?: boolean;
  hideTickY?: boolean;
  className?: string;
  hideX?: boolean;
  hideY?: boolean;
  hideTooltip?: boolean;
  tickFormatterX?: (value: any) => any;
  tickFormatterY?: (value: any) => any;
  children?: ReactNode;
  showLegend?: boolean;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  tooltipRenderer?: (tooltipData: any) => ReactNode;
};

export const defaultProps: Pick<LineChartProps, "hideX" | "hideY" | "hideTooltip" | "showLegend" | "tickFormatterX" | "tickFormatterY" | "hideTickX" | "hideTickY"> = {
  hideTickX: false,
  hideTickY: false,
  hideX: false,
  hideY: false,
  hideTooltip: false,
  showLegend: false,
  tickFormatterX: (value) => value,
  tickFormatterY: (value) => value,
};

export const LineChart = forwardRef(function LineChart({
  data,
  dataKeys = [],
  nameKey,
  style,
  className,
  hideX = defaultProps.hideX,
  hideY = defaultProps.hideY,
  hideTickX = defaultProps.hideTickX,
  hideTickY = defaultProps.hideTickY,
  hideTooltip = defaultProps.hideTooltip,
  tickFormatterX = defaultProps.tickFormatterX,
  tickFormatterY = defaultProps.tickFormatterY,
  children,
  showLegend = defaultProps.showLegend,
  tooltipRenderer,
}: LineChartProps, forwardedRef: ForwardedRef<HTMLDivElement>) {
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

  const chartContextValue = useChartContextValue({ nameKey, dataKeys });

  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [interval, setIntervalState] = useState(0);
  const [tickAngle, setTickAngle] = useState(0);
  const [tickAnchor, setTickAnchor] = useState<"end" | "middle">("middle");
  const [chartMargin, setChartMargin] = useState({ left: 30, right: 30, top: 10, bottom: 60 });
  const [xAxisHeight, setXAxisHeight] = useState(50);
  const [miniMode, setMiniMode] = useState(false);
  const fontSize = 12;

  const safeData = Array.isArray(data) ? data : [];

  const safeTooltipRenderer = useCallback(
    (props: any) => {
      if (!tooltipRenderer) return <TooltipContent {...props}/>;

      // Extract tooltip data from Recharts props
      const tooltipData = {
        label: props.label,
        payload: props.payload,
        active: props.active,
      };

      return tooltipRenderer(tooltipData);
    },
    [tooltipRenderer]
  );

  useEffect(() => {
    const calc = () => {
      const width = containerRef.current?.offsetWidth || 800;
      const spans = labelsRef.current?.querySelectorAll("span") || [];
      const maxWidth = Array.from(spans).reduce((mx, s) => Math.max(mx, s.offsetWidth), 50);
      let angle = 0;
      let anchor: "end" | "middle" = "middle";
      let rad = 0;
      let minTickSpacing = maxWidth + 8;
      let leftMargin = Math.max(8, Math.ceil(maxWidth / 3));
      let rightMargin = Math.max(8, Math.ceil(maxWidth / 3));
      let xAxisH = Math.ceil(fontSize * 1.2);
      let maxTicks = Math.max(1, Math.floor(width / minTickSpacing));
      let skip = Math.max(0, Math.ceil(safeData.length / maxTicks) - 1);
      if (skip > 0) {
        angle = -60;
        anchor = "end";
        rad = (Math.abs(angle) * Math.PI) / 180;
        minTickSpacing = Math.ceil(maxWidth * Math.cos(rad)) + 2;
        maxTicks = Math.max(1, Math.floor(width / minTickSpacing));
        skip = Math.max(0, Math.ceil(safeData.length / maxTicks) - 1);
        leftMargin = Math.max(8, Math.ceil((maxWidth * Math.cos(rad)) / 1.8));
        rightMargin = Math.max(8, Math.ceil((maxWidth * Math.cos(rad)) / 1.8));
        xAxisH = Math.ceil(Math.abs(maxWidth * Math.sin(rad)) + Math.abs(fontSize * Math.cos(rad)));
      }
      setIntervalState(skip);
      setTickAngle(angle);
      setTickAnchor(anchor);
      setChartMargin({ left: leftMargin, right: rightMargin, top: 10, bottom: xAxisH });
      setXAxisHeight(Math.ceil(fontSize));
      const containerHeight = containerRef.current?.offsetHeight || 0;
      const neededHeight = 10 + xAxisHeight + 10 + 32;
      setMiniMode(neededHeight > containerHeight);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [data, nameKey, xAxisHeight]);
  
  // The stroke width of the lines
  const strokeWidth = getThemeVar("width-line-LineChart");

  return (
    <ChartProvider value={chartContextValue}>
      {children}
      <div
        ref={labelsRef}
        style={{ position: "absolute", visibility: "hidden", height: 0, overflow: "hidden" }}
      >
        {safeData.length > 0 && nameKey
          ? safeData
            .map((d) => d?.[nameKey])
            .map((label, idx) => (
              <span key={idx} style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                {label}
              </span>
            ))
          : null}
      </div>
      <div
        ref={forwardedRef}
        className={classnames(className, styles.wrapper)}
        style={style}
      >
        <ResponsiveContainer
          ref={containerRef}
          width="100%"
          height="100%"
          debounce={100}
        >
          <RLineChart
            accessibilityLayer
            data={data}
            margin={miniMode ? { left: 0, right: 0, top: 0, bottom: 0 } : chartMargin}
          >
            <XAxis
              interval={interval}
              tickLine={false}
              dataKey={nameKey}
              angle={tickAngle}
              textAnchor={tickAnchor}
              tick={miniMode ? false : !hideTickX && { fill: "currentColor", fontSize }}
              tickFormatter={miniMode ? undefined : tickFormatterX}
              height={miniMode || hideX ? 0 : xAxisHeight}
              hide={miniMode || hideX}
            />
            <YAxis
              hide={miniMode || hideY}
              tickLine={false}
              tickFormatter={miniMode ? undefined : tickFormatterY}
              tick={miniMode ? false : !hideTickY && { fill: "currentColor", fontSize }}
            />
            {!miniMode && !hideTooltip && <Tooltip content={safeTooltipRenderer} />}
            {dataKeys.map((dataKey, i) => (
              <Line
                key={dataKey}
                type="monotone"
                dataKey={dataKey}
                name={dataKey}
                stroke={colorValues[i]}
                strokeWidth={strokeWidth}
                dot={false}
              />
            ))}
            {showLegend && (
              <RLegend
                wrapperStyle={{
                  bottom: 0,
                  left: 0,
                  right: 0,
                  margin: "0 auto",
                  width: "100%",
                  textAlign: "center",
                }}
              />
            )}
          </RLineChart>
        </ResponsiveContainer>
      </div>
    </ChartProvider>
  );
});
