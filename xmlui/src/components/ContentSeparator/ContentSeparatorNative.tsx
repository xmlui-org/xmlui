import styles from "./ContentSeparator.module.scss";
import type { CSSProperties } from "react";
import classnames from "@components-core/utils/classnames";

type ContentSeparatorProps = {
  size?: number | string;
  orientation?: string;
  style?: CSSProperties;
};

export const ContentSeparator = ({
  orientation = "horizontal",
  size,
  style,
}: ContentSeparatorProps) => {
  return (
    <div
      className={classnames(styles.separator, {
        [styles.horizontal]: orientation === "horizontal",
        [styles.vertical]: orientation === "vertical",
      })}
      style={{
        height: orientation === "horizontal" ? size : undefined,
        width: orientation === "horizontal" ? "100%" : size,
        ...style,
      }}
    />
  );
};
