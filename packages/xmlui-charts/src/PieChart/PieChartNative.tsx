import {
  Pie,
  PieChart as RPieChart,
  Sector,
  ResponsiveContainer,
  LabelList,
  Tooltip,
  Legend as RLegend,
} from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import styles from "./PieChartNative.module.scss";
import { useTheme } from "xmlui";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import type { LabelPosition } from "recharts/types/component/Label";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";

import { TooltipContent } from "../Tooltip/TooltipContent";
import { generateColorPalette } from "../utils/colors";

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
  showLegend = defaultProps.showLegend,
}: PieChartProps) {
  const { getThemeVar } = useTheme();

  const colorValues = useMemo(() => {
    const baseColors = [
      getThemeVar("color-primary-500"),
      getThemeVar("color-primary-400"),
      getThemeVar("color-primary-300"),
      getThemeVar("color-primary-200"),
    ] as any;

    return generateColorPalette({
      count: data?.length || 1,
      baseColors,
    });
  }, [data, getThemeVar]);

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
      <ResponsiveContainer style={style}>
        <RPieChart>
          <Tooltip content={<TooltipContent />} />
          <Pie
            data={chartData}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={innerRadius}
            outerRadius="70%"
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
    </ChartProvider>
  );
}
