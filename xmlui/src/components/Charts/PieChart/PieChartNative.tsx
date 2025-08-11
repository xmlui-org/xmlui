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
import { useMemo } from "react";
import type { LabelPosition } from "recharts/types/component/Label";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";

import { TooltipContent } from "../Tooltip/TooltipContent";
import { useTheme } from "../../../components-core/theming/ThemeContext";

export type PieChartProps = {
  data: any[];
  dataKey: string;
  nameKey: string;
  style?: CSSProperties;
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
  showLabel = defaultProps.showLabel,
  showLabelList = defaultProps.showLabelList,
  labelListPosition = defaultProps.labelListPosition,
  innerRadius = defaultProps.innerRadius,
  children,
  outerRadius = "60%",
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
        <ResponsiveContainer style={style} width="100%" height="100%" minWidth={0}>
          <RPieChart>
            <Tooltip content={<TooltipContent />} />
            <Pie
              data={chartData}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
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
