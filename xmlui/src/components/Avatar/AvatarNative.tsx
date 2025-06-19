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
  const commonClassNames = classnames(styles.container, {
    [styles.xs]: size === "xs",
    [styles.sm]: size === "sm",
    [styles.md]: size === "md",
    [styles.lg]: size === "lg",
    [styles.clickable]: !!onClick,
  });
  const altTxt = !!name ? `Avatar of ${name}` : "Avatar";

  if (url) {
    return (
      <img
        {...rest}
        ref={ref}
        src={url}
        alt={altTxt}
        className={commonClassNames}
        style={style}
        onClick={onClick}
      />
    );
  } else
    return (
      <div
        {...rest}
        ref={ref}
        className={commonClassNames}
        style={style}
        onClick={onClick}
        role="img"
        aria-label={altTxt}
      >
        {abbrevName(name) || <span aria-hidden="true"></span>}
        {/* Display initials or an empty decorative span */}
      </div>
    );
});

function abbrevName(name: string | null): string | null {
  if (!!name) {
    const abbrev = name
      .trim()
      .split(" ")
      .filter((word) => !!word.trim().length)
      .map((word) => word[0].toUpperCase())
      .slice(0, 3)
      .join("");
    return abbrev;
  }
  return null;
}
