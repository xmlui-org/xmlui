import styles from "./FancyButton.module.scss";

import {
  alignmentOptionMd,
  sizeMd,
  iconPositionMd,
  buttonTypesMd,
} from "../../../../xmlui/src/components/abstractions";
import { createComponentRenderer } from "../../../../xmlui/src/components-core/renderers";
import { parseScssVar } from "../../../../xmlui/src/components-core/theming/themeVars";
import { createMetadata, dClick, dGotFocus, dLostFocus, dOrientation } from "../../../../xmlui/src/components/metadata-helpers";
import { Icon } from "../../../../xmlui/src/components/Icon/IconNative";
import { FancyButton, defaultProps } from "./FancyButtonNative";

const COMP = "FancyButton";

const fancyButtonVariantMd = [
  { value: "rounded", description: "Rounded variant with soft corners" },
  { value: "square", description: "Square variant with sharp corners" },
];

export const FancyButtonMd = createMetadata({
  status: "experimental",
  description:
    "`FancyButton` is an enhanced interactive component for triggering actions with " +
    "advanced styling options. It provides rounded and square variants for different " +
    "design aesthetics while maintaining all standard button functionality.",
  props: {
    autoFocus: {
      description: "Indicates if the button should receive focus when the page loads.",
      isRequired: false,
      type: "boolean",
      defaultValue: defaultProps.autoFocus,
    },
    variant: {
      description: "The button variant determines the visual style and corner treatment.",
      isRequired: false,
      type: "string",
      availableValues: fancyButtonVariantMd,
      defaultValue: defaultProps.variant,
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
    [`paddingHorizontal-${COMP}-xl`]: "$space-8",
    [`paddingVertical-${COMP}-xl`]: "$space-6",

    // Common colors
    [`backgroundColor-${COMP}`]: "$color-primary-500",
    [`backgroundColor-${COMP}--hover`]: "$color-primary-400",
    [`backgroundColor-${COMP}--active`]: "$color-primary-600",
    [`textColor-${COMP}`]: "$const-color-surface-50",
    [`borderColor-${COMP}`]: "$color-primary-500",
    [`borderColor-${COMP}--hover`]: "$color-primary-400",

    // Rounded variant theme variables
    [`borderRadius-${COMP}-rounded`]: "$space-72",

    // Square variant theme variables
    [`borderRadius-${COMP}-square`]: "$space-0",
  },
});

export const fancyButtonComponentRenderer = createComponentRenderer(
  "FancyButton",
  FancyButtonMd,
  ({ node, extractValue, renderChild, lookupEventHandler, className }) => {
    const props = (node.props as typeof FancyButtonMd.props)!;
    const iconName = extractValue.asString(props.icon);
    const label = extractValue.asDisplayText(props.label);
    return (
      <FancyButton
        type={extractValue.asOptionalString(props.type)}
        variant={extractValue.asOptionalString(props.variant)}
        autoFocus={extractValue.asOptionalBoolean(props.autoFocus)}
        size={extractValue.asOptionalString(props.size)}
        icon={iconName && <Icon name={iconName} aria-hidden />}
        iconPosition={extractValue.asOptionalString(props.iconPosition)}
        orientation={extractValue.asOptionalString(props.orientation)}
        contentPosition={extractValue.asOptionalString(props.contentPosition)}
        disabled={!extractValue.asOptionalBoolean(props.enabled, true)}
        onClick={lookupEventHandler("click")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        className={className}
        contextualLabel={extractValue.asOptionalString(props.contextualLabel)}
      >
        {renderChild(node.children, { type: "Stack", orientation: "horizontal" }) || label}
      </FancyButton>
    );
  },
);
