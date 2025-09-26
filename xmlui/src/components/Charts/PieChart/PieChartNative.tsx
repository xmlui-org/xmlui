import {
  Pie,
  PieChart as RPieChart,
  Sector,
  ResponsiveContainer,
  LabelList,
  Tooltip,
  Legend as RLegend,
} from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import styles from "./PieChartNative.module.scss";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useRef, useEffect, useState } from "react";
import type { LabelPosition } from "recharts/types/component/Label";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";

import { TooltipContent } from "../Tooltip/TooltipContent";
import { useTheme } from "../../../components-core/theming/ThemeContext";
import classnames from "classnames";

export type PieChartProps = {
  data: any[];
  dataKey: string;
  nameKey: string;
  style?: CSSProperties;
  className?: string;
  showLabel?: boolean;
  showLabelList?: boolean;
  labelListPosition?: LabelPosition;
  innerRadius?: number;
  children?: ReactNode;
  showLegend?: boolean;
  outerRadius?: string | number;
};

export const defaultProps: Pick<
  PieChartProps,
  "showLabel" | "showLabelList" | "showLegend" | "labelListPosition" | "innerRadius"
> = {
  showLabel: true,
  showLabelList: false,
  showLegend: false,
  labelListPosition: "inside",
  innerRadius: 0,
};

// Custom label renderer that draws connectors and places text outside the pie
const renderCustomizedLabel = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, outerRadius, fill, payload, percent, value, name, index } = props;

  // Calculate positions for the label connector lines
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      {/* Connector line from pie to label */}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      {/* Circle at the bend point */}
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      {/* Name label */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        className={styles.pieLabel}
        fill="currentColor"
        fontSize={12}
      >
        {props.name}
      </text>
    </g>
  );
};

// Enhanced active shape renderer
const renderActiveShape = (props: PieSectorDataItem) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius as number) + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={(outerRadius as number) + 6}
        outerRadius={(outerRadius as number) + 10}
        fill={fill}
      />
    </g>
  );
};

export function PieChart({
  data,
  dataKey,
  nameKey,
  style,
  className,
  showLabel = defaultProps.showLabel,
  showLabelList = defaultProps.showLabelList,
  labelListPosition = defaultProps.labelListPosition,
  innerRadius = defaultProps.innerRadius,
  children,
  outerRadius, // no default; we'll compute when undefined or "auto"
  showLegend = defaultProps.showLegend,
}: PieChartProps) {
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

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item, index) => ({
      ...item,
      fill: item.fill || colorValues[index % colorValues.length],
    }));
  }, [colorValues, data]);

  const chartContextValue = useChartContextValue({ dataKey, nameKey });

  // --- measurement for auto radius ---
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    if (!wrapperRef.current || typeof window === "undefined" || !(window as any).ResizeObserver)
      return;
    const ro = new (window as any).ResizeObserver((entries: any[]) => {
      const cr = entries[0]?.contentRect;
      if (cr) setBox({ width: cr.width, height: cr.height });
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // Sizing heuristics
  const RING_PADDING = 8;            // keep ring off the SVG edge
  const LABEL_GUTTER_OUTSIDE = 16;   // space for connectors/labels
  const LABEL_GUTTER_INSIDE = 6;     // small breathing room if labels inside/off
  const MIN_RING_THICKNESS = 12;     // maintain legibility on small canvases

  // Are labels drawn outside the ring?
  const labelsOutside = !!showLabel || (showLabelList && labelListPosition === "outside");

  // Resolve outerRadius: explicit value wins; otherwise compute from measured box
  const resolvedOuterRadius = useMemo((): number | string => {
    const wantsAuto =
      outerRadius === undefined ||
      (typeof outerRadius === "string" && outerRadius.toLowerCase() === "auto");

    if (!wantsAuto) return outerRadius as number | string;

    const base = Math.min(box.width, box.height) / 2;
    const gutter = labelsOutside ? LABEL_GUTTER_OUTSIDE : LABEL_GUTTER_INSIDE;
    const inner = Number(innerRadius) || 0;
    const derived = Math.max(inner + MIN_RING_THICKNESS, base - gutter - RING_PADDING);

    // Fallback before first measurement
    if (!Number.isFinite(derived) || derived <= 0) {
      return labelsOutside ? "72%" : "88%";
    }
    return derived;
  }, [outerRadius, box.width, box.height, labelsOutside, innerRadius]);

  return (
    <ChartProvider value={chartContextValue}>
      {children}
      <div ref={wrapperRef} className={classnames(styles.wrapper, className)} style={style}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RPieChart
            margin={{ top: 8, right: 8, bottom: labelsOutside ? 16 : 8, left: 8 }}
          >
            <Tooltip content={<TooltipContent />} />
            <Pie
              data={chartData}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={innerRadius}
              outerRadius={resolvedOuterRadius}
              paddingAngle={1}
              activeShape={renderActiveShape}
              label={showLabel ? renderCustomizedLabel : false}
              labelLine={showLabel}
            >
              {chartContextValue.labelList
                ? chartContextValue.labelList
                : showLabelList && (
                    <LabelList
                      position={labelListPosition}
                      dataKey={nameKey}
                      className={styles.labelList}
                      stroke="none"
                      fill="currentColor"
                      fontSize={12}
                    />
                  )}
            </Pie>
            {chartContextValue.legend ? chartContextValue.legend : showLegend && <RLegend />}
          </RPieChart>
        </ResponsiveContainer>
      </div>
    </ChartProvider>
  );
}
