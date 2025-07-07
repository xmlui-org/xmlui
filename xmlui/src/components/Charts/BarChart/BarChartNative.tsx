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

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import { useTheme } from "xmlui";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";
import { TooltipContent } from "../Tooltip/TooltipContent";

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

  const chartContextValue = useChartContextValue({ dataKeys, nameKey });

  const containerRef = useRef(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [interval, setIntervalState] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [xAxisHeight, setXAxisHeight] = useState(50);
  const [yTickCount, setYTickCount] = useState(5);
  const [chartMargin, setChartMargin] = useState({ left: 30, right: 30, top: 10, bottom: 60 });
  const [tickAngle, setTickAngle] = useState(0);
  const [tickAnchor, setTickAnchor] = useState<'end' | 'middle'>('middle');
  const fontSize = 12; // fixed label font size

  useEffect(() => {
    const calc = () => {
      const width = containerRef.current?.offsetWidth || 800;
      const spans = labelsRef.current?.querySelectorAll('span') || [];
      const maxWidth = Array.from(spans).reduce((mx, s) => Math.max(mx, s.offsetWidth), 50);
      let angle = 0;
      let anchor: 'end' | 'middle' = 'middle';
      let rad = 0;
      let minTickSpacing = maxWidth + 8;
      // Először próbáljuk forgatás nélkül, spacing = maxWidth + 8
      let leftMargin = Math.ceil(maxWidth / 3);
      let rightMargin = Math.ceil(maxWidth / 3);
      let xAxisH = Math.ceil(fontSize * 1.2);
      let maxTicks = Math.max(1, Math.floor(width / minTickSpacing));
      let skip = Math.max(0, Math.ceil(data.length / maxTicks) - 1);
      // Ha nem fér ki elég tick, próbáljuk meg -60°-os forgatással
      if (skip > 0) {
        angle = -60;
        anchor = 'end';
        rad = Math.abs(angle) * Math.PI / 180;
        minTickSpacing = Math.ceil(maxWidth * Math.cos(rad)) + 2;
        maxTicks = Math.max(1, Math.floor(width / minTickSpacing));
        skip = Math.max(0, Math.ceil(data.length / maxTicks) - 1);
        leftMargin = Math.ceil(maxWidth * Math.cos(rad) / 1.8);
        rightMargin = Math.ceil(maxWidth * Math.cos(rad) / 1.8);
        xAxisH = Math.ceil(Math.abs(maxWidth * Math.sin(rad)) + Math.abs(fontSize * Math.cos(rad)));

      }
      setIntervalState(skip);
      setTickAngle(angle);
      setTickAnchor(anchor);
      setChartMargin({ left: leftMargin, right: rightMargin, top: 10, bottom: xAxisH });

      // y-axis tick count based on container height
      const chartHeight = containerRef.current?.offsetHeight || 300;
      const maxYTicks = Math.max(2, Math.floor(chartHeight / (fontSize * 3)));
      setYTickCount(maxYTicks);

      setRotate(0);

      setXAxisHeight(Math.ceil(fontSize));
    };

    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [data]);

  return (
    <ChartProvider value={chartContextValue}>
      {children}
      <div
        ref={labelsRef}
        style={{ position: 'absolute', visibility: 'hidden', height: 0, overflow: 'hidden' }}
      >
        {data.map(d => d[nameKey]).map((label, idx) => (
          <span key={idx} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            {label}
          </span>
        ))}
      </div>
      <div
        style={{
          flexGrow: 1,
          minHeight: 0,
          width: style.width || "100%",
          height: style.height || "100%",
          padding: 0,
          margin: 0,
        }}
      >
        <ResponsiveContainer ref={containerRef}  width="100%" height="100%" debounce={100}>
          <RBarChart
            style={style}
            accessibilityLayer
            data={data}
            layout={layout}
            margin={chartMargin}
          >
            <CartesianGrid vertical={true} strokeDasharray="3 3" />
            {layout === "vertical" ? (
              <>
                <XAxis
                  type="number"
                  axisLine={false}
                  hide={hideX}
                  tick={{ fill: "currentColor", fontSize }}
                />
                <YAxis
                  hide={hideY}
                  dataKey={nameKey}
                  type="category"
                  interval={"equidistantPreserveStart"}
                  tickLine={false}
                  tickFormatter={tickFormatter}
                  tick={{ fill: "currentColor", fontSize }}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={nameKey}
                  type="category"
                  interval={interval}
                  tickLine={false}
                  angle={tickAngle}
                  textAnchor={tickAnchor}
                  tick={{ fill: 'currentColor', fontSize }}
                  tickFormatter={tickFormatter}
                  height={hideX ? 0 : xAxisHeight}
                  hide={hideX}
                />
                <YAxis
                  type="number"
                  axisLine={false}
                  tick={!hideTickY && { fill: "currentColor", fontSize }}
                  hide={hideY}
                  tickCount={yTickCount}
                  width={hideY || hideTickY ? 0 : 40}
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
      </div>
    </ChartProvider>
  );
}
