import styles from "./Button.module.scss";

import { createMetadata, d, type ComponentDef } from "@abstractions/ComponentDefs";
import {
  alignmentOptionNames,
  sizeNames,
  buttonThemeNames,
  buttonTypeNames,
  iconPositionNames,
  buttonVariantNames,
} from "@components/abstractions";

import { Icon } from "@components/Icon/IconNative";
import { createComponentRendererNew } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Button } from "./ButtonNative";
import { dClick, dGotFocus, dLostFocus } from "@components/metadata-helpers";

const COMP = "Button";

export const ButtonMd = createMetadata({
  description: `Button is an interactive element that triggers an action when clicked.`,
  props: {
    autoFocus: d("Indicates if the button should receive focus when the page loads"),
    variant: d("The button variant (solid, outlined, ghost) to use", buttonVariantNames),
    themeColor: d("The button color scheme (primary, secondary, attention)", buttonThemeNames),
    size: d("The size of the button (small, medium, large)", sizeNames),
    label: d(
      `This property is an optional string to set a label for the ${COMP}. If no label is ` +
        `specified and an icon is set, the ${COMP} will modify its styling to look like a ` +
        `small icon button. When the ${COMP} has nested children, it will display them and ` +
        `ignore the value of the \`label\` prop.`,
    ),
    type: d(
      `This optional string describes how the ${COMP} appears in an HTML context. You ` +
        `rarely need to set this property explicitly.`,
      buttonTypeNames,
    ),
    enabled: d(
      `The value of this property indicates if the button accepts actions (\`true\`) ` +
        `or does not react to them (\`falseq\`).`,
      null,
      null,
      true,
    ),
    icon: d(
      `This string value denotes an icon name. The framework will render an icon if XMLUI ` +
        `recognizes the icon (by its name). If no label is specified and an icon is set, the ${COMP} ` +
        `displays only the icon.`,
    ),
    iconPosition: d(
      `This optional string determines the location of the icon in the ${COMP}.`,
      iconPositionNames,
    ),
    contentPosition: d(
      `This optional value determines how the label and icon (or nested children) should be placed` +
        `inside the ${COMP} component.`,
      alignmentOptionNames,
    ),
  },
  events: {
    click: dClick(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`width-${COMP}`]: "fit-content",
    [`height-${COMP}`]: "fit-content",
    [`radius-${COMP}`]: "$radius",
    [`font-size-${COMP}`]: "$font-size-small",
    [`font-weight-${COMP}`]: "$font-weight-medium",
    [`color-bg-${COMP}-primary`]: "$color-primary-500",
    [`color-bg-${COMP}-attention`]: "$color-bg-attention",
    [`color-border-${COMP}-attention`]: "$color-attention",
    [`color-bg-${COMP}--disabled`]: "$color-bg--disabled",
    [`color-border-${COMP}--disabled`]: "$color-border--disabled",
    [`style-border-${COMP}`]: "solid",
    [`color-text-${COMP}--disabled`]: "$color-text--disabled",
    [`color-outline-${COMP}--focus`]: "$color-outline--focus",
    [`thickness-border-${COMP}`]: "1px",
    [`thickness-outline-${COMP}--focus`]: "$thickness-outline--focus",
    [`style-outline-${COMP}--focus`]: "$style-outline--focus",
    [`offset-outline-${COMP}--focus`]: "$offset-outline--focus",
    [`padding-horizontal-xs-${COMP}`]: "$space-1",
    [`padding-vertical-xs-${COMP}`]: "$space-0_5",
    [`padding-horizontal-sm-${COMP}`]: "$space-4",
    [`padding-vertical-sm-${COMP}`]: "$space-2",
    [`padding-horizontal-md-${COMP}`]: "$space-4",
    [`padding-vertical-md-${COMP}`]: "$space-3",
    [`padding-horizontal-lg-${COMP}`]: "$space-5",
    [`padding-vertical-lg-${COMP}`]: "$space-4",
    light: {
      [`color-text-${COMP}`]: "$color-surface-950",
      [`color-text-${COMP}-solid`]: "$color-surface-50",
      [`color-border-${COMP}-primary`]: "$color-primary-500",
      [`color-bg-${COMP}-primary--hover`]: "$color-primary-400",
      [`color-bg-${COMP}-primary--active`]: "$color-primary-500",
      [`color-bg-${COMP}-primary-outlined--hover`]: "$color-primary-50",
      [`color-bg-${COMP}-primary-outlined--active`]: "$color-primary-100",
      [`color-border-${COMP}-primary-outlined`]: "$color-primary-600",
      [`color-border-${COMP}-primary-outlined--hover`]: "$color-primary-500",
      [`color-text-${COMP}-primary-outlined`]: "$color-primary-900",
      [`color-text-${COMP}-primary-outlined--hover`]: "$color-primary-950",
      [`color-text-${COMP}-primary-outlined--active`]: "$color-primary-900",
      [`color-bg-${COMP}-primary-ghost--hover`]: "$color-primary-50",
      [`color-bg-${COMP}-primary-ghost--active`]: "$color-primary-100",
      [`color-border-${COMP}-secondary`]: "$color-secondary-100",
      [`color-bg-${COMP}-secondary`]: "$color-secondary-500",
      [`color-bg-${COMP}-secondary--hover`]: "$color-secondary-400",
      [`color-bg-${COMP}-secondary--active`]: "$color-secondary-500",
      [`color-bg-${COMP}-secondary-outlined--hover`]: "$color-secondary-50",
      [`color-bg-${COMP}-secondary-outlined--active`]: "$color-secondary-100",
      [`color-bg-${COMP}-secondary-ghost--hover`]: "$color-secondary-100",
      [`color-bg-${COMP}-secondary-ghost--active`]: "$color-secondary-100",
      [`color-bg-${COMP}-attention--hover`]: "$color-danger-400",
      [`color-bg-${COMP}-attention--active`]: "$color-danger-500",
      [`color-bg-${COMP}-attention-outlined--hover`]: "$color-danger-50",
      [`color-bg-${COMP}-attention-outlined--active`]: "$color-danger-100",
      [`color-bg-${COMP}-attention-ghost--hover`]: "$color-danger-50",
      [`color-bg-${COMP}-attention-ghost--active`]: "$color-danger-100",
    },
    dark: {
      [`color-text-${COMP}`]: "$color-surface-50",
      [`color-text-${COMP}-solid`]: "$color-surface-50",
      [`color-border-${COMP}-primary`]: "$color-primary-500",
      [`color-bg-${COMP}-primary--hover`]: "$color-primary-600",
      [`color-bg-${COMP}-primary--active`]: "$color-primary-500",
      [`color-bg-${COMP}-primary-outlined--hover`]: "$color-primary-900",
      [`color-bg-${COMP}-primary-outlined--active`]: "$color-primary-950",
      [`color-border-${COMP}-primary-outlined`]: "$color-primary-600",
      [`color-border-${COMP}-primary-outlined--hover`]: "$color-primary-500",
      [`color-text-${COMP}-primary-outlined`]: "$color-primary-100",
      [`color-text-${COMP}-primary-outlined--hover`]: "$color-primary-50",
      [`color-text-${COMP}-primary-outlined--active`]: "$color-primary-100",
      [`color-bg-${COMP}-primary-ghost--hover`]: "$color-primary-900",
      [`color-bg-${COMP}-primary-ghost--active`]: "$color-primary-950",
      [`color-border-${COMP}-secondary`]: "$color-secondary-500",
      [`color-bg-${COMP}-secondary`]: "$color-secondary-500",
      [`color-bg-${COMP}-secondary--hover`]: "$color-secondary-400",
      [`color-bg-${COMP}-secondary--active`]: "$color-secondary-500",
      [`color-bg-${COMP}-secondary-outlined--hover`]: "$color-secondary-600",
      [`color-bg-${COMP}-secondary-outlined--active`]: "$color-secondary-500",
      [`color-bg-${COMP}-secondary-ghost--hover`]: "$color-secondary-900",
      [`color-bg-${COMP}-secondary-ghost--active`]: "$color-secondary-950",
      [`color-bg-${COMP}-attention--hover`]: "$color-danger-400",
      [`color-bg-${COMP}-attention--active`]: "$color-danger-500",
      [`color-bg-${COMP}-attention-outlined--hover`]: "$color-danger-900",
      [`color-bg-${COMP}-attention-outlined--active`]: "$color-danger-950",
      [`color-bg-${COMP}-attention-ghost--hover`]: "$color-danger-900",
      [`color-bg-${COMP}-attention-ghost--active`]: "$color-danger-950",
    },
  },
});

export const buttonComponentRenderer = createComponentRendererNew(
  "Button",
  ButtonMd,
  ({ node, extractValue, renderChild, lookupEventHandler, layoutCss }) => {
    const iconName = extractValue.asString(node.props.icon);
    const label = extractValue.asDisplayText(node.props.label);
    return (
      <Button
        type={node.props.type as any}
        variant={extractValue(node.props.variant)}
        themeColor={extractValue(node.props.themeColor)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        size={extractValue(node.props.size)}
        icon={iconName && <Icon name={iconName} />}
        iconPosition={extractValue(node.props.iconPosition)}
        contentPosition={extractValue(node.props.contentPosition)}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled ?? true)}
        onClick={lookupEventHandler("click")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        style={layoutCss}
      >
        {renderChild(node.children) || label}
      </Button>
    );
  },
);
