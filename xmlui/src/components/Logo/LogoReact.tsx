import { forwardRef, memo, type CSSProperties, type ForwardedRef } from "react";

import { Image } from "../Image/ImageReact";
import { defaultProps } from "./Logo.defaults";
import styles from "./Logo.module.scss";

export type LogoProps = {
  src?: string;
  alt?: string;
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
};

export const Logo = memo(forwardRef(function Logo(
  {
    src,
    alt = defaultProps.alt,
    inline = defaultProps.inline,
    className,
    style,
    ...rest
  }: LogoProps,
  ref: ForwardedRef<HTMLImageElement>,
) {
  if (!src) {
    return null;
  }
  return (
    <Image
      {...rest}
      ref={ref}
      src={src}
      alt={alt}
      inline={inline}
      className={[styles.logo, className].filter(Boolean).join(" ")}
      style={style}
    />
  );
}));
