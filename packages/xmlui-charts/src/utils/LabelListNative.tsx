import styles from "../PieChart/PieChartNative.module.scss";
import type { LabelPosition } from "recharts/types/component/Label";
import { useChart, useLabelList } from "./ChartProvider";
import { useEffect, useMemo } from "react";
import { LabelList as RLabelList } from "recharts";

type Props = {
  position: LabelPosition;
  key: string;
};

export const LabelList = ({ position = "inside", key }: Props) => {
  const { nameKey, chartConfig } = useChart();
  const { setLabelList } = useLabelList();

  const content = useMemo(
    () => (
      <RLabelList
        key={"labelList"}
        position={position}
        className={styles.labelList}
        dataKey={key || nameKey}
        stroke="none"
        fontSize={12}
        formatter={(value: any) => {
          return chartConfig[value]?.label;
        }}
      />
    ),
    [chartConfig, key, nameKey, position],
  );

  useEffect(() => {
    setLabelList(content);
  }, [content, setLabelList]);

  return null;
};
