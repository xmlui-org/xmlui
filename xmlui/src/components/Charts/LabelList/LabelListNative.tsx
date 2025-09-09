import styles from "./LabelListNative.module.scss";
import type { LabelPosition } from "recharts/types/component/Label";
import type { CSSProperties } from "react";
import { useEffect, useMemo } from "react";
import { LabelList as RLabelList } from "recharts";
import { useChart, useLabelList } from "../utils/ChartProvider";
import classnames from "classnames";

type Props = {
  position: LabelPosition;
  nameKey?: string;
  style?: CSSProperties;
  className?: string;
};

export const defaultProps: Pick<Props, "position"> = {
  position: "inside",
};

export const LabelList = ({ position = defaultProps.position, nameKey: key, style, className }: Props) => {
  const { nameKey } = useChart();
  const { setLabelList } = useLabelList();

  const content = useMemo(
    () => (
      <RLabelList
        key={"labelList"}
        position={position}
        className={classnames(styles.labelList, className)}
        dataKey={key || nameKey}
        stroke="none"
        style={style}
      />
    ),
    [key, nameKey, position, style, className],
  );

  useEffect(() => {
    setLabelList(content);
  }, [content, setLabelList]);

  return null;
};
