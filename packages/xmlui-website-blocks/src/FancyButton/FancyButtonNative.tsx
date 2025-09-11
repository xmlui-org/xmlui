import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./FancyButton.module.scss";

// Define props interface
type Props = {
  id?: string;
  type?: "button" | "submit" | "reset";
  variant?: "rounded" | "square";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  autoFocus?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  orientation?: "horizontal" | "vertical";
  contentPosition?: "start" | "center" | "end";
  contextualLabel?: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
} & React.HTMLAttributes<HTMLButtonElement>;

// Define default props
export const defaultProps: Required<Pick<Props, "type" | "variant" | "size" | "autoFocus" | "iconPosition" | "orientation" | "contentPosition">> = {
  type: "button",
  variant: "rounded",
  size: "md",
  autoFocus: false,
  iconPosition: "start",
  orientation: "horizontal",
  contentPosition: "center",
};

// Component implementation with forwardRef
export const FancyButton = forwardRef<HTMLButtonElement, Props>(
  function FancyButton(
    {
      id,
      type = defaultProps.type,
      variant = defaultProps.variant,
      size = defaultProps.size,
      autoFocus = defaultProps.autoFocus,
      disabled = false,
      icon,
      iconPosition = defaultProps.iconPosition,
      orientation = defaultProps.orientation,
      contentPosition = defaultProps.contentPosition,
      contextualLabel,
      children,
      onClick,
      onFocus,
      onBlur,
      className,
      ...rest
    },
    ref
  ) {

    const hasIcon = !!icon;
    const hasChildren = !!children;
    const isIconOnly = hasIcon && !hasChildren;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && onClick) {
        onClick(event);
      }
    };

    const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
      if (!disabled && onFocus) {
        onFocus(event);
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
      if (!disabled && onBlur) {
        onBlur(event);
      }
    };

    const buttonClassNames = classnames(
      styles.fancyButton,
      styles[`fancyButton--${variant}`],
      
      {
        [styles.xs]: size === "xs",
        [styles.sm]: size === "sm",
        [styles.md]: size === "md",
        [styles.lg]: size === "lg",
        [styles.xl]: size === "xl",

        [styles.disabled]: disabled,
        [styles.iconOnly]: isIconOnly,
        [styles.orientationVertical]: orientation === "vertical",
        [styles.orientationHorizontal]: orientation === "horizontal",
        [styles.contentPositionStart]: contentPosition === "start",
        [styles.contentPositionCenter]: contentPosition === "center",
        [styles.contentPositionEnd]: contentPosition === "end",
        [styles.iconPositionEnd]: hasIcon && hasChildren && iconPosition === "end",

        [styles.rounded]: variant === "rounded",
        [styles.square]: variant === "square",
      },
      className
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
      const iconElement = <span className={styles.icon}>{icon}</span>;
      const contentElement = <span className={styles.content}>{children}</span>;

      if (iconPosition === "end") {
        return (
          <>
            {contentElement}
            {icon}
          </>
        );
      }

      return (
        <>
          {icon}
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
        disabled={disabled}
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
  }
);
