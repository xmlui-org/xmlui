import React, { forwardRef, ReactNode } from "react";
import classnames from "classnames";
import styles from "./FancyButton.module.scss";

type Props = {
  id?: string;
  children?: ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "rounded" | "square";
  autoFocus?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  icon?: string;
  iconPosition?: "start" | "end";
  orientation?: "horizontal" | "vertical";
  contentPosition?: "start" | "center" | "end";
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  className?: string;
  contextualLabel?: string;
} & React.HTMLAttributes<HTMLButtonElement>;

export const defaultProps: Required<Pick<Props, "autoFocus" | "variant" | "size" | "type" | "orientation" | "iconPosition" | "contentPosition">> = {
  autoFocus: false,
  variant: "rounded",
  size: "md",
  type: "button",
  orientation: "horizontal",
  iconPosition: "start",
  contentPosition: "center",
};

export const FancyButton = forwardRef<HTMLButtonElement, Props>(
  function FancyButton(
    {
      children,
      type = defaultProps.type,
      variant = defaultProps.variant,
      autoFocus = defaultProps.autoFocus,
      size = defaultProps.size,
      icon,
      iconPosition = defaultProps.iconPosition,
      orientation = defaultProps.orientation,
      contentPosition = defaultProps.contentPosition,
      disabled = false,
      onClick,
      onFocus,
      onBlur,
      className,
      contextualLabel,
      ...rest
    },
    ref,
  ) {
    console.log("render");
    const hasIcon = Boolean(icon);
    const hasLabel = Boolean(children);
    const isIconOnly = hasIcon && !hasLabel;

    const buttonClassNames = classnames(
      styles.fancyButton,
      styles[`fancyButton--${variant}`],
      styles[`fancyButton--${size}`],
      {
        [styles[`fancyButton--${orientation}`]]: orientation,
        [styles[`fancyButton--${contentPosition}`]]: contentPosition,
        [styles[`fancyButton--iconOnly`]]: isIconOnly,
        [styles[`fancyButton--disabled`]]: disabled,
      },
      className,
    );

    const renderIcon = () => {
      if (!hasIcon) return null;
      // For now, we'll render the icon name as text since we don't have access to the Icon component
      // In a real implementation, you would import and use the Icon component
      return <span className={styles.fancyButton__icon}>{icon}</span>;
    };

    const renderContent = () => {
      if (isIconOnly) {
        return renderIcon();
      }

      const iconElement = renderIcon();
      const labelElement = children && <span className={styles.fancyButton__label}>{children}</span>;

      if (orientation === "horizontal") {
        return iconPosition === "start" ? (
          <>
            {iconElement}
            {labelElement}
          </>
        ) : (
          <>
            {labelElement}
            {iconElement}
          </>
        );
      } else {
        // Vertical orientation - icon always on top
        return (
          <>
            {iconElement}
            {labelElement}
          </>
        );
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        autoFocus={autoFocus}
        disabled={disabled}
        onClick={onClick}
        onFocus={onFocus}
        onBlur={onBlur}
        className={buttonClassNames}
        aria-label={contextualLabel}
        {...rest}
      >
        {renderContent()}
      </button>
    );
  },
);
