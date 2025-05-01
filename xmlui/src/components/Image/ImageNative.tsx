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
  lazyLoad?: boolean;
  aspectRatio?: string;
  animation?: object;
} & Pick<HTMLAttributes<HTMLImageElement>, "onClick">;

export const Image = forwardRef(function Img(
  { src, alt, fit = "contain", style, onClick, aspectRatio, lazyLoad }: Props,
  ref,
) {
  return (
    <img
      src={src}
      ref={ref as any}
      alt={alt}
      loading={lazyLoad ? "lazy" : "eager"}
      className={classnames(styles.img, {
        [styles.clickable]: !!onClick,
      })}
      style={{ objectFit: fit, boxShadow: "none", ...style, flexShrink: 1, aspectRatio: aspectRatio }}
      onClick={onClick}
    />
  );
});
