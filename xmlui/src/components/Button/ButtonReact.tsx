import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { forwardRef, useEffect, useRef } from "react";

import { defaultProps } from "./Button.defaults";
import styles from "./Button.module.scss?xmlui-css-module";

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
  const normalizedVariant = validVariant(variant);
  const normalizedThemeColor = validThemeColor(themeColor);
  const normalizedSize = validSize(size);
  const normalizedOrientation = validOrientation(orientation);

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
      className={cx(
        styles.button,
        normalizedOrientation === "horizontal" ? styles.buttonHorizontal : styles.buttonVertical,
        styles[normalizedSize],
        variantThemeClass(normalizedVariant, normalizedThemeColor),
        contentPosition === "start" ? styles.alignStart : undefined,
        contentPosition === "end" ? styles.alignEnd : undefined,
        className,
      )}
      disabled={disabled}
      style={style}
      data-xmlui-button-variant={normalizedVariant}
      data-xmlui-button-theme-color={normalizedThemeColor}
      data-xmlui-button-size={normalizedSize}
      data-xmlui-button-orientation={normalizedOrientation}
    >
      {normalizedIcon && iconToLeft ? <ButtonIcon icon={normalizedIcon} /> : null}
      {children}
      {normalizedIcon && !hasChildren ? (
        <span className={styles.visuallyHidden}>{contextualLabel ?? normalizedIcon}</span>
      ) : null}
      {normalizedIcon && !iconToLeft ? <ButtonIcon icon={normalizedIcon} /> : null}
    </button>
  );
});

function validSize(value: string): string {
  return ["xs", "sm", "md", "lg"].includes(value) ? value : defaultProps.size;
}

function validVariant(value: string): string {
  return ["solid", "outlined", "ghost"].includes(value) ? value : defaultProps.variant;
}

function validThemeColor(value: string): string {
  return ["primary", "secondary", "attention"].includes(value) ? value : defaultProps.themeColor;
}

function validOrientation(value: string): string {
  return value === "vertical" ? "vertical" : defaultProps.orientation;
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
      className={styles.icon}
    />
  );
}

function variantThemeClass(variant: string, themeColor: string): string | undefined {
  const className = `${variant}${themeColor[0]?.toUpperCase() ?? ""}${themeColor.slice(1)}`;
  return styles[className];
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
