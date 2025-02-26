import type { CSSProperties, Ref } from "react";
import { forwardRef } from "react";
import classnames from "classnames";

import styles from "./Avatar.module.scss";

type Props = {
  size?: string;
  url?: string;
  name?: string;
  style?: CSSProperties;
} & Pick<React.HTMLAttributes<HTMLDivElement>, "onClick">;

export const defaultProps: Pick<Props, "size"> = {
  size: "sm",
};

export const Avatar = forwardRef(function Avatar(
  { size = defaultProps.size, url, name, style, onClick, ...rest }: Props,
  ref: Ref<any>,
) {
  let abbrev = null;
  if (!url && !!name) {
    abbrev = name
      .trim()
      .split(" ")
      .filter((word) => !!word.trim().length)
      .map((word) => word[0].toUpperCase())
      .slice(0, 3);
  }
  return (
    <div
      {...rest}
      ref={ref}
      className={classnames(styles.container, {
        [styles.xs]: size === "xs",
        [styles.sm]: size === "sm",
        [styles.md]: size === "md",
        [styles.lg]: size === "lg",
        [styles.clickable]: !!onClick,
      })}
      style={{ backgroundImage: url ? `url(${url})` : "none", ...style }}
      onClick={onClick}
    >
      {abbrev}
    </div>
  );
});
