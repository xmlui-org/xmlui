import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./FancyButton.module.scss";
import { Icon } from "xmlui";

// Define props interface
type Props = {
  id?: string;
  type?: "button" | "submit" | "reset";
  variant?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  autoFocus?: boolean;
  enabled?: boolean;
  icon?: string;
  iconPosition?: "start" | "end";
  contentPosition?: "start" | "center" | "end";
  contextualLabel?: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
} & React.HTMLAttributes<HTMLButtonElement>;

// Define default props
export const defaultProps: Required<
  Pick<Props, "type" | "variant" | "size" | "autoFocus" | "iconPosition" | "contentPosition">
> = {
  type: "button",
  variant: "rounded",
  size: "md",
  autoFocus: false,
  iconPosition: "start",
  contentPosition: "center",
};

// Component implementation with forwardRef
export const FancyButton = forwardRef<HTMLButtonElement, Props>(function FancyButton(
  {
    id,
    type = defaultProps.type,
    variant = defaultProps.variant,
    size = defaultProps.size,
    autoFocus = defaultProps.autoFocus,
    enabled = true,
    icon,
    iconPosition = defaultProps.iconPosition,
    contentPosition = defaultProps.contentPosition,
    contextualLabel,
    children,
    onClick,
    onFocus,
    onBlur,
    className,
    ...rest
  },
  ref,
) {
  const hasIcon = !!icon;
  const hasChildren = !!children;
  const isIconOnly = hasIcon && !hasChildren;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (enabled && onClick) {
      onClick(event);
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    if (enabled && onFocus) {
      onFocus(event);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    if (enabled && onBlur) {
      onBlur(event);
    }
  };

  const buttonClassNames = classnames(
    styles.fancyButton,
    {
      [styles.xs]: size === "xs",
      [styles.sm]: size === "sm",
      [styles.md]: size === "md",
      [styles.lg]: size === "lg",
      [styles.xl]: size === "xl",

      [styles.disabled]: !enabled,
      [styles.iconOnly]: isIconOnly,
      [styles.contentPositionStart]: contentPosition === "start",
      [styles.contentPositionCenter]: contentPosition === "center",
      [styles.contentPositionEnd]: contentPosition === "end",
      [styles.iconPositionEnd]: hasIcon && hasChildren && iconPosition === "end",

      [styles.rounded]: variant === "rounded",
      [styles.square]: variant === "square",
      [styles.pill]: variant === "pill",
      [styles.outlinedPill]: variant === "outlinedPill",
    },
    className,
  );

  const renderContent = () => {
    if (!hasIcon && !hasChildren) {
      return null;
    }

    if (isIconOnly) {
      return icon;
    }

    if (!hasIcon) {
      return children;
    }

    // Both icon and children
    const iconElement = icon && <Icon name={icon} aria-hidden />;
    const contentElement = <span className={styles.content}>{children}</span>;

    return (
      <>
        {iconElement}
        {contentElement}
      </>
    );
  };

  return (
    <button
      id={id}
      ref={ref}
      type={type}
      autoFocus={autoFocus}
      disabled={!enabled}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={buttonClassNames}
      aria-label={contextualLabel}
      {...rest}
    >
      {renderContent()}
    </button>
  );
});
