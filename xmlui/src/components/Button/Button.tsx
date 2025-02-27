import styles from "./Button.module.scss";

import { createMetadata } from "../../abstractions/ComponentDefs";
import {
  buttonThemeMd,
  alignmentOptionMd,
  sizeMd,
  buttonVariantMd,
  buttonTypesMd,
  iconPositionMd,
} from "../abstractions";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { dClick, dGotFocus, dLostFocus, dOrientation } from "../../components/metadata-helpers";
import { Icon } from "../Icon/IconNative";
import { Button, propDefaults } from "./ButtonNative";

const COMP = "Button";

export const ButtonMd = createMetadata({
  description: "Button is an interactive element that triggers an action when clicked.",
  status: "stable",
  props: {
    autoFocus: {
      description: "Indicates if the button should receive focus when the page loads.",
      isRequired: false,
      type: "boolean",
      defaultValue: false,
    },
    variant: {
      description: "The button variant determines the level of emphasis the button should possess.",
      isRequired: false,
      type: "string",
      availableValues: buttonVariantMd,
      defaultValue: propDefaults.variant,
    },
    themeColor: {
      description: "Sets the button color scheme defined in the application theme.",
      isRequired: false,
      type: "string",
      availableValues: buttonThemeMd,
      defaultValue: propDefaults.themeColor,
    },
    size: {
      description: "Sets the size of the button.",
      isRequired: false,
      type: "string",
      availableValues: sizeMd,
      defaultValue: propDefaults.size,
    },
    label: {
      description:
        `This property is an optional string to set a label for the ${COMP}. If no label is ` +
        `specified and an icon is set, the ${COMP} will modify its styling to look like a ` +
        `small icon button. When the ${COMP} has nested children, it will display them and ` +
        `ignore the value of the \`label\` prop.`,
      type: "string",
    },
    type: {
      description:
        `This optional string describes how the ${COMP} appears in an HTML context. You ` +
        `rarely need to set this property explicitly.`,
      availableValues: buttonTypesMd,
      valueType: "string",
      defaultValue: propDefaults.type,
    },
    enabled: {
      description:
        `The value of this property indicates whether the button accepts actions (\`true\`) ` +
        `or does not react to them (\`false\`).`,
      type: "boolean",
      defaultValue: true,
    },
    orientation: dOrientation(propDefaults.orientation),
    icon: {
      description:
        `This string value denotes an icon name. The framework will render an icon if XMLUI ` +
        `recognizes the icon by its name. If no label is specified and an icon is set, the ${COMP} ` +
        `displays only that icon.`,
      type: "string",
    },
    iconPosition: {
      description: `This optional string determines the location of the icon in the ${COMP}.`,
      availableValues: iconPositionMd,
      type: "string",
      defaultValue: propDefaults.iconPosition,
    },
    contentPosition: {
      description:
        `This optional value determines how the label and icon (or nested children) should be placed` +
        `inside the ${COMP} component.`,
      availableValues: alignmentOptionMd,
      type: "string",
      defaultValue: propDefaults.contentPosition,
    },
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
    [`padding-horizontal-${COMP}-xs`]: "$space-1",
    [`padding-vertical-${COMP}-xs`]: "$space-0_5",
    [`padding-horizontal-${COMP}-sm`]: "$space-4",
    [`padding-vertical-${COMP}-sm`]: "$space-2",
    [`padding-horizontal-${COMP}-md`]: "$space-4",
    [`padding-vertical-${COMP}-md`]: "$space-3",
    [`padding-horizontal-${COMP}-lg`]: "$space-5",
    [`padding-vertical-${COMP}-lg`]: "$space-4",
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

export const buttonComponentRenderer = createComponentRenderer(
  "Button",
  ButtonMd,
  ({ node, extractValue, renderChild, lookupEventHandler, layoutCss }) => {
    const iconName = extractValue.asString(node.props.icon);
    const label = extractValue.asDisplayText(node.props.label);
    return (
      <Button
        type={extractValue.asOptionalString(node.props.type)}
        variant={extractValue.asOptionalString(node.props.variant)}
        themeColor={extractValue.asOptionalString(node.props.themeColor)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        size={extractValue.asOptionalString(node.props.size)}
        icon={iconName && <Icon name={iconName} />}
        iconPosition={extractValue.asOptionalString(node.props.iconPosition)}
        orientation={extractValue.asOptionalString(node.props.orientation)}
        contentPosition={extractValue.asOptionalString(node.props.contentPosition)}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled, true)}
        onClick={lookupEventHandler("click")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        style={layoutCss}
      >
        {renderChild(node.children, { type: "Stack", orientation: "horizontal" }) || label}
      </Button>
    );
  },
);
