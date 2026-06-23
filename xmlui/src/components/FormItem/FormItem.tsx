import {
  createMetadata,
  dAutoFocus,
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
$fontWeight-label-FormItem: createThemeVar("fontWeight-label-FormItem");
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
  },
  themeVars: extractScssThemeVars(formItemStylesSource),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$space-1",
    [`gap-label-${COMP}`]: "$space-2",
    [`width-label-${COMP}`]: "12rem",
    [`textColor-label-${COMP}`]: "$textColor",
    [`fontWeight-label-${COMP}`]: "$fontWeight-semibold",
    [`textColor-error-${COMP}`]: "$color-danger-500",
    [`fontSize-error-${COMP}`]: "$fontSize-sm",
    [`borderColor-input-${COMP}--error`]: "$color-danger-500",
  },
});
