import React, { type CSSProperties, useEffect, useImperativeHandle, useRef } from "react";
import styles from "./Button.module.scss";
import classnames from "@components-core/utils/classnames";
import { Icon } from "@components/Icon/Icon";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import type { PropertyComponentDescriptorHash } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";

// ====================================================================================================================
// React Button component implementation

type Props = {
  id?: string;
  type?: ButtonType;
  variant?: ButtonVariant;
  themeColor?: ButtonThemeColor;
  size?: ButtonSize;
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
  title?: string;
} & Pick<
  React.HTMLAttributes<HTMLButtonElement>,
  "onClick" | "onFocus" | "onBlur" | ButtonAria | "tabIndex" | "className"
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
    title,
    ...rest
  }: Props,
  ref: React.ForwardedRef<HTMLButtonElement>
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
      title={title}
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

// ====================================================================================================================
// XMLUI Button definition

export type ButtonSize = "xs" | "sm" | "md" | "lg";
export type AlignmentOptions = "start" | "center" | "end";
export type ButtonThemeColor = "attention" | "primary" | "secondary";
export type ButtonType = "button" | "submit" | "reset";
export type ButtonVariant = "solid" | "outlined" | "ghost";
export type OrientationOptions = "horizontal" | "vertical";
export type ButtonAria = "aria-controls" | "aria-expanded" | "aria-disabled" | "aria-label";
export type IconPosition = "left" | "right" | "start" | "end";

/**
 * \`Button\` is an interactive element that triggers an action when clicked.
 */
export interface ButtonComponentDef extends ComponentDef<"Button"> {
  props: {
    /** @descriptionRef */
    label?: string;
    /** @descriptionRef */
    type?: ButtonType;
    /** @descriptionRef */
    enabled?: boolean;
    /** @descriptionRef */
    icon?: string;
    /** @defaultValue left */
    iconPosition?: IconPosition;
    /** @descriptionRef */
    contentPosition?: "start" | "end" | "center";
    /** @internal */
    autoFocus?: string;
    /** @internal */
    title?: string;
    /** @descriptionRef */
    variant?: ButtonVariant;
    /** @descriptionRef */
    themeColor?: ButtonThemeColor;
    /** @descriptionRef */
    size?: ButtonSize;
  };
  readonly events: {
    /** @descriptionRef */
    click: string;
    /** @descriptionRef */
    gotFocus?: string;
    /** @descriptionRef */
    lostFocus?: string;
  };
}

export const buttonStylingProps: PropertyComponentDescriptorHash<ButtonComponentDef> = {
  variant: desc("The button variant (solid, outlined, ghost) to use"),
  themeColor: desc("The button color scheme (primary, secondary, attention)"),
  size: desc("The size of the button (small, medium, large)"),
};

// JSDoc-szerű leírás - szét kell választani a runtime cuccokat a statikus type-ok melletti kommentekből
// A lényeg, hogy egy eszközzel kiszedjük a releváns metaadatokat
const metadata: ComponentDescriptor<ButtonComponentDef> = {
  displayName: "Button",
  // ref: description.mdx <- later
  description: "Represent a button component, clicking of which triggers an action",
  props: {
    ...buttonStylingProps,
    label: desc(
      "Specifies the optional text to display in the button. If omitted, children can be used to set " +
        "the button's content."
    ),
    // ref: filename.mdx
    type: desc("The behavior type of the button"),
    // ref: filename.mdx
    enabled: desc("Indicates if the button is enabled"),
    icon: desc("Optional icon ID to display the particular icon in the button"),
    iconPosition: desc("Position of the icon displayed in the button"),
    contentPosition: desc("Determines how the label and icon should be placed inside the Button component"),
  },
  events: {
    click: desc("Triggers when the button is clicked"),
    gotFocus: desc("Triggers when he button is focused"),
    lostFocus: desc("Triggers when the button has lost focus"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "width-Button": "fit-content",
    "height-Button": "fit-content",
    "radius-Button": "$radius",
    "font-size-Button": "$font-size-normal",
    "color-bg-Button-primary": "$color-primary-500",
    "color-bg-Button-attention": "$color-bg-attention",
    "color-border-Button-attention": "$color-attention",
    "color-bg-Button--disabled": "$color-bg--disabled",
    "color-border-Button--disabled": "$color-border--disabled",
    "style-border-Button": "solid",
    "color-text-Button--disabled": "$color-text--disabled",
    "color-outline-Button--focus": "$color-outline--focus",
    "thickness-outline-Button--focus": "$thickness-outline--focus",
    "style-outline-Button--focus": "$style-outline--focus",
    "offset-outline-Button--focus": "$offset-outline--focus",
    "padding-horizontal-xs-Button": "$space-1",
    "padding-vertical-xs-Button": "$space-0_5",
    "padding-horizontal-sm-Button": "$space-4",
    "padding-vertical-sm-Button": "$space-2",
    "padding-horizontal-md-Button": "$space-4",
    "padding-vertical-md-Button": "$space-3",
    "padding-horizontal-lg-Button": "$space-5",
    "padding-vertical-lg-Button": "$space-4",
    light: {
      "color-text-Button": "$color-surface-950",
      "color-text-Button-solid": "$color-surface-50",
      "color-border-Button-primary": "$color-primary-500",
      "color-bg-Button-primary--hover": "$color-primary-400",
      "color-bg-Button-primary--active": "$color-primary-500",
      "color-bg-Button-primary-outlined--hover": "$color-primary-50",
      "color-bg-Button-primary-outlined--active": "$color-primary-100",
      "color-border-Button-primary-outlined": "$color-primary-600",
      "color-border-Button-primary-outlined--hover": "$color-primary-500",
      "color-text-Button-primary-outlined": "$color-primary-900",
      "color-text-Button-primary-outlined--hover": "$color-primary-950",
      "color-text-Button-primary-outlined--active": "$color-primary-900",
      "color-bg-Button-primary-ghost--hover": "$color-primary-50",
      "color-bg-Button-primary-ghost--active": "$color-primary-100",
      "color-border-Button-secondary": "$color-secondary-500",
      "color-bg-Button-secondary": "$color-secondary-500",
      "color-bg-Button-secondary--hover": "$color-secondary-400",
      "color-bg-Button-secondary--active": "$color-secondary-500",
      "color-bg-Button-secondary-outlined--hover": "$color-secondary-50",
      "color-bg-Button-secondary-outlined--active": "$color-secondary-100",
      "color-bg-Button-secondary-ghost--hover": "$color-secondary-100",
      "color-bg-Button-secondary-ghost--active": "$color-secondary-100",
      "color-bg-Button-attention--hover": "$color-danger-400",
      "color-bg-Button-attention--active": "$color-danger-500",
      "color-bg-Button-attention-outlined--hover": "$color-danger-50",
      "color-bg-Button-attention-outlined--active": "$color-danger-100",
      "color-bg-Button-attention-ghost--hover": "$color-danger-50",
      "color-bg-Button-attention-ghost--active": "$color-danger-100",
    },
    dark: {
      "color-text-Button": "$color-surface-50",
      "color-text-Button-solid": "$color-surface-50",
      "color-border-Button-primary": "$color-primary-500",
      "color-bg-Button-primary--hover": "$color-primary-600",
      "color-bg-Button-primary--active": "$color-primary-500",
      "color-bg-Button-primary-outlined--hover": "$color-primary-900",
      "color-bg-Button-primary-outlined--active": "$color-primary-950",
      "color-border-Button-primary-outlined": "$color-primary-600",
      "color-border-Button-primary-outlined--hover": "$color-primary-500",
      "color-text-Button-primary-outlined": "$color-primary-100",
      "color-text-Button-primary-outlined--hover": "$color-primary-50",
      "color-text-Button-primary-outlined--active": "$color-primary-100",
      "color-bg-Button-primary-ghost--hover": "$color-primary-900",
      "color-bg-Button-primary-ghost--active": "$color-primary-950",
      "color-border-Button-secondary": "$color-secondary-500",
      "color-bg-Button-secondary": "$color-secondary-500",
      "color-bg-Button-secondary--hover": "$color-secondary-400",
      "color-bg-Button-secondary--active": "$color-secondary-500",
      "color-bg-Button-secondary-outlined--hover": "$color-secondary-600",
      "color-bg-Button-secondary-outlined--active": "$color-secondary-500",
      "color-bg-Button-secondary-ghost--hover": "$color-secondary-900",
      "color-bg-Button-secondary-ghost--active": "$color-secondary-950",
      "color-bg-Button-attention--hover": "$color-danger-400",
      "color-bg-Button-attention--active": "$color-danger-500",
      "color-bg-Button-attention-outlined--hover": "$color-danger-900",
      "color-bg-Button-attention-outlined--active": "$color-danger-950",
      "color-bg-Button-attention-ghost--hover": "$color-danger-900",
      "color-bg-Button-attention-ghost--active": "$color-danger-950",
    },
  },
};

export const buttonComponentRenderer = createComponentRenderer<ButtonComponentDef>(
  "Button",
  ({ node, extractValue, renderChild, lookupEventHandler, lookupAction, layoutCss }) => {
    const iconName = extractValue.asString(node.props.icon);
    const label = extractValue.asDisplayText(node.props.label);
    return (
      <Button
        type={node.props.type}
        variant={extractValue(node.props.variant)}
        themeColor={extractValue(node.props.themeColor)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        size={extractValue(node.props.size)}
        icon={iconName && <Icon name={iconName} />}
        iconPosition={extractValue(node.props.iconPosition)}
        contentPosition={extractValue(node.props.contentPosition)}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled ?? true)}
        onFocus={lookupAction(node.events?.gotFocus)}
        onBlur={lookupAction(node.events?.lostFocus)}
        title={extractValue(node.props.title)}
        style={layoutCss}
      >
        {renderChild(node.children) || label}
      </Button>
    );
  },
  metadata
);
