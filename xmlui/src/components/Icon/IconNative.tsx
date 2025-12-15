import { type CSSProperties, forwardRef, type ForwardedRef } from "react";
import type React from "react";
import styles from "./Icon.module.scss";
import { useCustomSvgIconRenderer, useIconRegistry } from "../IconRegistryContext";
import classnames from "classnames";
import { useResourceUrl, useTheme } from "../../components-core/theming/ThemeContext";
import { toCssVar } from "../../parsers/style-parser/StyleParser";
import type { IconRegistryEntry } from "../IconProvider";

export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  children?: React.ReactNode;
  color?: string;
  title?: string;
  size?: string;
  isInline?: boolean;
  fallback?: string;
  style?: CSSProperties;
  className?: string;
  tabIndex?: number;
  onKeyDown?: React.KeyboardEventHandler<any>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Icon = forwardRef(function Icon(
  {
    name,
    fallback,
    style,
    className,
    size,
    onClick,
    tabIndex,
    onKeyDown,
    ...restProps
  }: IconBaseProps,
  ref: ForwardedRef<HTMLElement>,
) {
  const { iconRenderer, iconName } = useFindIconRenderer(name, fallback);

  // Handle keyboard events for clickable icons
  const handleKeyDown = (event: React.KeyboardEvent<any>) => {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick(event as any);
    }
    onKeyDown?.(event);
  };

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
    "data-icon-name": iconName,
    onClick,
    onKeyDown: handleKeyDown,
    tabIndex: onClick ? (tabIndex ?? 0) : tabIndex,
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

  return (
    <span ref={ref} style={{ display: "inline-block" }}>
      {renderedIcon}
    </span>
  );
});

const CustomIcon = forwardRef(function CustomIcon(
  props: IconBaseProps & { size?: string; url: string },
  ref: ForwardedRef<HTMLElement>,
) {
  const { url, width, height, name, style, className, onClick, onKeyDown, tabIndex, ...rest } =
    props;

  // Handle keyboard events for clickable icons
  const handleKeyDown = (event: React.KeyboardEvent<any>) => {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick(event as any);
    }
    onKeyDown?.(event);
  };

  const resourceUrl = useResourceUrl(url);
  const isSvgIcon = resourceUrl?.toLowerCase()?.endsWith(".svg");
  const customSvgIconRenderer = useCustomSvgIconRenderer(resourceUrl);

  if (resourceUrl && isSvgIcon) {
    const renderedIcon = customSvgIconRenderer?.({
      style,
      className,
      onClick,
      onKeyDown: handleKeyDown,
      tabIndex: onClick ? (tabIndex ?? 0) : tabIndex,
      "data-icon-name": name,
      ...rest,
    });
    if (!renderedIcon) {
      //to prevent layout shift
      return (
        <span
          {...(rest as any)}
          data-icon-name={name}
          ref={ref as ForwardedRef<HTMLSpanElement>}
          style={style}
          className={className}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          tabIndex={onClick ? (tabIndex ?? 0) : tabIndex}
        />
      );
    }
    return renderedIcon;
  }

  return (
    <img
      ref={ref as ForwardedRef<HTMLImageElement>}
      src={resourceUrl}
      data-icon-name={name}
      style={{ width, height, ...style }}
      alt={name}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? (tabIndex ?? 0) : tabIndex}
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

function useFindIconRenderer(
  name?: string,
  fallback?: string,
): { iconRenderer: IconRegistryEntry | null; iconName: string | null } {
  const iconRegistry = useIconRegistry();

  if (name && typeof name === "string") {
    const separator = ":";
    const parts: string[] = name.split(separator);
    // Component specific icon
    if (parts.length > 1) {
      const iconRenderer = iconRegistry.lookupIconRenderer(
        `${parts[0].toLowerCase()}${separator}${parts[1]}`,
      );
      if (iconRenderer) {
        return { iconRenderer, iconName: name };
      }
    }
    // General icon
    if (parts.length === 1) {
      const iconRenderer = iconRegistry.lookupIconRenderer(parts[0]);
      if (iconRenderer) {
        return { iconRenderer, iconName: name };
      }
    }
  }

  if (fallback && typeof fallback === "string") {
    const iconRenderer = iconRegistry.lookupIconRenderer(fallback.toLowerCase());
    if (iconRenderer) {
      return { iconRenderer, iconName: fallback };
    }
  }
  return { iconRenderer: null, iconName: null };
}

export default Icon;
