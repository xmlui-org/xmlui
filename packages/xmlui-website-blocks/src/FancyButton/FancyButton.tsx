import { createUserDefinedComponentRenderer, dClick, dGotFocus, dLostFocus } from "xmlui";
import { createMetadata } from "xmlui";
import componentSource from "./FancyButton.xmlui";
import { PropertyValueDescription } from "xmlui/src/abstractions/ComponentDefs";

export const alignmentOptionMd: PropertyValueDescription[] = [
  { value: "center", description: "Place the content in the middle" },
  {
    value: "start",
    description: "Justify the content to the left (to the right if in right-to-left)",
  },
  {
    value: "end",
    description: "Justify the content to the right (to the left if in right-to-left)",
  },
];

export const sizeMd: PropertyValueDescription[] = [
  { value: "xs", description: "Extra small" },
  { value: "sm", description: "Small" },
  { value: "md", description: "Medium" },
  { value: "lg", description: "Large" },
  { value: "xl", description: "Extra large" },
];

export const iconPositionMd: PropertyValueDescription[] = [
  {
    value: "start",
    description:
      "The icon will appear at the start (left side when the left-to-right direction is set)",
  },
  {
    value: "end",
    description:
      "The icon will appear at the end (right side when the left-to-right direction is set)",
  },
];

export const buttonTypesMd: PropertyValueDescription[] = [
  {
    value: "button",
    description: "Regular behavior that only executes logic if explicitly determined.",
  },
  {
    value: "submit",
    description:
      "The button submits the form data to the server. This is the default for buttons in a Form or NativeForm component.",
  },
  {
    value: "reset",
    description:
      "Resets all the controls to their initial values. Using it is ill advised for UX reasons.",
  },
];

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
      defaultValue: false,
    },
    variant: {
      description: "The button variant determines the visual style and corner treatment.",
      isRequired: false,
      type: "string",
      availableValues: fancyButtonVariantMd,
      defaultValue: "rounded",
    },
    size: {
      description: "Sets the size of the button.",
      isRequired: false,
      type: "string",
      availableValues: sizeMd,
      defaultValue: "md",
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
      defaultValue: "button",
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
      defaultValue: "start",
    },
    contentPosition: {
      description:
        `This optional value determines how the label and icon (or nested children) should be placed` +
        `inside the ${COMP} component.`,
      availableValues: alignmentOptionMd,
      type: "string",
      defaultValue: "center",
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
  defaultThemeVars: {
    [`fontSize-${COMP}`]: "$fontSize-sm",
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
    [`fontSize-${COMP}-xs`]: "$fontSize-xs",
    [`gap-${COMP}-xs`]: "$space-2",

    [`paddingHorizontal-${COMP}-sm`]: "$space-4",
    [`paddingVertical-${COMP}-sm`]: "$space-2",
    [`fontSize-${COMP}-sm`]: "$fontSize-sm",
    [`gap-${COMP}-sm`]: "$space-2_5",

    [`paddingHorizontal-${COMP}-md`]: "$space-5",
    [`paddingVertical-${COMP}-md`]: "$space-2_5",
    [`fontSize-${COMP}-md`]: "$fontSize-xl",
    [`gap-${COMP}-md`]: "$space-3",

    [`paddingHorizontal-${COMP}-lg`]: "$space-8",
    [`paddingVertical-${COMP}-lg`]: "$space-3",
    [`fontSize-${COMP}-lg`]: "$fontSize-2xl",
    [`gap-${COMP}-lg`]: "$space-4",

    [`paddingHorizontal-${COMP}-xl`]: "$space-10",
    [`paddingVertical-${COMP}-xl`]: "$space-4",
    [`fontSize-${COMP}-xl`]: "$fontSize-4xl",
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

export const fancyButtonRenderer = createUserDefinedComponentRenderer(
  FancyButtonMd,
  componentSource,
);
