import {
  Line,
  LineChart as RLineChart,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Legend as RLegend,
} from "recharts";
import { ReactNode, useEffect, useRef, useState } from "react";
import type React from "react";
import { useMemo } from "react";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";
import { TooltipContent } from "../Tooltip/TooltipContent";
import { useTheme } from "xmlui";

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

  const containerRef = useRef(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [interval, setIntervalState] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [xAxisHeight, setXAxisHeight] = useState(50);
  const [fontSize, setFontSize] = useState(12);

  useEffect(() => {
    const calc = () => {
      const width = containerRef.current?.offsetWidth || 800;
      const spans = labelsRef.current?.querySelectorAll("span") || [];
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
        angle = -60;
      }
      setRotate(angle);

      let height: number;
      if (angle === 0) height = newFontSize * 2.5;
      else if (angle === -45) height = newFontSize * 4.5;
      else height = newFontSize * 6.5;
      setXAxisHeight(Math.ceil(height));
    };

    if (!data || data.length === 0) return;
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [data]);

  return (
    <ChartProvider value={chartContextValue}>
      {children}
      <div
        ref={labelsRef}
        style={{ position: 'absolute', visibility: 'hidden', height: 0, overflow: 'hidden' }}
      >
        {data?.map(d => d[nameKey]).map((label, idx) => (
          <span key={idx} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            {label}
          </span>
        ))}
      </div>
      <ResponsiveContainer style={style} width="100%" height="100%">
        <RLineChart
          accessibilityLayer
          data={data}
          margin={{ top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft }}
        >
          <XAxis
            interval={interval}
            dataKey={nameKey}
            tickLine={false}
            hide={hideX}
            axisLine={false}
            angle={rotate}
            height={hideX ? 0 : xAxisHeight}
            textAnchor={rotate ? "end" : "middle"}
            tick={{ fill: "currentColor", fontSize }}
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
    </ChartProvider>
  );
}
