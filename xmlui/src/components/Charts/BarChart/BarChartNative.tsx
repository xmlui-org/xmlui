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

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useMemo } from "react";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";
import { TooltipContent } from "../Tooltip/TooltipContent";
import { useTheme } from "../../../components-core/theming/ThemeContext";
import classnames from "classnames";
import styles from "./BarChart.module.scss";

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
  hideTooltip?: boolean;
  tickFormatterX?: (value: any) => any;
  tickFormatterY?: (value: any) => any;
  children?: ReactNode;
  showLegend?: boolean;
  className?: string;
  tooltipRenderer?: (tooltipData: any) => ReactNode;
};

export const defaultProps: Pick<
  BarChartProps,
  | "layout"
  | "stacked"
  | "hideTickX"
  | "hideTickY"
  | "hideX"
  | "hideY"
  | "hideTooltip"
  | "tickFormatterX"
  | "tickFormatterY"
  | "showLegend"
> = {
  layout: "vertical",
  stacked: false,
  hideTickX: false,
  hideTickY: false,
  hideX: false,
  hideY: false,
  hideTooltip: false,
  tickFormatterX: (value) => value,
  tickFormatterY: (value) => value,
  showLegend: false,
};

const defaultChartParams = {
  chartWidth: 800,
  chartHeight: 300,
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
  hideTooltip = defaultProps.hideTooltip,
  tickFormatterX = defaultProps.tickFormatterX,
  tickFormatterY = defaultProps.tickFormatterY,
  style,
  className,
  children,
  showLegend = defaultProps.showLegend,
  tooltipRenderer,
}: BarChartProps) {
  // Validate and normalize data
  const validData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
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

  const safeTooltipRenderer = useCallback(
    (props: any) => {
      if (!tooltipRenderer) return <TooltipContent {...props} />;

      const payloadArray: Array<{ label: string; value: any; color: string }> = [];

      if (props.payload && props.payload.length > 0 && props.payload[0].payload) {
        const originalPayload = props.payload[0].payload;
        // Transform dataKeys into array of objects with label, value, and color
        dataKeys?.forEach((dataKey, index) => {
          if (dataKey in originalPayload) {
            payloadArray.push({
              label: dataKey,
              value: originalPayload[dataKey],
              color: colorValues[index] || colorValues[0]
            });
          }
        });
      }

      // Extract tooltip data from Recharts props
      const tooltipData = {
        label: props.label,
        payload: payloadArray,
        active: props.active,
      };

      return tooltipRenderer(tooltipData);
    },
    [tooltipRenderer, dataKeys, colorValues],
  );

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
  const [xAxisHeight, setXAxisHeight] = useState(50);
  const [yTickCount, setYTickCount] = useState(5);
  const fontSize = 12;
  const [chartMargin, setChartMargin] = useState({ left: 30, right: 30, top: 10, bottom: 60 });
  const [tickAngle, setTickAngle] = useState(0);
  const [tickAnchor, setTickAnchor] = useState<"end" | "middle">("middle");
  const [miniMode, setMiniMode] = useState(false);
  const [yAxisWidth, setYAxisWidth] = useState(40);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calc = () => {
      const chartWidth = containerRef?.current?.offsetWidth || defaultChartParams.chartWidth;
      const chartHeight = containerRef?.current?.offsetHeight || defaultChartParams.chartHeight;

      const spans = labelsRef.current?.querySelectorAll("span") || [];
      const yTicks = Array.from(
        document.querySelectorAll(".recharts-y-axis .recharts-layer tspan"),
      ) as SVGGraphicsElement[];
      const maxYTickWidth =
        yTicks.length > 0 ? Math.max(...yTicks.map((t) => t.getBBox().width)) : 40;

      // Only update if the value actually changed
      // NOTE: This might cause recursive calls along with setting the state in here directly. Fix if necessary.
      setYAxisWidth((prev) => {
        // Add a small tolerance to prevent micro-adjustments
        if (Math.abs(maxYTickWidth - prev) > 1) {
          return maxYTickWidth;
        }
        return prev;
      });
      const maxWidth = Array.from(spans).reduce((mx, s) => Math.max(mx, s.offsetWidth), 50);
      let angle = 0;
      let anchor: "end" | "middle" = "middle";
      let rad = 0;
      let minTickSpacing = maxWidth + 8;
      let leftMargin = Math.ceil(maxWidth / 3);
      let rightMargin = Math.ceil(maxWidth / 3);
      let xAxisH = Math.ceil(fontSize * 1.2);
      let maxTicks = Math.max(1, Math.floor(chartWidth / minTickSpacing));
      let skip = Math.max(0, Math.ceil(validData.length / maxTicks) - 1);
      if (skip > 0) {
        angle = -60;
        anchor = "end";
        rad = (Math.abs(angle) * Math.PI) / 180;
        minTickSpacing = Math.ceil(maxWidth * Math.cos(rad)) + 2;
        maxTicks = Math.max(1, Math.floor(chartWidth / minTickSpacing));
        skip = Math.max(0, Math.ceil(validData.length / maxTicks) - 1);
        leftMargin = Math.ceil((maxWidth * Math.cos(rad)) / 1.8);
        rightMargin = Math.ceil((maxWidth * Math.cos(rad)) / 1.8);
        xAxisH = Math.ceil(Math.abs(maxWidth * Math.sin(rad)) + Math.abs(fontSize * Math.cos(rad)));
      }
      setIntervalState(skip);
      setTickAngle(angle);
      setTickAnchor(anchor);
      const xTicks = Array.from(
        document.querySelectorAll(".recharts-x-axis .recharts-layer tspan"),
      ) as SVGGraphicsElement[];
      const maxXTickHeight =
        xTicks.length > 0 ? Math.max(...xTicks.map((t) => t.getBBox().height)) : fontSize;
      let bottomMargin = 10;
      if (layout === "vertical") {
        bottomMargin = maxXTickHeight;
      } else {
        bottomMargin = Math.max(xAxisH, maxXTickHeight);
      }
      setChartMargin({ left: leftMargin, right: rightMargin, top: 10, bottom: bottomMargin });

      const maxYTicks = Math.max(2, Math.floor(chartHeight / (fontSize * 3)));
      setYTickCount(maxYTicks);
      setXAxisHeight(Math.ceil(fontSize));
      const neededHeight = 10 + xAxisHeight + 10 + 32;
      const neededWidth = chartMargin.left + chartMargin.right + yAxisWidth + 32;
      setMiniMode(neededHeight > chartHeight || neededWidth > chartWidth);
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
    // See note above: leaving out yAxisWidth may stop recursive calls but is hacky
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chartMargin.left, chartMargin.right, layout, validData.length, xAxisHeight]);

  const [tooltipElement, setTooltipElement] = useState<HTMLElement | null>(null);
  const observer = useRef<ResizeObserver>();

  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipWidth, setTooltipWidth] = useState(0);

  const onMouseEnter = useCallback(
    (e) => {

      setTooltipPosition({ x: e.x - tooltipWidth / 2, y: e.y });
    },
    [setTooltipPosition, tooltipWidth],
  );

  // Observe the size of the reference element
  useEffect(() => {
    observer.current?.disconnect();

    if (tooltipElement) {
      observer.current = new ResizeObserver((entries) => {
        if (entries[0]) {
          setTooltipWidth(entries[0].contentRect.width);
        }
      });
      observer.current.observe(tooltipElement);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [tooltipElement]);

  // Custom tooltip renderer that captures the DOM element
  const customTooltipRenderer = useCallback(
    (props: any) => {
      const tooltipContent = safeTooltipRenderer(props);
      
      return (
        <div
          ref={(el) => {
            if (el && el !== tooltipElement) {
              setTooltipElement(el);
            }
          }}
        >
          {tooltipContent}
        </div>
      );
    },
    [safeTooltipRenderer],
  );

  const xAxisProps: Record<string, any> =
    layout === "vertical"
      ? {
          type: "number",
          axisLine: false,
          hide: miniMode || hideX,
          height: miniMode || hideX ? 0 : xAxisHeight,
          tick: miniMode || hideTickX ? false : { fill: "currentColor", fontSize },
          tickFormatter: miniMode || hideTickX ? undefined : tickFormatterX,
        }
      : {
          type: "category",
          dataKey: nameKey,
          hide: miniMode || hideX,
          height: miniMode || hideX ? 0 : xAxisHeight,
          tick: miniMode || hideTickX ? false : { fill: "currentColor", fontSize },
          tickFormatter: miniMode || hideTickX ? undefined : tickFormatterX,
          interval: interval,
          tickLine: false,
          angle: tickAngle,
          textAnchor: tickAnchor,
        };

  const yAxisProps: Record<string, any> =
    layout === "vertical"
      ? {
          type: "category",
          dataKey: nameKey,
          hide: miniMode || hideY,
          interval: "equidistantPreserveStart",
          tickLine: false,
          tickFormatter: miniMode || hideTickY ? undefined : tickFormatterY,
          tick: miniMode || hideTickY ? false : { fill: "currentColor", fontSize },
          width: miniMode || hideY ? 0 : yAxisWidth,
        }
      : {
          type: "number",
          axisLine: false,
          tick: miniMode || hideTickY ? false : { fill: "currentColor", fontSize },
          hide: miniMode || hideY,
          tickCount: yTickCount,
          tickFormatter: miniMode || hideTickY ? undefined : tickFormatterY,
          width: miniMode || hideY ? 0 : yAxisWidth,
        };

  return (
    <ChartProvider value={chartContextValue}>
      {children}
      <div
        ref={labelsRef}
        style={{ position: "absolute", visibility: "hidden", height: 0, overflow: "hidden" }}
      >
        {validData
          .map((d) => d[nameKey])
          .map((label, idx) => (
            <span key={idx} style={{ fontSize: 12, whiteSpace: "nowrap" }}>
              {label}
            </span>
          ))}
      </div>
      <div
        className={classnames(className, styles.wrapper)}
        style={{ flexGrow: 1, ...style }}
        ref={wrapperRef}
      >
        <ResponsiveContainer
          ref={containerRef}
          minWidth={60}
          minHeight={60}
          debounce={100}
          width="100%"
          height="100%"
        >
          <RBarChart
            accessibilityLayer
            data={validData}
            layout={layout}
            margin={miniMode ? { left: 0, right: 0, top: 0, bottom: 0 } : chartMargin}
          >
            <CartesianGrid vertical={true} strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            {!miniMode && !hideTooltip && (
              <Tooltip
                content={customTooltipRenderer}
                wrapperStyle={{
                  pointerEvents: "auto",
                }}
                position={tooltipPosition}
              />
            )}
            {validData.length > 0 &&
              Object.keys(config).map((key, index) => (
                <Bar
                  key={index}
                  dataKey={key}
                  fill={config[key].color}
                  radius={stacked ? 0 : 8}
                  stackId={stacked ? "stacked" : undefined}
                  strokeWidth={1}
                  onMouseEnter={onMouseEnter}
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
          </RBarChart>
        </ResponsiveContainer>
      </div>
    </ChartProvider>
  );
}
