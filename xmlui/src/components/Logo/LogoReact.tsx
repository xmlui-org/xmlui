import { forwardRef, memo, type CSSProperties, type ForwardedRef } from "react";
import classnames from "classnames";

import { Image } from "../Image/ImageReact";
import { useLogoUrl } from "../AppHeader/AppHeaderReact";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { defaultProps } from "./Logo.defaults";
import styles from "./Logo.module.scss";

export type LogoProps = {
  src?: string;
  alt?: string;
  inline?: boolean;
  className?: string;
  classes?: Record<string, string>;
  style?: CSSProperties;
};

export const Logo = memo(forwardRef(function Logo(
  {
    src,
    alt = defaultProps.alt,
    inline = defaultProps.inline,
    className,
    classes,
    style,
    ...rest
  }: LogoProps,
  ref: ForwardedRef<HTMLImageElement>,
) {
  const logoUrl = src ?? useLogoUrl();
  if (!logoUrl) {
    return null;
  }
  return (
    <Image
      {...rest}
      ref={ref}
      src={logoUrl}
      alt={alt}
      inline={inline}
      className={classnames(styles.logo, classes?.[COMPONENT_PART_KEY], className)}
      style={{ width: "auto", boxShadow: "none", ...style }}
    />
  );
}));
