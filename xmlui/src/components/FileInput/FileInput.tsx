import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dRequired,
} from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./FileInput.defaults";

const COMP = "FileInput";

const fileInputStylesSource = `
$borderRadius-FileInput--focus: createThemeVar("borderRadius-FileInput--focus");
$borderColor-FileInput--focus: createThemeVar("borderColor-FileInput--focus");
$backgroundColor-FileInput--focus: createThemeVar("backgroundColor-FileInput--focus");
$boxShadow-FileInput--focus: createThemeVar("boxShadow-FileInput--focus");
$textColor-FileInput--focus: createThemeVar("textColor-FileInput--focus");
$outlineWidth-FileInput--focus: createThemeVar("outlineWidth-FileInput--focus");
$outlineColor-FileInput--focus: createThemeVar("outlineColor-FileInput--focus");
$outlineStyle-FileInput--focus: createThemeVar("outlineStyle-FileInput--focus");
$outlineOffset-FileInput--focus: createThemeVar("outlineOffset-FileInput--focus");
`;

export const FileInputMd = createMetadata({
  status: "stable",
  description:
    "`FileInput` enables users to select files from their device's file system for upload or processing.",
  parts: {
    input: { description: "The file input area displaying selected file names." },
    label: { description: "The label displayed for the file input." },
  },
  defaultPart: "input",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(defaultProps.initialValue, "any"),
    value: { description: "Controlled file value.", valueType: "any" },
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: { description: "Validation status.", valueType: "string", defaultValue: defaultProps.validationStatus },
    buttonVariant: {
      description: "The button variant to use.",
      valueType: "string",
      availableValues: ["solid", "outlined", "ghost"],
      defaultValue: defaultProps.buttonVariant,
    },
    buttonLabel: {
      description: "This property is an optional string to set a label for the button part.",
      valueType: "string",
      defaultValue: defaultProps.buttonLabel,
    },
    buttonIcon: {
      description: "The ID of the icon to display in the button.",
      valueType: "icon",
    },
    buttonIconPosition: {
      description: "This optional string determines the location of the button icon.",
      valueType: "string",
      availableValues: ["start", "end"],
      defaultValue: defaultProps.buttonIconPosition,
    },
    acceptsFileType: {
      description: "An optional list of file types the input accepts.",
      valueType: "string[]",
    },
    multiple: {
      description: "Enables selecting multiple files.",
      valueType: "boolean",
      defaultValue: defaultProps.multiple,
    },
    directory: {
      description: "Allows selecting directories where browser-supported.",
      valueType: "boolean",
      defaultValue: defaultProps.directory,
    },
    buttonPosition: {
      description: "This property determines the position of the button relative to the input field.",
      valueType: "string",
      availableValues: ["start", "end"],
      defaultValue: defaultProps.buttonPosition,
    },
    buttonSize: {
      description: "The size of the button.",
      valueType: "string",
      availableValues: ["xs", "sm", "md", "lg", "xl"],
      defaultValue: defaultProps.buttonSize,
    },
    buttonThemeColor: {
      description: "The button color scheme.",
      valueType: "string",
      availableValues: ["attention", "primary", "secondary"],
      defaultValue: defaultProps.buttonThemeColor,
    },
    parseAs: {
      description: "Automatically parse file contents as CSV or JSON.",
      valueType: "string",
      availableValues: ["csv", "json"],
    },
    csvOptions: {
      description: "Configuration options for CSV parsing.",
      valueType: "any",
    },
    verboseValidationFeedback: { description: "Controls verbose validation feedback.", valueType: "boolean" },
    validationIconSuccess: { description: "Success validation icon.", valueType: "string" },
    validationIconError: { description: "Error validation icon.", valueType: "string" },
    invalidMessages: { description: "Invalid messages to display.", valueType: "string[]" },
    bindTo: { description: "Binds the file input to form data.", valueType: "string" },
    tooltip: { description: "The tooltip text.", valueType: "string" },
    tooltipMarkdown: { description: "The markdown tooltip text.", valueType: "string" },
    animation: { description: "The animation definition.", valueType: "any" },
    variant: { description: "The variant value.", valueType: "string" },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    parseError: {
      description: "This event is triggered when file parsing fails.",
      signature: "parseError(error: Error, file: File): void",
      parameters: {
        error: "The parsing error that occurred.",
        file: "The file that failed to parse.",
      },
    },
  },
  apis: {
    focus: { description: "Focuses the input field of the component.", signature: "focus(): void" },
    open: { description: "Triggers the file browsing dialog to open.", signature: "open(): void" },
    setValue: {
      description: "Sets the current value of the component.",
      signature: "setValue(files: File[]): void",
      parameters: { files: "An array of File objects to set as the current value." },
    },
    value: {
      description: "The current value of the component.",
      signature: "get value(): File[]",
    },
    inProgress: {
      description: "Indicates whether file parsing is currently in progress.",
      signature: "get inProgress(): boolean",
    },
    getFields: {
      description: "Returns the column headers from the most recently parsed CSV file.",
      signature: "getFields(): string[] | undefined",
    },
  },
  themeVars: extractScssThemeVars(fileInputStylesSource),
  defaultThemeVars: {
    "borderRadius-FileInput--focus": "$borderRadius-Input",
    "borderColor-FileInput--focus": "$borderColor-Input--focus",
    "backgroundColor-FileInput--focus": "$backgroundColor-Input",
    "boxShadow-FileInput--focus": "$boxShadow-Input",
    "textColor-FileInput--focus": "$textColor-Input",
    "outlineWidth-FileInput--focus": "$outlineWidth-Input--focus",
    "outlineColor-FileInput--focus": "$outlineColor-Input--focus",
    "outlineStyle-FileInput--focus": "$outlineStyle-Input--focus",
    "outlineOffset-FileInput--focus": "$outlineOffset-Input--focus",
  },
});

