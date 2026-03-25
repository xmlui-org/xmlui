import React, { type CSSProperties, type ForwardedRef, forwardRef, memo, useRef, useEffect } from "react";
import classnames from "classnames";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { PART_ICON } from "../../components-core/parts";
import { Part } from "../Part/Part";

import styles from "./Button.module.scss";

import {
  buttonVariantValues,
  isSizeType,
  type SizeType,
  type AlignmentOptions,
  type ButtonAria,
  type ButtonThemeColor,
  type ButtonType,
  type ButtonVariant,
  type IconPosition,
  type OrientationOptions,
} from "../abstractions";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { VisuallyHidden } from "../VisuallyHidden";

type Props = {
  id?: string;
  type?: ButtonType;
  variant?: ButtonVariant;
  themeColor?: ButtonThemeColor;
  size?: SizeType;
  disabled?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  contentPosition?: AlignmentOptions;
  orientation?: OrientationOptions;
  formId?: string;
  style?: CSSProperties;
  autoFocus?: boolean;
  contextualLabel?: string;
  classes?: Record<string, string>;
} & Pick<
  React.HTMLAttributes<HTMLButtonElement>,
  | "onClick"
  | "onContextMenu"
  | "onFocus"
  | "onBlur"
  | "onMouseEnter"
  | "onMouseLeave"
  | ButtonAria
  | "tabIndex"
  | "className"
  | "role"
>;

export const defaultProps: Pick<
  Props,
  | "type"
  | "iconPosition"
  | "contentPosition"
  | "orientation"
  | "variant"
  | "themeColor"
  | "size"
  | "autoFocus"
> = {
  type: "button",
  iconPosition: "start",
  contentPosition: "center",
  orientation: "horizontal",
  variant: "solid",
  themeColor: "primary",
  size: "sm",
  autoFocus: false,
};

export const Button = memo(forwardRef(function Button(
  {
    id,
    type = defaultProps.type,
    icon,
    iconPosition = defaultProps.iconPosition,
    contentPosition = defaultProps.contentPosition,
    orientation = defaultProps.orientation,
    variant = defaultProps.variant,
    themeColor = defaultProps.themeColor,
    size = defaultProps.size,
    disabled,
    children,
    formId,
    onClick,
    onContextMenu,
    onFocus,
    onBlur,
    style,
    classes,
    className,
    autoFocus = defaultProps.autoFocus,
    contextualLabel,
    ...rest
  }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const innerRef = useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRefs(ref, innerRef);
  useEffect(() => {
    if (!autoFocus) return;
    const timeoutId = setTimeout(() => innerRef.current?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, [autoFocus]);

  if (!variant || !buttonVariantValues.includes(variant as ButtonVariant)) {
    variant = defaultProps.variant;
  }
  const iconToLeft = iconPosition === "start";

  if (!isSizeType(size)) {
    size = defaultProps.size;
  }
  return (
    <button
      {...rest}
      id={id}
      type={type}
      ref={composedRef}
      className={classnames(
        styles.button,
        {
          [styles.buttonHorizontal]: orientation === "horizontal",
          [styles.buttonVertical]: orientation === "vertical",
          [styles.xs]: size === "xs",
          [styles.sm]: size === "sm",
          [styles.md]: size === "md",
          [styles.lg]: size === "lg",
          [styles.solidPrimary]: variant === "solid" && themeColor === "primary",
          [styles.solidSecondary]: variant === "solid" && themeColor === "secondary",
          [styles.solidAttention]: variant === "solid" && themeColor === "attention",
          [styles.outlinedPrimary]: variant === "outlined" && themeColor === "primary",
          [styles.outlinedSecondary]: variant === "outlined" && themeColor === "secondary",
          [styles.outlinedAttention]: variant === "outlined" && themeColor === "attention",
          [styles.ghostPrimary]: variant === "ghost" && themeColor === "primary",
          [styles.ghostSecondary]: variant === "ghost" && themeColor === "secondary",
          [styles.ghostAttention]: variant === "ghost" && themeColor === "attention",
          [styles.alignStart]: contentPosition === "start",
          [styles.alignEnd]: contentPosition === "end",
        },
        classes?.[COMPONENT_PART_KEY],
        className,
      )}
      disabled={disabled}
      form={formId}
      style={style}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {icon && iconToLeft && (
        <Part partId={PART_ICON}>
          <span className={classes?.[PART_ICON]}>{icon}</span>
        </Part>
      )}
      {children}
      {icon && !children && <IconLabel icon={icon} accessibleName={contextualLabel} />}
      {icon && !iconToLeft && (
        <Part partId={PART_ICON}>
          <span className={classes?.[PART_ICON]}>{icon}</span>
        </Part>
      )}
    </button>
  );
}));

type IconLabelProps = {
  icon: React.ReactNode;
  accessibleName?: string;
};

const IconLabel = memo(function IconLabel({ icon, accessibleName = "" }: IconLabelProps) {
  const iconProps = React.isValidElement(icon)
    ? (icon.props as Record<string, unknown>)
    : undefined;
  const label = accessibleName || (iconProps?.name as string) || (iconProps?.alt as string) || "";
  return (
    <VisuallyHidden>
      <span>{label}</span>
    </VisuallyHidden>
  );
});

