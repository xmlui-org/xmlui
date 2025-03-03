import {
  Pie,
  PieChart as RPieChart,
  Sector,
  ResponsiveContainer,
  LabelList, Tooltip
} from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import styles from "./PieChartNative.module.scss";
import { useColors } from "xmlui";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import type { LabelPosition } from "recharts/types/component/Label";
import ChartProvider, { useChartContextValue } from "../utils/ChartProvider";
import * as React from "react";
import { Legend } from "../Legend/LegendNative";
import { TooltipContent } from "../Tooltip/TooltipContent";

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

export function PieChart({
  data,
  dataKey,
  nameKey,
  style,
  showLabel = true,
  showLabelList = false,
  labelListPosition = "inside",
  innerRadius = 0,
  children,
  showLegend = false,
}: PieChartProps) {
  const colors = useColors(
    {
      name: "color-primary-500",
      format: "hex",
    },
    {
      name: "color-primary-400",
      format: "hex",
    },
    {
      name: "color-primary-300",
      format: "hex",
    },
    {
      name: "color-primary-200",
      format: "hex",
    },
  );

  const chartData = useMemo(() => {
    const colorValues = Object.values(colors);
    if (!data) return [];
    return data?.map((item, index) => {
      return {
        ...item,
        fill: colorValues[index % colorValues.length] as string,
      };
    });
  }, [colors, data]);

  const chartContextValue = useChartContextValue({ dataKey, nameKey });

  return (
    <ChartProvider value={chartContextValue}>
      {children}
      <ResponsiveContainer style={style}>
        <RPieChart>
          <Tooltip content={<TooltipContent />}/>
          <Pie
            data={chartData}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={innerRadius}
            label={showLabel}
            activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
              <Sector {...props} outerRadius={outerRadius + 10} />
            )}
          >
            {chartContextValue.labelList
              ? chartContextValue.labelList
              : showLabelList && (
                  <LabelList
                    position={labelListPosition}
                    dataKey={nameKey}
                    className={styles.labelList}
                    stroke="none"
                    fontSize={12}
                  />
                )}
          </Pie>
          {chartContextValue.legend ? chartContextValue.legend : showLegend && <Legend />}
        </RPieChart>
      </ResponsiveContainer>
    </ChartProvider>
  );
}
