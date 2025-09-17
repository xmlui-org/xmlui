import styles from "./Button.module.scss";

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
import { createMetadata, dClick, dGotFocus, dLostFocus, dOrientation } from "../../components/metadata-helpers";
import { Icon } from "../Icon/IconNative";
import { Button, defaultProps } from "./ButtonNative";

const COMP = "Button";

export const ButtonMd = createMetadata({
  status: "stable",
  description:
    "`Button` is the primary interactive component for triggering actions like " +
    "form submissions, navigation, opening modals, and API calls. It supports " +
    "multiple visual styles and sizes to match different UI contexts and importance levels.",
  props: {
    autoFocus: {
      description: "Indicates if the button should receive focus when the page loads.",
      isRequired: false,
      type: "boolean",
      defaultValue: defaultProps.autoFocus,
    },
    variant: {
      description: "The button variant determines the level of emphasis the button should possess.",
      isRequired: false,
      type: "string",
      availableValues: buttonVariantMd,
      defaultValue: defaultProps.variant,
    },
    themeColor: {
      description: "Sets the button color scheme defined in the application theme.",
      isRequired: false,
      type: "string",
      availableValues: buttonThemeMd,
      defaultValue: defaultProps.themeColor,
    },
    size: {
      description: "Sets the size of the button.",
      isRequired: false,
      type: "string",
      availableValues: sizeMd,
      defaultValue: defaultProps.size,
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
      defaultValue: defaultProps.type,
    },
    enabled: {
      description:
        `The value of this property indicates whether the button accepts actions (\`true\`) ` +
        `or does not react to them (\`false\`).`,
      type: "boolean",
      defaultValue: true,
    },
    orientation: dOrientation(defaultProps.orientation),
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
      defaultValue: defaultProps.iconPosition,
    },
    contentPosition: {
      description:
        `This optional value determines how the label and icon (or nested children) should be placed` +
        `inside the ${COMP} component.`,
      availableValues: alignmentOptionMd,
      type: "string",
      defaultValue: defaultProps.contentPosition,
    },
    contextualLabel: {
      description: `This optional value is used to provide an accessible name for the ${COMP} in the context of its usage.`,
      type: "string",
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
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`fontSize-${COMP}`]: "$fontSize-sm",
    [`fontWeight-${COMP}`]: "$fontWeight-medium",
    [`backgroundColor-${COMP}-primary`]: "$color-primary-500",
    [`backgroundColor-${COMP}-attention`]: "$backgroundColor-attention",
    [`borderColor-${COMP}-attention`]: "$color-attention",
    [`backgroundColor-${COMP}--disabled`]: "$backgroundColor--disabled",
    [`borderColor-${COMP}--disabled`]: "$borderColor--disabled",
    [`borderStyle-${COMP}`]: "solid",
    [`textColor-${COMP}--disabled`]: "$textColor--disabled",
    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`borderWidth-${COMP}`]: "1px",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset--focus",
    [`paddingHorizontal-${COMP}-xs`]: "$space-1",
    [`paddingVertical-${COMP}-xs`]: "$space-0_5",
    [`paddingHorizontal-${COMP}-sm`]: "$space-4",
    [`paddingVertical-${COMP}-sm`]: "$space-2",
    [`paddingHorizontal-${COMP}-md`]: "$space-4",
    [`paddingVertical-${COMP}-md`]: "$space-3",
    [`paddingHorizontal-${COMP}-lg`]: "$space-5",
    [`paddingVertical-${COMP}-lg`]: "$space-4",

    [`textColor-${COMP}`]: "$color-surface-950",
    [`textColor-${COMP}-solid`]: "$const-color-surface-50",
    [`borderColor-${COMP}-primary`]: "$color-primary-500",
    [`backgroundColor-${COMP}-primary--hover`]: "$color-primary-400",
    [`backgroundColor-${COMP}-primary--active`]: "$color-primary-500",
    [`backgroundColor-${COMP}-primary-outlined--hover`]: "$color-primary-50",
    [`backgroundColor-${COMP}-primary-outlined--active`]: "$color-primary-100",
    [`borderColor-${COMP}-primary-outlined`]: "$color-primary-600",
    [`borderColor-${COMP}-primary-outlined--hover`]: "$color-primary-500",
    [`textColor-${COMP}-primary-outlined`]: "$color-primary-900",
    [`textColor-${COMP}-primary-outlined--hover`]: "$color-primary-950",
    [`textColor-${COMP}-primary-outlined--active`]: "$color-primary-900",
    [`backgroundColor-${COMP}-primary-ghost--hover`]: "$color-primary-50",
    [`backgroundColor-${COMP}-primary-ghost--active`]: "$color-primary-100",
    [`borderColor-${COMP}-secondary`]: "$color-secondary-100",
    [`backgroundColor-${COMP}-secondary`]: "$color-secondary-500",
    [`backgroundColor-${COMP}-secondary--hover`]: "$color-secondary-400",
    [`backgroundColor-${COMP}-secondary--active`]: "$color-secondary-500",
    [`backgroundColor-${COMP}-secondary-outlined--hover`]: "$color-secondary-50",
    [`backgroundColor-${COMP}-secondary-outlined--active`]: "$color-secondary-100",
    [`backgroundColor-${COMP}-secondary-ghost--hover`]: "$color-secondary-100",
    [`backgroundColor-${COMP}-secondary-ghost--active`]: "$color-secondary-100",
    [`backgroundColor-${COMP}-attention--hover`]: "$color-danger-400",
    [`backgroundColor-${COMP}-attention--active`]: "$color-danger-500",
    [`backgroundColor-${COMP}-attention-outlined--hover`]: "$color-danger-50",
    [`backgroundColor-${COMP}-attention-outlined--active`]: "$color-danger-100",
    [`backgroundColor-${COMP}-attention-ghost--hover`]: "$color-danger-50",
    [`backgroundColor-${COMP}-attention-ghost--active`]: "$color-danger-100",
  },
});

export const buttonComponentRenderer = createComponentRenderer(
  "Button",
  ButtonMd,
  ({ node, extractValue, renderChild, lookupEventHandler, className }) => {
    const iconName = extractValue.asString(node.props.icon);
    const label = extractValue.asDisplayText(node.props.label);
    return (
      <Button
        type={extractValue.asOptionalString(node.props.type)}
        variant={extractValue.asOptionalString(node.props.variant)}
        themeColor={extractValue.asOptionalString(node.props.themeColor)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        size={extractValue.asOptionalString(node.props.size)}
        icon={iconName && <Icon name={iconName} aria-hidden />}
        iconPosition={extractValue.asOptionalString(node.props.iconPosition)}
        orientation={extractValue.asOptionalString(node.props.orientation)}
        contentPosition={extractValue.asOptionalString(node.props.contentPosition)}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled, true)}
        onClick={lookupEventHandler("click")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        className={className}
        contextualLabel={extractValue.asOptionalString(node.props.contextualLabel)}
      >
        {renderChild(node.children, { type: "Stack", orientation: "horizontal" }) || label}
      </Button>
    );
  },
);
