import React, { type CSSProperties, useRef, useEffect } from "react";
import classnames from "classnames";

import styles from "./Button.module.scss";

import {
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
import { composeRefs } from "@radix-ui/react-compose-refs";
import { VisuallyHidden } from "../VisuallyHidden";

type Props = {
  id?: string;
  type?: ButtonType;
  variant?: ButtonVariant;
  themeColor?: ButtonThemeColor;
  size?: SizeType;
  disabled?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  contentPosition?: AlignmentOptions;
  orientation?: OrientationOptions;
  formId?: string;
  style?: CSSProperties;
  gap?: string | number;
  autoFocus?: boolean;
  contextualLabel?: string;
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

export const Button = React.forwardRef(function Button(
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
    onFocus,
    onBlur,
    style,
    gap,
    className,
    autoFocus = defaultProps.autoFocus,
    contextualLabel,
    ...rest
  }: Props,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const innerRef = useRef<HTMLButtonElement>(null);
  const composedRef = ref ? composeRefs(ref, innerRef) : innerRef;
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        innerRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  if ((variant as any) === "") {
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
        className,
      )}
      autoFocus={autoFocus}
      disabled={disabled}
      form={formId}
      style={style}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {icon && iconToLeft && <>{icon}</>}
      {children}
      {icon && !children && <IconLabel icon={icon} accessibleName={contextualLabel} />}
      {icon && !iconToLeft && <>{icon}</>}
    </button>
  );
});

type IconLabelProps = {
  icon: React.ReactNode;
  accessibleName?: string;
};

const IconLabel = ({ icon, accessibleName = "" }: IconLabelProps) => {
  // NOTE: the icon object provided is a React object with accessible props attribute.
  // Typing might be off, because TS thinks props is not accessible.
  const iconProps: Record<string, any> | undefined = (icon as any).props;
  return (
    <VisuallyHidden>
      <span>{accessibleName || iconProps?.name || iconProps?.alt}</span>
    </VisuallyHidden>
  );
};
