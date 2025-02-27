import {
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useColors } from "xmlui";
import { useMemo } from "react";

export type LineChartProps = {
  data: any[];
  dataKeys: string[];
  nameKey: string;
  style?: React.CSSProperties;
  hideX?: boolean;
  hideTooltip?: boolean;
  tickFormatter?: (value: any) => any;
};

export function LineChart({
  data,
  dataKeys = [],
  nameKey,
  style,
  hideX = false,
  hideTooltip = false,
  tickFormatter,
}: LineChartProps) {
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

  const config = useMemo(() => {
    const colorValues = Object.values(colors);
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
  }, [colors, dataKeys]);

  return (
    <ResponsiveContainer style={style}>
      <RLineChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          interval="preserveStartEnd"
          dataKey={nameKey}
          tickLine={false}
          hide={hideX}
          axisLine={false}
          tickFormatter={tickFormatter}
        />
        {!hideTooltip && <Tooltip />}
        {Object.keys(config).map((key, index) => (
          <Line key={index} dataKey={key} type="monotone" stroke={config[key].color} dot={false} />
        ))}
      </RLineChart>
    </ResponsiveContainer>
  );
}
