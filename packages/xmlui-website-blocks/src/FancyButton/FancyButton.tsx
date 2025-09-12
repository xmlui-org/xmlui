import styles from "./FancyButton.module.scss";

import {
  alignmentOptionMd,
  sizeMd,
  iconPositionMd,
  buttonTypesMd,
} from "../../../../xmlui/src/components/abstractions";
import { createComponentRenderer } from "../../../../xmlui/src/components-core/renderers";
import { parseScssVar } from "../../../../xmlui/src/components-core/theming/themeVars";
import {
  createMetadata,
  dClick,
  dGotFocus,
  dLostFocus,
} from "../../../../xmlui/src/components/metadata-helpers";
import { FancyButton, defaultProps } from "./FancyButtonNative";

const COMP = "FancyButton";

const fancyButtonVariantMd = [
  { value: "rounded", description: "Rounded variant with soft corners" },
  { value: "square", description: "Square variant with sharp corners" },
  { value: "pill", description: "Pill variant with fully rounded edges" },
  { value: "outlinedPill", description: "Outlined pill variant with fully rounded edges" },
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
    [`fontSize-${COMP}`]: "$fontSize-small",
    [`fontWeight-${COMP}`]: "$fontWeight-medium",
    [`gap-${COMP}`]: "$space-2",
    [`backgroundColor-${COMP}--disabled`]: "$backgroundColor--disabled",
    [`borderColor-${COMP}--disabled`]: "$borderColor--disabled",
    [`borderStyle-${COMP}`]: "solid",
    [`textColor-${COMP}--disabled`]: "$textColor--disabled",
    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`borderWidth-${COMP}`]: "1px",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset--focus",

    // Size variant theme variables
    [`paddingHorizontal-${COMP}-xs`]: "$space-3",
    [`paddingVertical-${COMP}-xs`]: "$space-1_5",
    [`fontSize-${COMP}-xs`]: "$fontSize-smaller",
    [`gap-${COMP}-xs`]: "$space-2",

    [`paddingHorizontal-${COMP}-sm`]: "$space-4",
    [`paddingVertical-${COMP}-sm`]: "$space-2",
    [`fontSize-${COMP}-sm`]: "$fontSize-small",
    [`gap-${COMP}-sm`]: "$space-2_5",

    [`paddingHorizontal-${COMP}-md`]: "$space-5",
    [`paddingVertical-${COMP}-md`]: "$space-2_5",
    [`fontSize-${COMP}-md`]: "$fontSize-medium",
    [`gap-${COMP}-md`]: "$space-3",

    [`paddingHorizontal-${COMP}-lg`]: "$space-8",
    [`paddingVertical-${COMP}-lg`]: "$space-3",
    [`fontSize-${COMP}-lg`]: "$fontSize-large",
    [`gap-${COMP}-lg`]: "$space-4",

    [`paddingHorizontal-${COMP}-xl`]: "$space-10",
    [`paddingVertical-${COMP}-xl`]: "$space-4",
    [`fontSize-${COMP}-xl`]: "$fontSize-larger",
    [`gap-${COMP}-xl`]: "$space-5",

    // Common colors
    [`backgroundColor-${COMP}`]: "$color-primary-500",
    [`backgroundColor-${COMP}--hover`]: "$color-primary-400",
    [`backgroundColor-${COMP}--active`]: "$color-primary-600",
    [`textColor-${COMP}`]: "$const-color-surface-50",
    [`borderColor-${COMP}`]: "$color-primary-500",
    [`borderColor-${COMP}--hover`]: "$color-primary-400",

    // Rounded variant theme variables
    [`borderRadius-${COMP}-rounded-xs`]: "6px",
    [`borderRadius-${COMP}-rounded-sm`]: "8px",
    [`borderRadius-${COMP}-rounded-md`]: "12px",
    [`borderRadius-${COMP}-rounded-lg`]: "16px",
    [`borderRadius-${COMP}-rounded-xl`]: "24px",

    // Square variant theme variables
    [`borderRadius-${COMP}-square`]: "$space-0",

    // Pill variant theme variables
    [`borderRadius-${COMP}-pill`]: "9999px",

    // Outlined pill variant theme variables
    [`backgroundColor-${COMP}-outlinedPill`]: "transparent",
    [`backgroundColor-${COMP}-outlinedPill--hover`]: "transparent",
    [`borderRadius-${COMP}-outlinedPill`]: "9999px",
    [`borderColor-${COMP}-outlinedPill--hover`]: "red",
    [`textColor-${COMP}-outlinedPill`]: "$textColor-primary",
    [`borderWidth-${COMP}-outlinedPill-xs`]: "1.5px",
    [`borderWidth-${COMP}-outlinedPill-sm`]: "2px",
    [`borderWidth-${COMP}-outlinedPill-md`]: "2.5px",
    [`borderWidth-${COMP}-outlinedPill-lg`]: "4px",
    [`borderWidth-${COMP}-outlinedPill-xl`]: "5px",

  },
});

export const fancyButtonComponentRenderer = createComponentRenderer(
  "FancyButton",
  FancyButtonMd,
  ({ node, extractValue, renderChild, lookupEventHandler, className }) => {
    const props = (node.props as typeof FancyButtonMd.props)!;
    const label = extractValue.asDisplayText(props.label);
    return (
      <FancyButton
        type={extractValue.asOptionalString(props.type)}
        variant={extractValue.asOptionalString(props.variant)}
        autoFocus={extractValue.asOptionalBoolean(props.autoFocus)}
        size={extractValue.asOptionalString(props.size)}
        icon={extractValue.asOptionalString(props.icon)}
        iconPosition={extractValue.asOptionalString(props.iconPosition)}
        contentPosition={extractValue.asOptionalString(props.contentPosition)}
        enabled={extractValue.asOptionalBoolean(props.enabled)}
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
