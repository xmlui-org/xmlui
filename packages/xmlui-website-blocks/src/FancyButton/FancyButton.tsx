import styles from "./FancyButton.module.scss";

import { createComponentRenderer, createMetadata, d, parseScssVar } from "xmlui";
import { FancyButton, defaultProps } from "./FancyButtonNative";

const COMP = "FancyButton";

export const FancyButtonMd = createMetadata({
  status: "experimental",
  description:
    "`FancyButton` is an enhanced interactive component for triggering actions with " +
    "fancy styling variations. It supports rounded and square variants with customizable " +
    "appearance and behavior for modern web interfaces.",
  props: {
    autoFocus: {
      description: "Indicates if the button should receive focus when the page loads.",
      type: "boolean",
      defaultValue: defaultProps.autoFocus,
    },
    variant: {
      description: "The button variant determines the visual style of the button.",
      type: "string",
      defaultValue: defaultProps.variant,
      options: ["rounded", "square"],
    },
    size: {
      description: "Sets the size of the button.",
      type: "string",
      defaultValue: defaultProps.size,
      options: ["xs", "sm", "md", "lg"],
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
      type: "string",
      defaultValue: defaultProps.type,
      options: ["button", "submit", "reset"],
    },
    enabled: {
      description:
        `The value of this property indicates whether the button accepts actions (\`true\`) ` +
        `or does not react to them (\`false\`).`,
      type: "boolean",
      defaultValue: true,
    },
    orientation: {
      description: "Sets the orientation for arranging the icon and label.",
      type: "string",
      defaultValue: defaultProps.orientation,
      options: ["horizontal", "vertical"],
    },
    icon: {
      description:
        `This string value denotes an icon name. The framework will render an icon if XMLUI ` +
        `recognizes the icon by its name. If no label is specified and an icon is set, the ${COMP} ` +
        `displays only that icon.`,
      type: "string",
    },
    iconPosition: {
      description: `This optional string determines the location of the icon in the ${COMP}.`,
      type: "string",
      defaultValue: defaultProps.iconPosition,
      options: ["start", "end"],
    },
    contentPosition: {
      description:
        `This optional value determines how the label and icon (or nested children) should be placed` +
        `inside the ${COMP} component.`,
      type: "string",
      defaultValue: defaultProps.contentPosition,
      options: ["start", "center", "end"],
    },
    contextualLabel: {
      description: `This optional value is used to provide an accessible name for the ${COMP} in the context of its usage.`,
      type: "string",
    },
  },
  events: {
    click: d("Triggered when the button is clicked"),
    gotFocus: d("Triggered when the button receives focus"),
    lostFocus: d("Triggered when the button loses focus"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`width-${COMP}`]: "fit-content",
    [`height-${COMP}`]: "fit-content",
    [`fontSize-${COMP}`]: "$fontSize-small",
    [`fontWeight-${COMP}`]: "$fontWeight-medium",
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

    // Rounded variant theme variables
    [`borderRadius-${COMP}-rounded`]: "24px",
    [`backgroundColor-${COMP}-rounded`]: "$color-primary-500",
    [`backgroundColor-${COMP}-rounded--hover`]: "$color-primary-400",
    [`backgroundColor-${COMP}-rounded--active`]: "$color-primary-600",
    [`textColor-${COMP}-rounded`]: "$const-color-surface-50",
    [`borderColor-${COMP}-rounded`]: "$color-primary-500",
    [`borderColor-${COMP}-rounded--hover`]: "$color-primary-400",

    // Square variant theme variables
    [`borderRadius-${COMP}-square`]: "4px",
    [`backgroundColor-${COMP}-square`]: "$color-secondary-500",
    [`backgroundColor-${COMP}-square--hover`]: "$color-secondary-400",
    [`backgroundColor-${COMP}-square--active`]: "$color-secondary-600",
    [`textColor-${COMP}-square`]: "$const-color-surface-50",
    [`borderColor-${COMP}-square`]: "$color-secondary-500",
    [`borderColor-${COMP}-square--hover`]: "$color-secondary-400",
  },
});

export const fancyButtonComponentRenderer = createComponentRenderer(
  COMP,
  FancyButtonMd,
  ({ node, extractValue, renderChild, lookupEventHandler, className }) => {
    const props = (node.props as typeof FancyButtonMd.props)!;
    const iconName = extractValue(props.icon);
    const label = extractValue(props.label);
    return (
      <FancyButton
        type={extractValue(props.type)}
        variant={extractValue(props.variant)}
        autoFocus={extractValue.asOptionalBoolean(props.autoFocus)}
        size={extractValue(props.size)}
        icon={iconName}
        iconPosition={extractValue(props.iconPosition)}
        orientation={extractValue(props.orientation)}
        contentPosition={extractValue(props.contentPosition)}
        disabled={!extractValue.asOptionalBoolean(props.enabled, true)}
        onClick={lookupEventHandler("click")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        className={extractValue(className)}
        contextualLabel={extractValue(props.contextualLabel)}
      >
        {renderChild(node.children, { type: "Stack", orientation: "horizontal" }) || label}
      </FancyButton>
    );
  },
);
