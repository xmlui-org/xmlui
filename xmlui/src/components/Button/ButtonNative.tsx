import styles from "./Button.module.scss";

import classnames from "@components-core/utils/classnames";
import type {
  ButtonType,
  ButtonVariant,
  ButtonThemeColor,
  ComponentSize,
  IconPosition,
  AlignmentOptions,
  OrientationOptions,
  ButtonAria,
} from "@components/abstractions";
import React, { type CSSProperties, useRef, useImperativeHandle, useEffect } from "react";

type Props = {
  id?: string;
  type?: ButtonType;
  variant?: ButtonVariant;
  themeColor?: ButtonThemeColor;
  size?: ComponentSize;
  disabled?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  contentPosition?: AlignmentOptions;
  orientation?: OrientationOptions;
  formId?: string;
  style?: CSSProperties;
  gap?: string | number;
  accessibilityProps?: any;
  autoFocus?: boolean;
} & Pick<
  React.HTMLAttributes<HTMLButtonElement>,
  | "onClick"
  | "onFocus"
  | "onBlur"
  | "onMouseEnter"
  | "onMouseLeave"
  | ButtonAria
  | "tabIndex"
  | "className"
>;

export const Button = React.forwardRef(function Button(
  {
    id,
    type = "button",
    icon,
    iconPosition = "left",
    contentPosition = "center",
    orientation = "horizontal",
    variant = "solid",
    themeColor = "primary",
    size = "sm",
    disabled,
    children,
    formId,
    onClick,
    onFocus,
    onBlur,
    style,
    gap,
    className,
    autoFocus,
    ...rest
  }: Props,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const innerRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => innerRef.current!);
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        innerRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  const iconToLeft = iconPosition === "left" || iconPosition === "start";

  return (
    <button
      {...rest}
      id={id}
      type={type}
      ref={innerRef}
      className={classnames(className, styles.button, {
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
      })}
      autoFocus={autoFocus}
      disabled={disabled}
      form={formId}
      style={style}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {iconToLeft && icon}
      {children}
      {!iconToLeft && icon}
    </button>
  );
});
