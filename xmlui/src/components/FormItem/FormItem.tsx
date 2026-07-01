import {
  createMetadata,
  dAutoFocus,
  dComponent,
  dEnabled,
  dRequired,
} from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";

const COMP = "FormItem";
const formItemStylesSource = `
$gap-FormItem: createThemeVar("gap-FormItem");
$gap-label-FormItem: createThemeVar("gap-label-FormItem");
$width-label-FormItem: createThemeVar("width-label-FormItem");
$textColor-label-FormItem: createThemeVar("textColor-label-FormItem");
$textColor-label-formItem: createThemeVar("textColor-label-formItem");
$fontFamily-label-formItem: createThemeVar("fontFamily-label-formItem");
$fontSize-label-formItem: createThemeVar("fontSize-label-formItem");
$fontWeight-label-FormItem: createThemeVar("fontWeight-label-FormItem");
$fontWeight-label-formItem: createThemeVar("fontWeight-label-formItem");
$fontStyle-label-formItem: createThemeVar("fontStyle-label-formItem");
$textTransform-label-formItem: createThemeVar("textTransform-label-formItem");
$textColor-requiredMark-formItem: createThemeVar("textColor-requiredMark-formItem");
$textColor-optionalTag-formItem: createThemeVar("textColor-optionalTag-formItem");
$textColor-error-FormItem: createThemeVar("textColor-error-FormItem");
$fontSize-error-FormItem: createThemeVar("fontSize-error-FormItem");
$borderColor-input-FormItem--error: createThemeVar("borderColor-input-FormItem--error");
`;

export const FormItemMd = createMetadata({
  status: "experimental",
  description:
    "`FormItem` connects a form field to form data, displays a label, and reports validation feedback.",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    bindTo: { description: "The form data field name.", valueType: "string" },
    label: { description: "The form item label.", valueType: "string" },
    labelPosition: {
      description: "Controls the label position.",
      valueType: "string",
      availableValues: ["top", "start", "before", "end", "after"],
      defaultValue: "top",
    },
    labelWidth: { description: "Sets the label width.", valueType: "length" },
    labelBreak: { description: "Allows label line breaks.", valueType: "boolean" },
    requireLabelMode: {
      description: "Controls whether required and optional markers are shown next to the label.",
      valueType: "string",
      availableValues: ["markRequired", "markOptional", "markBoth"],
      defaultValue: "markRequired",
    },
    enabled: dEnabled(true),
    autoFocus: dAutoFocus(),
    type: {
      description: "The native fallback input type for this foundation implementation.",
      valueType: "string",
      defaultValue: "text",
    },
    initialValue: { description: "Initial value when form data does not contain the bound field.", valueType: "any" },
    required: dRequired(),
    requiredInvalidMessage: {
      description: "Validation message used when a required field is empty.",
      valueType: "string",
    },
    minLength: {
      description: "Minimum allowed string length.",
      valueType: "number",
    },
    lengthInvalidMessage: {
      description: "Validation message displayed when length validation fails.",
      valueType: "string",
    },
    pattern: {
      description: "Predefined pattern validator name or regular expression.",
      valueType: "string",
    },
    patternInvalidMessage: {
      description: "Validation message displayed when pattern validation fails.",
      valueType: "string",
    },
    patternInvalidSeverity: {
      description: "Severity level applied to pattern validation failures.",
      valueType: "string",
      availableValues: ["error", "warning"],
      defaultValue: "error",
    },
    regex: {
      description: "Regular expression used to validate the field value.",
      valueType: "string",
    },
    regexInvalidMessage: {
      description: "Validation message displayed when regex validation fails.",
      valueType: "string",
    },
    regexInvalidSeverity: {
      description: "Severity level applied to regex validation failures.",
      valueType: "string",
      availableValues: ["error", "warning"],
      defaultValue: "error",
    },
    validationMode: {
      description: "Controls when field validation feedback is shown.",
      valueType: "string",
      availableValues: ["onChanged", "onLostFocus", "errorLate"],
    },
    searchable: {
      description: "Pass-through option for select-like FormItem controls.",
      valueType: "boolean",
    },
    groupBy: {
      description: "Pass-through option for grouped select-like FormItem controls.",
      valueType: "string",
    },
    groupHeaderTemplate: dComponent("Template rendered for grouped select headers."),
    ungroupedHeaderTemplate: dComponent("Template rendered before ungrouped select options."),
    customValidationsDebounce: {
      description: "Debounces custom validation after value changes by the specified number of milliseconds.",
      valueType: "number",
      defaultValue: 0,
    },
    inputTemplate: dComponent("This property is used to define a custom input template."),
    matchValue: {
      description: "The value this field must match.",
      valueType: "any",
    },
    matchInvalidMessage: {
      description: "Validation message displayed when the field value does not match `matchValue`.",
      valueType: "string",
    },
  },
  events: {
    validate: {
      description: "This event is used to define a custom validation function.",
    },
  },
  themeVars: extractScssThemeVars(formItemStylesSource),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$space-1",
    [`gap-label-${COMP}`]: "$space-2",
    [`width-label-${COMP}`]: "12rem",
    [`textColor-label-${COMP}`]: "$textColor",
    "textColor-label-formItem": "$textColor",
    "fontFamily-label-formItem": "$fontFamily",
    "fontSize-label-formItem": "$fontSize-sm",
    [`fontWeight-label-${COMP}`]: "$fontWeight-medium",
    "fontWeight-label-formItem": "$fontWeight-medium",
    "fontStyle-label-formItem": "normal",
    "textTransform-label-formItem": "none",
    "textColor-requiredMark-formItem": "$color-danger-500",
    "textColor-optionalTag-formItem": "$textColor-secondary",
    [`textColor-error-${COMP}`]: "$color-danger-500",
    [`fontSize-error-${COMP}`]: "$fontSize-sm",
    [`borderColor-input-${COMP}--error`]: "$color-danger-500",
  },
});
