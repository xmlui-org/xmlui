import { Pie, PieChart as RPieChart, Sector, ResponsiveContainer } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../utils/Chart";
import styles from "./PieChartNative.module.scss";
import { useColors } from "xmlui";
import { useMemo } from "react";

export type PieChartProps = {
  data: any[];
  dataKey: string;
  nameKey: string;
  style?: React.CSSProperties;
  showLabel?: boolean;
};

export function PieChart({ data, dataKey, nameKey, style, showLabel = true }: PieChartProps) {
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
      };
      return acc;
    }, {});
  }, [data, nameKey]);

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
    <ResponsiveContainer style={style}>
      <ChartContainer config={chartConfig} className={styles.chartContainer}>
        <RPieChart>
          <ChartTooltip cursor={true} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={chartData}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={60}
            label={showLabel}
            activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
              <Sector {...props} outerRadius={outerRadius + 10} />
            )}
          />
        </RPieChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}
