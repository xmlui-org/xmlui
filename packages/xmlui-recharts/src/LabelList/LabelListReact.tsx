import styles from "./LabelList.module.scss";
import type { LabelPosition } from "recharts/types/component/Label";
import type { CSSProperties } from "react";
import { useEffect, useMemo, memo } from "react";
import { LabelList as RLabelList } from "recharts";
import { useChart, useLabelList } from "../utils/ChartProvider";
import classnames from "classnames";
import { useTheme } from "xmlui";

type Props = {
  position: LabelPosition;
  nameKey?: string;
  style?: CSSProperties;
  className?: string;
};

import { defaultProps } from "./LabelList.defaults";

export const LabelList = memo(function LabelList({ position = defaultProps.position, nameKey: key, style, className }: Props) {
  const { nameKey } = useChart();
  const { setLabelList } = useLabelList();
  const { getThemeVar } = useTheme();
  const labelFill = String(
    getThemeVar("textColor-LabelList", getThemeVar("textColor-primary", "#17232b")) ?? "#17232b",
  );

  const content = useMemo(
    () => (
      <RLabelList
        key={"labelList"}
        position={position}
        className={classnames(styles.labelList, className)}
        dataKey={key || nameKey}
        fill={labelFill}
        stroke="none"
        style={{ color: labelFill, fill: labelFill, ...style }}
      />
    ),
    [key, labelFill, nameKey, position, style, className],
  );

  useEffect(() => {
    setLabelList(content);
  }, [content, setLabelList]);

  return null;
});
