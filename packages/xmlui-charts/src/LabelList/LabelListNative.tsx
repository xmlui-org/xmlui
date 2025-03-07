import styles from "./LabelListNative.module.scss";
import type { LabelPosition } from "recharts/types/component/Label";
import type { CSSProperties } from "react";
import { useEffect, useMemo } from "react";
import { LabelList as RLabelList } from "recharts";
import { useChart, useLabelList } from "../utils/ChartProvider";

type Props = {
  position: LabelPosition;
  key: string;
  style?: CSSProperties;
};

export const defaultProps: Pick<Props, "position"> = {
  position: "inside",
};

export const LabelList = ({ position = defaultProps.position, key, style }: Props) => {
  const { nameKey } = useChart();
  const { setLabelList } = useLabelList();

  const content = useMemo(
    () => (
      <RLabelList
        key={"labelList"}
        position={position}
        className={styles.labelList}
        dataKey={key || nameKey}
        stroke="none"
        style={style}
      />
    ),
    [key, nameKey, position, style],
  );

  useEffect(() => {
    setLabelList(content);
  }, [content, setLabelList]);

  return null;
};
