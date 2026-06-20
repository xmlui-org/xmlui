import {
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
} from "react";

import { defaultProps } from "./Image.defaults";

type ImageProps = {
  src?: string;
  alt?: unknown;
  imageData?: unknown;
  fit?: string;
  style?: CSSProperties;
  lazyLoad?: boolean;
  aspectRatio?: string;
  inline?: boolean;
  grayscale?: boolean;
} & Pick<HTMLAttributes<HTMLImageElement>, "onClick"> &
  Omit<HTMLAttributes<HTMLImageElement>, "alt" | "src" | "onClick">;

export const Image = memo(forwardRef(function Image(
  {
    src,
    alt,
    imageData,
    fit = defaultProps.fit,
    style,
    onClick,
    aspectRatio,
    lazyLoad = defaultProps.lazyLoad,
    inline = defaultProps.inline,
    grayscale = defaultProps.grayscale,
    ...rest
  }: ImageProps,
  ref: ForwardedRef<HTMLImageElement>,
) {
  const [blobUrl, setBlobUrl] = useState<string | undefined>();
  const blobToRender = useMemo(
    () => {
      if (imageData instanceof Blob) {
        return imageData;
      }
      if (typeof imageData === "string" && imageData !== "") {
        return new Blob([imageData]);
      }
      return undefined;
    },
    [imageData],
  );

  useEffect(() => {
    if (src || !blobToRender) {
      setBlobUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(blobToRender);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blobToRender, src]);

  const imageSrc = safeString(src) || blobUrl;
  const altText = safeString(alt);
  const imageFit = validFit(fit);
  const imageElement = (
    <img
      {...rest}
      ref={ref}
      src={imageSrc}
      alt={altText}
      loading={lazyLoad ? "lazy" : "eager"}
      className={cx(
        "xmlui-imageRoot",
        inline ? "xmlui-imageInline" : undefined,
        grayscale ? "xmlui-imageGrayscale" : undefined,
        onClick ? "xmlui-imageClickable" : undefined,
        rest.className,
      )}
      style={{
        ...style,
        ...imageCssVariables(imageFit, aspectRatio),
      }}
      onClick={onClick}
    />
  );

  return inline ? (
    <span className="xmlui-imageInlineWrapper">
      {imageElement}
    </span>
  ) : imageElement;
}));

function safeString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (
    value !== null &&
    value !== undefined &&
    typeof value !== "object" &&
    typeof value !== "function" &&
    !Number.isNaN(value)
  ) {
    return String(value);
  }
  return undefined;
}

function validFit(value: unknown): string {
  return value === "cover" || value === "contain" ? value : defaultProps.fit;
}

function aspectRatioValue(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  return value.includes("/") ? value.replace(/\s*\/\s*/, " / ") : value;
}

function imageCssVariables(fit: string, aspectRatio: string | undefined): CSSProperties {
  const style: Record<string, string> = {
    "--xmlui-objectFit-Image": fit,
  };
  const normalizedAspectRatio = aspectRatioValue(aspectRatio);
  if (normalizedAspectRatio) {
    style["--xmlui-aspectRatio-Image"] = normalizedAspectRatio;
  }
  return style as CSSProperties;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
