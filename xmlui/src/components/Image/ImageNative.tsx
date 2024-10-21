import styles from "./Image.module.scss";
import type { CSSProperties, HTMLAttributes } from "react";
import { forwardRef } from "react";
import classnames from "@components-core/utils/classnames";

// =====================================================================================================================
// React Image component implementation

type Props = {
  src?: string;
  alt?: string;
  fit?: "cover" | "contain";
  layout?: CSSProperties;
  lazyLoad?: boolean;
  aspectRatio?: string;
} & Pick<HTMLAttributes<HTMLImageElement>, "onClick">;

export const Image = forwardRef(function Img(
  { src, alt, fit = "contain", layout, onClick, aspectRatio, lazyLoad }: Props,
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
      style={{ objectFit: fit, boxShadow: "none", ...layout, aspectRatio: aspectRatio }}
      onClick={onClick}
    />
  );
});
