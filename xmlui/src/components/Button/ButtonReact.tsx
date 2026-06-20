import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { forwardRef, useEffect, useRef } from "react";

import {
  resolveThemeReferences,
  resolveThemeVariable,
} from "../../styling/theme";
import { defaultProps } from "./Button.defaults";

export type ButtonProps = {
  id?: string;
  type?: "button" | "submit" | "reset" | string;
  variant?: string;
  themeColor?: string;
  size?: string;
  icon?: ReactNode;
  iconPosition?: string;
  contentPosition?: string;
  orientation?: string;
  contextualLabel?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onContextMenu?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  children?: ReactNode;
  themeVariables: Record<string, unknown>;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    type = defaultProps.type,
    variant = defaultProps.variant,
    themeColor = defaultProps.themeColor,
    size = defaultProps.size,
    icon,
    iconPosition = defaultProps.iconPosition,
    contentPosition = defaultProps.contentPosition,
    orientation = defaultProps.orientation,
    contextualLabel,
    autoFocus = defaultProps.autoFocus,
    disabled,
    className,
    style,
    children,
    themeVariables,
    ...rest
  },
  ref,
) {
  const innerRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    const timeoutId = setTimeout(() => innerRef.current?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, [autoFocus]);

  const normalizedIcon = normalizeIcon(icon);
  const iconToLeft = iconPosition === "start";
  const hasChildren = children !== undefined && children !== null;
  const buttonStyle = {
    ...baseButtonStyle(themeVariables, { variant, themeColor, size, orientation, contentPosition }),
    ...style,
  };

  return (
    <button
      {...rest}
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      type={normalizeButtonType(type)}
      className={className}
      disabled={disabled}
      style={buttonStyle}
      data-xmlui-button-variant={variant}
      data-xmlui-button-theme-color={themeColor}
      data-xmlui-button-size={size}
      data-xmlui-button-orientation={orientation}
    >
      {normalizedIcon && iconToLeft ? <ButtonIcon icon={normalizedIcon} /> : null}
      {children}
      {normalizedIcon && !hasChildren ? (
        <span style={visuallyHiddenStyle}>{contextualLabel ?? normalizedIcon}</span>
      ) : null}
      {normalizedIcon && !iconToLeft ? <ButtonIcon icon={normalizedIcon} /> : null}
    </button>
  );
});

function baseButtonStyle(
  themeVariables: Record<string, unknown>,
  options: {
    variant: string;
    themeColor: string;
    size: string;
    orientation: string;
    contentPosition: string;
  },
): CSSProperties {
  const horizontal = options.orientation !== "vertical";
  const size = validSize(options.size);
  const variant = validVariant(options.variant);
  const themeColor = validThemeColor(options.themeColor);
  const paddingHorizontal = themeValue(themeVariables, `paddingHorizontal-Button-${size}`);
  const paddingVertical = themeValue(themeVariables, `paddingVertical-Button-${size}`);
  const border = themeValue(themeVariables, `border-Button-${themeColor}-${variant}`);
  const borderWidth =
    exactThemeValue(themeVariables, `borderWidth-Button-${themeColor}-${variant}`)
    ?? (border ? borderWidthFromShorthand(border) : themeValue(themeVariables, "borderWidth-Button"));
  const borderStyle =
    exactThemeValue(themeVariables, `borderStyle-Button-${themeColor}-${variant}`)
    ?? (border ? undefined : themeValue(themeVariables, "borderStyle-Button"));
  return {
    width: themeValue(themeVariables, horizontal ? "width-Button" : "width-Button-vertical"),
    height: themeValue(themeVariables, horizontal ? "height-Button" : "height-Button-vertical"),
    minWidth: 0,
    margin: 0,
    padding: paddingHorizontal && paddingVertical
      ? `${paddingVertical} ${paddingHorizontal}`
      : themeValue(themeVariables, "padding-Button"),
    border,
    borderWidth,
    borderStyle,
    borderColor: buttonBorderColor(themeVariables, variant, themeColor),
    borderRadius:
      exactThemeValue(themeVariables, `borderRadius-Button-${themeColor}-${variant}`)
      ?? themeValue(themeVariables, "borderRadius-Button"),
    background: buttonBackground(themeVariables, variant, themeColor),
    color: buttonTextColor(themeVariables, variant, themeColor),
    boxShadow: themeValue(themeVariables, "boxShadow-Button"),
    fontFamily:
      exactThemeValue(themeVariables, `fontFamily-Button-${themeColor}-${variant}`)
      ?? themeValue(themeVariables, "fontFamily-Button"),
    fontSize:
      exactThemeValue(themeVariables, `fontSize-Button-${themeColor}-${variant}`)
      ?? themeValue(themeVariables, "fontSize-Button"),
    fontWeight:
      exactThemeValue(themeVariables, `fontWeight-Button-${themeColor}-${variant}`)
      ?? themeValue(themeVariables, "fontWeight-Button"),
    fontStyle: themeValue(themeVariables, "fontStyle-Button"),
    lineHeight: "normal",
    transition: themeValue(themeVariables, "transition-Button"),
    userSelect: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: horizontal ? "row" : "column",
    gap: themeValue(themeVariables, horizontal ? "gap-Button" : "gap-Button-vertical"),
    justifyContent: contentJustify(options.contentPosition),
    alignItems: "center",
  };
}

function borderWidthFromShorthand(border: string | undefined): string | undefined {
  if (!border) {
    return undefined;
  }
  return border.split(/\s+/).find((part) => /^-?\d*\.?\d+(px|em|rem|%)$/.test(part));
}

function buttonBackground(themeVariables: Record<string, unknown>, variant: string, themeColor: string): string | undefined {
  const exact = themeValue(themeVariables, `backgroundColor-Button-${themeColor}-${variant}`);
  if (exact) {
    return exact;
  }
  if (variant === "solid") {
    return themeValue(themeVariables, `backgroundColor-Button-${themeColor}`);
  }
  return variant === "outlined" || variant === "ghost"
    ? "transparent"
    : themeValue(themeVariables, "backgroundColor-Button");
}

function buttonBorderColor(themeVariables: Record<string, unknown>, variant: string, themeColor: string): string | undefined {
  return themeValue(themeVariables, `borderColor-Button-${themeColor}-${variant}`)
    ?? (variant === "solid" ? themeValue(themeVariables, `borderColor-Button-${themeColor}`) : undefined)
    ?? themeValue(themeVariables, "borderColor-Button");
}

function buttonTextColor(themeVariables: Record<string, unknown>, variant: string, themeColor: string): string | undefined {
  const exact = themeValue(themeVariables, `textColor-Button-${themeColor}-${variant}`);
  if (exact) {
    return exact;
  }
  if (variant === "solid") {
    return themeValue(themeVariables, "textColor-Button-solid");
  }
  return themeValue(themeVariables, "textColor-Button");
}

function themeValue(themeVariables: Record<string, unknown>, name: string): string | undefined {
  const value = resolveThemeVariable(name, [themeVariables]);
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(resolveThemeReferences(value));
}

function exactThemeValue(themeVariables: Record<string, unknown>, name: string): string | undefined {
  const value = themeVariables[name];
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(resolveThemeReferences(value));
}

function validSize(value: string): string {
  return ["xs", "sm", "md", "lg"].includes(value) ? value : defaultProps.size;
}

function validVariant(value: string): string {
  return ["solid", "outlined", "ghost"].includes(value) ? value : defaultProps.variant;
}

function validThemeColor(value: string): string {
  return ["primary", "secondary", "attention"].includes(value) ? value : defaultProps.themeColor;
}

function normalizeButtonType(value: string): "button" | "submit" | "reset" {
  return value === "submit" || value === "reset" ? value : "button";
}

function normalizeIcon(icon: ReactNode): string | undefined {
  return typeof icon === "string" && icon !== "" && icon !== "_" ? icon : undefined;
}

function ButtonIcon({ icon }: { icon: string }) {
  return (
    <span
      aria-hidden="true"
      data-icon={icon}
      data-xmlui-component="Button"
      data-xmlui-part="icon"
      style={iconStyle}
    />
  );
}

function contentJustify(value: string): CSSProperties["justifyContent"] {
  if (value === "start") {
    return "start";
  }
  if (value === "end") {
    return "end";
  }
  return "center";
}

const visuallyHiddenStyle: CSSProperties = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  width: 1,
  whiteSpace: "nowrap",
};

const iconStyle: CSSProperties = {
  display: "inline-block",
  flex: "0 0 auto",
  width: "1em",
  height: "1em",
  backgroundColor: "currentColor",
  mask: "radial-gradient(circle, black 55%, transparent 56%)",
  WebkitMask: "radial-gradient(circle, black 55%, transparent 56%)",
};
