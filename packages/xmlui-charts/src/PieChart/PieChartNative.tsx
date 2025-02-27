import { Pie, PieChart as RPieChart, Sector, ResponsiveContainer, LabelList } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../utils/Chart";
import styles from "./PieChartNative.module.scss";
import { useColors } from "xmlui";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useMemo } from "react";
import type { LabelPosition } from "recharts/types/component/Label";
import ChartProvider from "../utils/ChartProvider";

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
}: PieChartProps) {
  const [labelList, setLabelList] = useState();

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

  const chartConfig = useMemo(() => {
    if (!data) return {};

    return data.reduce((acc, item) => {
      const key = item[nameKey];
      acc[key] = {
        label: key,
        value: item[dataKey],
      };
      return acc;
    }, {});
  }, [data, dataKey, nameKey]);

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

  return (
    <ChartProvider
      value={{ chartConfig, nameKey, dataKey, chartRegistry: { labelList, setLabelList } }}
    >
      {children}
      <ResponsiveContainer style={style}>
        <ChartContainer config={chartConfig} className={styles.chartContainer}>
          <RPieChart>
            <ChartTooltip cursor={true} content={<ChartTooltipContent hideLabel />} />
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
              {labelList
                ? labelList
                : showLabelList && (
                    <LabelList
                      position={labelListPosition}
                      dataKey={nameKey}
                      className={styles.labelList}
                      stroke="none"
                      fontSize={12}
                      formatter={(value: keyof typeof chartConfig) => {
                        return chartConfig[value]?.label;
                      }}
                    />
                  )}
            </Pie>
          </RPieChart>
        </ChartContainer>
      </ResponsiveContainer>
    </ChartProvider>
  );
}
