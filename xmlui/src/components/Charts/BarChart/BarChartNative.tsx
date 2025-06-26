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
  const [fontSize, setFontSize] = useState(12);

  useEffect(() => {
    const calc = () => {
      const width = containerRef.current?.offsetWidth || 800;
      const spans = labelsRef.current?.querySelectorAll('span') || [];
      let maxWidth = Array.from(spans).reduce((mx, s) => Math.max(mx, s.offsetWidth), 50);

      let newFontSize = 12;
      if (data.length * maxWidth > width * 2.5) newFontSize = 9;
      else if (data.length * maxWidth > width * 2.0) newFontSize = 10;
      else if (data.length * maxWidth > width * 1.5) newFontSize = 11;
      setFontSize(newFontSize);

      maxWidth = maxWidth * (newFontSize / 12);

      const maxTicks = Math.floor(width / maxWidth) || 1;
      const inter = Math.max(1, Math.round(data.length / maxTicks));
      setIntervalState(inter);

      const allWidthNoRotate = data.length * maxWidth;
      const allWidth45 = data.length * (maxWidth * Math.cos(45 * Math.PI / 180));

      let angle = 0;
      if (allWidthNoRotate <= width) {
        angle = 0;
      } else if (allWidth45 <= width) {
        angle = -45;
      } else {
        angle = -50;
      }
      setRotate(angle);

      let height: number;
      if (angle === 0) height = newFontSize * 2.5;
      else if (angle === -45) height = newFontSize * 4.5;
      else height = newFontSize * 6.5;
      setXAxisHeight(Math.ceil(height));
    };

    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [data]);


  useEffect(() => {
    console.log("BarChart: interval", interval, "rotate", rotate);
  }, [rotate, interval]);

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
      <ResponsiveContainer style={style} width="100%" height="100%" ref={containerRef}>
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
                interval={interval}
                tickLine={false}
                angle={rotate}
                textAnchor={rotate ? 'end' : 'middle'}
                tickFormatter={tickFormatter}
                height={hideX ? 0 : xAxisHeight}
                hide={hideX}
                tick={!hideTickX && { fill: "currentColor", fontSize }}
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
