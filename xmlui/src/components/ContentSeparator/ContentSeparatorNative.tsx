import type { CSSProperties } from "react";
import classnames from "classnames";

import styles from "./ContentSeparator.module.scss";

type ContentSeparatorProps = {
  size?: number | string;
  orientation?: string;
  style?: CSSProperties;
};

export const defaultProps: Pick<ContentSeparatorProps, "orientation"> = {
  orientation: "horizontal",
}

export const ContentSeparator = ({
  orientation = defaultProps.orientation,
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
