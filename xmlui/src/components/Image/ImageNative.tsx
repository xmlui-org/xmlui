import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import classnames from "classnames";

import styles from "./Image.module.scss";

// =====================================================================================================================
// React Image component implementation

type Props = {
  src?: string;
  alt?: string;
  imageData?: Blob | any;
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
    imageData,
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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const blobToRender = useMemo(() => {
    if (!imageData || !(imageData instanceof Blob)) {
      return undefined;
    }
    return imageData;
  }, [imageData]);

  // Handle Blob data when src is empty
  useEffect(() => {
    if (!src && blobToRender) {
      const url = URL.createObjectURL(blobToRender);
      setBlobUrl(url);

      // Cleanup function to revoke the blob URL
      return () => {
        URL.revokeObjectURL(url);
        setBlobUrl(null);
      };
    } else {
      // Clean up any existing blob URL if src is provided or imageData is not a Blob
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    }
  }, [src, blobToRender, blobUrl]);

  src = safeConvertPropToString(src);
  alt = safeConvertPropToString(alt);

  // Use blob URL if src is empty and we have a blob URL
  const imageSrc = src || blobUrl;
  return (
    <img
      {...rest}
      src={imageSrc}
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

function safeConvertPropToString(prop: unknown): string | undefined {
  if (typeof prop === "string") return prop;
  if (
    prop != null &&
    typeof prop !== "object" &&
    typeof prop !== "function" &&
    !Number.isNaN(prop)
  ) {
    return String(prop);
  }
  return undefined;
}
