import { CSSProperties, HTMLAttributes, forwardRef } from "react";
import classnames from "classnames";

import styles from "./Image.module.scss";

// =====================================================================================================================
// React Image component implementation

type Props = {
  src?: string;
  alt?: string;
  fit?: "cover" | "contain";
  style?: CSSProperties;
  className?: string;
  lazyLoad?: boolean;
  aspectRatio?: string;
  animation?: object;
  inline?: boolean;
} & Pick<HTMLAttributes<HTMLImageElement>, "onClick">;

export const defaultProps: Pick<Props, "fit" | "lazyLoad" | "inline"> = {
  fit: "contain",
  lazyLoad: false,
  inline: false,
};

export const Image = forwardRef(function Img(
  {
    src,
    alt,
    fit = defaultProps.fit,
    style,
    className,
    onClick,
    aspectRatio,
    lazyLoad = defaultProps.lazyLoad,
    inline = defaultProps.inline,
    ...rest
  }: Props,
  ref,
) {
  return (
    <img
      {...rest}
      src={src}
      ref={ref as any}
      alt={alt}
      loading={lazyLoad ? "lazy" : "eager"}
      className={classnames(
        styles.img,
        {
          [styles.clickable]: !!onClick,
        },
        className,
      )}
      style={{
        objectFit: fit,
        boxShadow: "none",
        ...style,
        flexShrink: 1,
        aspectRatio: aspectRatio,
        ...(inline ? { display: "inline" } : {}),
      }}
      onClick={onClick}
    />
  );
});
