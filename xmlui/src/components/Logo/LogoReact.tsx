import type { CSSProperties, ForwardedRef } from "react";
import { forwardRef, memo } from "react";
import classnames from "classnames";

import { useLogoUrl } from "../AppHeader/AppHeaderReact";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { defaultProps } from "./Logo.defaults";
import styles from "./Logo.module.scss";

export type LogoProps = {
  src?: string;
  alt?: string;
  inline?: boolean;
  classes?: Record<string, string>;
  className?: string;
  style?: CSSProperties;
};

export const Logo = memo(forwardRef(function Logo(
  {
    src,
    alt = defaultProps.alt,
    inline = defaultProps.inline,
    classes,
    className,
    style,
    ...rest
  }: LogoProps,
  ref: ForwardedRef<HTMLImageElement>,
) {
  const logoUrl = src || useLogoUrl();
  if (!logoUrl) {
    return null;
  }
  // width auto for safari
  const image = (
    <img
      {...rest}
      ref={ref}
      src={logoUrl}
      alt={alt}
      className={classnames(styles.logo, { [styles.inline]: inline }, classes?.[COMPONENT_PART_KEY], className)}
      style={{ width: "auto", boxShadow: "none", ...style, ...(inline ? { display: "inline" } : {}) }}
    />
  );
  return inline ? <span style={{ display: "inline" }}>{image}</span> : image;
}));
