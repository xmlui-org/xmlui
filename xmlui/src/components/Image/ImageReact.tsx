import {
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";
import classnames from "classnames";

import styles from "./Image.module.scss";
import { defaultProps } from "./Image.defaults";

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
  grayscale?: boolean;
} & Pick<HTMLAttributes<HTMLImageElement>, "onClick">;

export const Image = memo(forwardRef(function Img(
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
    grayscale = defaultProps.grayscale,
    ...rest
  }: Props,
  ref: ForwardedRef<HTMLImageElement>,
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
  const normalizedFit = fit === "cover" || fit === "contain" ? fit : defaultProps.fit;
  const imageStyle = {
    "--xmlui-objectFit-Image": normalizedFit,
    ...(aspectRatio ? { "--xmlui-aspectRatio-Image": normalizeAspectRatio(aspectRatio) } : {}),
    boxShadow: "none",
    ...style,
    flexShrink: 1,
  } as CSSProperties;

  return (
    <img
      {...rest}
      src={imageSrc}
      ref={ref}
      alt={alt}
      loading={lazyLoad ? "lazy" : "eager"}
      className={classnames(
        styles.img,
        "xmlui-imageRoot",
        {
          [styles.clickable]: !!onClick,
          [styles.grayscale]: grayscale,
          [styles.inline]: inline,
          "xmlui-imageInline": inline,
          "xmlui-imageInlineWrapper": inline,
        },
        className,
      )}
      style={imageStyle}
      onClick={onClick}
    />
  );
}));

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

function normalizeAspectRatio(aspectRatio: string): string {
  return aspectRatio.includes("/") ? aspectRatio.replace(/\s*\/\s*/g, " / ") : aspectRatio;
}
