import styles from "./FileInput.module.scss";
import compatStyles from "./FileInput.compat.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
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
  dValidationStatus,
} from "../../components/metadata-helpers";
import { buttonThemeNames, buttonVariantNames, iconPositionNames, sizeMd } from "../abstractions";
import { ThemedIcon } from "../Icon/Icon";
import { defaultProps } from "./FileInput.defaults";
import { FileInput, isFileArray } from "./FileInputReact";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";

const COMP = "FileInput";
const DEFAULT_ICON = "browse:FileInput";

export const FileInputMd = createMetadata({
  status: "stable",
  description:
    "`FileInput` enables users to select files from their device's file system for " +
    "upload or processing. It combines a text field displaying selected files with " +
    "a customizable button that opens the system file browser. Use it for forms, " +
    "media uploads, and document processing workflows.",
  parts: {
    label: {
      description: "The label displayed for the file input.",
    },
    input: {
      description: "The file input area displaying selected file names.",
    },
  },
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    buttonVariant: {
      description: "The button variant to use",
      valueType: "string",
      availableValues: buttonVariantNames,
    },
    buttonLabel: {
      description: `This property is an optional string to set a label for the button part.`,
      valueType: "string",
    },
    buttonIcon: {
      description:
        `The ID of the icon to display in the button. You can change the default icon for all ${COMP} ` +
        `instances with the "icon.browse:FileInput" declaration in the app configuration file.`,
      valueType: "icon",
    },
    buttonIconPosition: {
      description: `This optional string determines the location of the button icon.`,
      availableValues: iconPositionNames,
      valueType: "string",
      defaultValue: "start",
    },
    acceptsFileType: {
      description: `An optional list of file types the input controls accepts provided as a string array.`,
      valueType: "string[]",
    },
    multiple: {
      description:
        `This boolean property enables to add not just one (\`false\`), but multiple files to the field ` +
        `(\`true\`). This is done either by dragging onto the field or by selecting multiple files ` +
        `in the browser menu after clicking the input field button.`,
      valueType: "boolean",
      defaultValue: defaultProps.multiple,
    },
    directory: {
      description:
        `This boolean property indicates whether the component allows selecting directories (\`true\`) ` +
        `or files only (\`false\`).`,
      valueType: "boolean",
      defaultValue: defaultProps.directory,
    },
    buttonPosition: {
      description: `This property determines the position of the button relative to the input field.`,
      valueType: "string",
      availableValues: ["start", "end"],
      defaultValue: defaultProps.buttonPosition,
    },
    buttonSize: {
      description: "The size of the button (small, medium, large)",
      valueType: "string",
      availableValues: sizeMd,
    },
    buttonThemeColor: {
      description: "The button color scheme (primary, secondary, attention)",
      valueType: "string",
      availableValues: buttonThemeNames,
      defaultValue: defaultProps.buttonThemeColor,
    },
    parseAs: {
      description:
        `Automatically parse file contents as CSV or JSON. When set, the \`onDidChange\` event receives ` +
        `an object \`{ files: File[], parsedData: ParseResult[] }\` containing both the raw files and parsed data. ` +
        `Each \`ParseResult\` includes \`file\`, \`data\` (parsed rows), and optional \`error\`. ` +
        `When \`parseAs\` is set, \`acceptsFileType\` is automatically inferred (e.g., ".csv" or ".json") ` +
        `unless explicitly overridden. Empty files are handled gracefully, returning an empty data array.`,
      valueType: "string",
      availableValues: ["csv", "json"],
    },
    csvOptions: {
      description:
        `Configuration options for CSV parsing (used when \`parseAs="csv"\`). Supports all Papa Parse ` +
        `configuration options. Default options: \`{ header: true, skipEmptyLines: true }\`. ` +
        `Common options include \`delimiter\`, \`header\`, \`dynamicTyping\`, \`skipEmptyLines\`, and \`transform\`.`,
      valueType: "any",
    },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    parseError: {
      description:
        "This event is triggered when file parsing fails. Receives the error and the file that failed to parse.",
      signature: "parseError(error: Error, file: File): void",
      parameters: {
        error: "The parsing error that occurred",
        file: "The file that failed to parse",
      },
    },
  },
  apis: {
    value: {
      description:
        "This property holds the current value of the component, which is an array of files.",
      signature: "get value(): File[]",
    },
    setValue: {
      description: "This method sets the current value of the component.",
      signature: "setValue(files: File[]): void",
      parameters: {
        files: "An array of File objects to set as the current value of the component.",
      },
    },
    focus: {
      description: "This API command focuses the input field of the component.",
      signature: "focus(): void",
    },
    open: {
      description: "This API command triggers the file browsing dialog to open.",
      signature: "open(): void",
    },
    inProgress: {
      description:
        "This property indicates whether file parsing is currently in progress (when using parseAs).",
      signature: "get inProgress(): boolean",
    },
    getFields: {
      description: "This method returns the column headers from the most recently parsed CSV file.",
      signature: "getFields(): string[] | undefined",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
});

type ThemedFileInputProps = React.ComponentPropsWithoutRef<typeof FileInput>;

export const ThemedFileInput = React.forwardRef<HTMLDivElement, ThemedFileInputProps>(
  function ThemedFileInput({ className, ...props }, _ref) {
    const themeClass = useComponentThemeClass(FileInputMd);
    return <FileInput {...props} className={`${themeClass}${className ? ` ${className}` : ""}`} />;
  },
);

export const fileInputRenderer = wrapComponent(COMP, FileInput, FileInputMd, {
  exposeRegisterApi: true,
  customRender: (
    _props,
    { node, state, updateState, extractValue, lookupEventHandler, registerComponentApi, classes },
  ) => {
    const iconName = extractValue.asOptionalString(node.props.buttonIcon) || DEFAULT_ICON;
    return (
      <FileInput
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        variant={extractValue(node.props.buttonVariant)}
        buttonThemeColor={extractValue(node.props.buttonThemeColor)}
        buttonSize={extractValue(node.props.buttonSize)}
        buttonIcon={<ThemedIcon name={iconName} fallback="folder-open" />}
        buttonIconPosition={extractValue(node.props.buttonIconPosition)}
        buttonLabel={extractValue.asOptionalString(node.props.buttonLabel)}
        updateState={updateState}
        value={isFileArray(state?.value) ? state?.value : undefined}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        validationStatus={extractValue(node.props.validationStatus)}
        registerComponentApi={registerComponentApi}
        multiple={extractValue.asOptionalBoolean(node.props.multiple)}
        directory={extractValue.asOptionalBoolean(node.props.directory)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        buttonPosition={extractValue.asOptionalString(node.props.buttonPosition)}
        initialValue={extractValue(node.props.initialValue)}
        acceptsFileType={extractValue(node.props.acceptsFileType)}
        required={extractValue.asOptionalBoolean(node.props.required)}
        parseAs={extractValue.asOptionalString(node.props.parseAs) as "csv" | "json" | undefined}
        csvOptions={extractValue(node.props.csvOptions)}
        onParseError={lookupEventHandler("parseError")}
        classes={classes}
      />
    );
  },
});

type RuntimeFileInputProps = React.ComponentProps<typeof FileInput> & {
  adapter: XmluiComponentAdapter;
};

function RuntimeFileInputShell({
  adapter,
  value,
  initialValue,
  onDidChange,
  onFocus,
  onBlur,
  onParseError,
  ...props
}: RuntimeFileInputProps) {
  const [localValue, setLocalValue] = React.useState(value ?? initialValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const updateState = React.useCallback((state: Record<string, unknown>) => {
    setLocalValue(state.value);
    adapter.registerApi({ value: state.value });
  }, [adapter]);

  return (
    <ThemedFileInput
      {...props}
      value={value ?? localValue}
      initialValue={initialValue}
      updateState={updateState}
      registerComponentApi={adapter.registerApi}
      onDidChange={(nextValue) => {
        setLocalValue(nextValue);
        onDidChange?.(nextValue);
        void adapter.event("didChange")(nextValue);
      }}
      onFocus={() => {
        onFocus?.();
        void adapter.event("gotFocus")();
      }}
      onBlur={() => {
        onBlur?.();
        void adapter.event("lostFocus")();
      }}
      onParseError={(error, file) => {
        onParseError?.(error, file);
        void adapter.event("parseError")(error, file);
      }}
    />
  );
}

function runtimeFileInputProps(adapter: XmluiComponentAdapter) {
  const {
    className,
    ...rootAttrs
  } = adapter.rootAttrs("input") as React.HTMLAttributes<HTMLDivElement>;
  const iconName = adapter.stringProp("buttonIcon") || DEFAULT_ICON;
  return {
    ...rootAttrs,
    className: [className, compatStyles.fileInputRoot].filter(Boolean).join(" "),
    id: adapter.stringProp("id"),
    value: adapter.prop("value"),
    initialValue: adapter.prop("initialValue", defaultProps.initialValue),
    acceptsFileType: adapter.prop("acceptsFileType"),
    multiple: adapter.booleanProp("multiple", defaultProps.multiple),
    directory: adapter.booleanProp("directory", defaultProps.directory),
    placeholder: adapter.stringProp("placeholder"),
    buttonLabel: adapter.stringProp("buttonLabel", defaultProps.buttonLabel),
    buttonIcon: <ThemedIcon name={iconName} fallback="folder-open" />,
    buttonIconPosition: adapter.stringProp("buttonIconPosition", defaultProps.buttonIconPosition) as React.ComponentProps<typeof FileInput>["buttonIconPosition"],
    buttonPosition: adapter.stringProp("buttonPosition", defaultProps.buttonPosition) as React.ComponentProps<typeof FileInput>["buttonPosition"],
    buttonSize: adapter.stringProp("buttonSize", defaultProps.buttonSize) as React.ComponentProps<typeof FileInput>["buttonSize"],
    buttonThemeColor: adapter.stringProp("buttonThemeColor", defaultProps.buttonThemeColor) as React.ComponentProps<typeof FileInput>["buttonThemeColor"],
    variant: adapter.stringProp("buttonVariant") as React.ComponentProps<typeof FileInput>["variant"],
    enabled: adapter.booleanProp("enabled", defaultProps.enabled),
    readOnly: adapter.booleanProp("readOnly", false),
    required: adapter.booleanProp("required", false),
    autoFocus: adapter.booleanProp("autoFocus", false),
    validationStatus: adapter.stringProp("validationStatus", defaultProps.validationStatus) as React.ComponentProps<typeof FileInput>["validationStatus"],
    invalidMessages: adapter.prop("invalidMessages") as string[] | undefined,
    parseAs: adapter.stringProp("parseAs") as React.ComponentProps<typeof FileInput>["parseAs"],
    csvOptions: adapter.prop("csvOptions") as React.ComponentProps<typeof FileInput>["csvOptions"],
    classes: { [COMPONENT_PART_KEY]: adapter.className },
  };
}

Object.assign(FileInputMd, {
  defaultPart: "input",
} satisfies Partial<ComponentMetadata>);

export const fileInputRuntimeRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: FileInputMd,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <RuntimeFileInputShell adapter={adapter} {...runtimeFileInputProps(adapter)} />
  ),
});
