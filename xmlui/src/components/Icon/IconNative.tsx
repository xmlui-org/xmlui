import { type CSSProperties, forwardRef, type ForwardedRef, cloneElement } from "react";
import type React from "react";
import styles from "./Icon.module.scss";
import { useCustomSvgIconRenderer, useIconRegistry } from "../IconRegistryContext";
import classnames from "classnames";
import { useResourceUrl, useTheme } from "../../components-core/theming/ThemeContext";
import { toCssVar } from "../../parsers/style-parser/StyleParser";
import { composeRefs } from "@radix-ui/react-compose-refs";

export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  children?: React.ReactNode;
  color?: string;
  title?: string;
  size?: string;
  isInline?: boolean;
  fallback?: string;
  style?: CSSProperties;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Icon = forwardRef(function Icon(
  { name, fallback, style, className, size, onClick, ...restProps }: IconBaseProps,
  ref: ForwardedRef<HTMLElement>,
) {
  const iconRenderer = useFindIconRenderer(name, fallback);

  const computedSize = typeof size === "string" ? mapSizeToIconPack(size) : size;
  const width = computedSize || restProps.width;
  const height = computedSize || restProps.height;
  const computedProps = {
    // className is needed to apply a default color to the icon, thus other component classes can override this one
    className: classnames(styles.base, className, { [styles.clickable]: !!onClick }),
    ...restProps,
    size: computedSize,
    width: width,
    height: height,
    style: {
      ...style,
      "--icon-width": width,
      "--icon-height": height,
    },
    onClick,
  };

  // ---
  const customIconUrl = useCustomIconUrl(name);
  if (customIconUrl) {
    return <CustomIcon {...computedProps} url={customIconUrl} name={name} ref={ref} />;
  }

  const renderedIcon = iconRenderer?.renderer?.(computedProps, ref);
  if (!renderedIcon) {
    return null;
  }

  return <span ref={ref} style={{ display: "contents" }}>{renderedIcon}</span>;
});

const CustomIcon = forwardRef(function CustomIcon(
  props: IconBaseProps & { size?: string; url: string },
  ref: ForwardedRef<HTMLElement>,
) {
  const { url, width, height, name, style, className, ...rest } = props;

  const resourceUrl = useResourceUrl(url);
  const isSvgIcon = resourceUrl?.toLowerCase()?.endsWith(".svg");
  const customSvgIconRenderer = useCustomSvgIconRenderer(resourceUrl);

  if (resourceUrl && isSvgIcon) {
    const renderedIcon = customSvgIconRenderer?.({ style, className, ...rest });
    if (!renderedIcon) {
      //to prevent layout shift
      return (
        <span
          {...(rest as any)}
          ref={ref as ForwardedRef<HTMLSpanElement>}
          style={style}
          className={className}
        />
      );
    }
    return renderedIcon;
  }

  return (
    <img
      ref={ref as ForwardedRef<HTMLImageElement>}
      src={resourceUrl}
      style={{ width, height, ...style }}
      alt={name}
      {...(rest as any)}
    />
  );
});

function useCustomIconUrl(iconName?: string) {
  const { getResourceUrl } = useTheme();
  if (!iconName) {
    return iconName;
  }
  return getResourceUrl(`resource:icon.${iconName}`);
}

function mapSizeToIconPack(size: string) {
  if (/^\$[a-zA-Z0-9_$-]+$/g.test(size)) {
    return toCssVar(size);
  }
  return (
    {
      xs: "0.75em",
      sm: "1em",
      md: "1.5rem",
      lg: "2em",
    }[size] || size
  );
}

function useFindIconRenderer(name?: string, fallback?: string) {
  const iconRegistry = useIconRegistry();

  if (name && typeof name === "string") {
    const separator = ":";
    const parts: string[] = name.split(separator);
    // Component specific icon
    if (parts.length > 1) {
      const iconRenderer = iconRegistry.lookupIconRenderer(
        `${parts[0].toLowerCase()}${separator}${parts[1]}`,
      );
      if (iconRenderer) return iconRenderer;
    }
    // General icon
    if (parts.length === 1) {
      const iconRenderer = iconRegistry.lookupIconRenderer(parts[0]);
      if (iconRenderer) return iconRenderer;
    }
  }

  if (fallback && typeof fallback === "string") {
    const iconRenderer = iconRegistry.lookupIconRenderer(fallback.toLowerCase());
    if (iconRenderer) return iconRenderer;
  }
  return null;
}

export default Icon;
