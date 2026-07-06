import styles from "./TextArea.module.scss";
import compatStyles from "./TextArea.compat.module.scss";

import { type PropertyValueDescription } from "../../abstractions/ComponentDefs";
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
  dMaxLength,
  dPlaceholder,
  dReadonly,
  dRequired,
  dSetValueApi,
  dValidationStatus,
} from "../metadata-helpers";
import { type ResizeOptions, TextArea } from "./TextAreaReact";
import { defaultProps } from "./TextArea.defaults";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { useFormContext } from "../Form/FormContext";

const COMP = "TextArea";

export const resizeOptionsMd: PropertyValueDescription[] = [
  { value: "(undefined)", description: "No resizing" },
  { value: "horizontal", description: "Can only resize horizontally" },
  { value: "vertical", description: "Can only resize vertically" },
  { value: "both", description: "Can resize in both dimensions" },
];

export const TextAreaMd = createMetadata({
  status: "stable",
  description: "`TextArea` provides a multiline text input area.",
  parts: {
    label: {
      description: "The label displayed for the text area.",
    },
    startAdornment: {
      description: "The adornment displayed at the start of the text area.",
    },
    endAdornment: {
      description: "The adornment displayed at the end of the text area.",
    },
    input: {
      description: "The text area input.",
    },
  },
  props: {
    enterSubmits: {
      description:
        "This optional boolean property indicates whether pressing the \`Enter\` key on the " +
        "keyboard prompts the parent \`Form\` component to submit.",
      valueType: "boolean",
      defaultValue: defaultProps.enterSubmits,
    },
    escResets: {
      description:
        `This boolean property indicates whether the ${COMP} contents should be reset when pressing ` +
        `the ESC key.`,
      valueType: "boolean",
      defaultValue: false,
    },
    maxRows: {
      description:
        `This optional property sets the maximum number of text rows the \`${COMP}\` ` +
        "can grow. If not set, the number of rows is unlimited.",
      valueType: "number",
    },
    minRows: {
      description:
        `This optional property sets the minimum number of text rows the \`${COMP}\` can shrink. ` +
        `If not set, the minimum number of rows is 1.`,
      valueType: "number",
    },
    rows: {
      description: `Specifies the number of rows the component initially has.`,
      valueType: "number",
      defaultValue: defaultProps.rows,
    },
    autoSize: {
      description:
        `If set to \`true\`, this boolean property enables the \`${COMP}\` to resize ` +
        `automatically based on the number of lines inside it.`,
      valueType: "boolean",
      defaultValue: false,
    },
    placeholder: dPlaceholder(),
    initialValue: {
      ...dInitialValue(),
      valueType: "string",
    },
    maxLength: dMaxLength(),
    autoFocus: dAutoFocus(),
    autoComplete: {
      description:
        "Sets the HTML `autocomplete` attribute on the underlying text area. " +
        'Boolean values are passed as `"on"` or `"off"`; string values are passed through.',
      valueType: "any",
      defaultValue: defaultProps.autoComplete,
    },
    autoCorrect: {
      description:
        "Sets the HTML `autocorrect` attribute on the underlying text area. " +
        'When set, `true` is passed as `"on"` and `false` as `"off"`.',
      valueType: "boolean",
    },
    spellCheck: {
      description: "Sets the HTML `spellcheck` attribute on the underlying text area.",
      valueType: "boolean",
    },
    autoCapitalize: {
      description: "Sets the HTML `autocapitalize` attribute on the underlying text area.",
      valueType: "string",
      availableValues: ["off", "none", "sentences", "words", "characters"],
      isStrictEnum: true,
    },
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    resize: {
      description:
        `This optional property specifies in which dimensions can the \`TextArea\` ` +
        `be resized by the user.`,
      availableValues: resizeOptionsMd,
      valueType: "string",
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in input components.",
      valueType: "boolean",
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      valueType: "icon",
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      valueType: "icon",
    },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: `This method sets the focus on the \`${COMP}\` component.`,
      signature: "focus(): void",
    },
    value: {
      description: `You can query the component's value. If no value is set, it will retrieve \`undefined\`.`,
      signature: "get value(): string | undefined",
    },
    setValue: dSetValueApi(),
    insert: {
      description: `This method inserts the specified text at the current cursor position of the \`${COMP}\` component, leaving the caret just after the inserted text.`,
      signature: "insert(text: string): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`paddingVertical-${COMP}`]: "$space-2",
    [`paddingHorizontal-${COMP}`]: "$space-2",
  },
});

type ThemedTextAreaProps = React.ComponentPropsWithoutRef<typeof TextArea>;

export const ThemedTextArea = React.forwardRef<
  React.ElementRef<typeof TextArea>,
  ThemedTextAreaProps
>(function ThemedTextArea({ classes, ...props }, ref) {
  const themeClass = useComponentThemeClass(TextAreaMd);
  const themedClasses: Record<string, string> = {
    ...(classes ?? {}),
    [COMPONENT_PART_KEY]: [themeClass, classes?.[COMPONENT_PART_KEY]].filter(Boolean).join(" "),
  };
  return <TextArea {...props} classes={themedClasses} ref={ref} />;
});

export const textAreaComponentRenderer = wrapComponent(COMP, TextArea, TextAreaMd, {
  exposeRegisterApi: true,
  // resize is passed raw (not through extractValue). rows is valueType: "number" but
  // maxRows/minRows are not — use customRender to preserve exact original extraction.
  customRender: (
    _props,
    { node, extractValue, state, updateState, classes, registerComponentApi, lookupEventHandler },
  ) => (
    <ThemedTextArea
      value={state?.value}
      initialValue={extractValue(node.props.initialValue)}
      updateState={updateState}
      autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
      autoComplete={extractValue(node.props.autoComplete) ?? defaultProps.autoComplete}
      autoCorrect={extractValue.asOptionalBoolean(node.props.autoCorrect)}
      spellCheck={extractValue.asOptionalBoolean(node.props.spellCheck)}
      autoCapitalize={extractValue.asOptionalString(node.props.autoCapitalize)}
      enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      placeholder={extractValue(node.props.placeholder)}
      onDidChange={lookupEventHandler("didChange")}
      onFocus={lookupEventHandler("gotFocus")}
      onBlur={lookupEventHandler("lostFocus")}
      readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
      resize={node.props.resize as ResizeOptions}
      enterSubmits={extractValue.asOptionalBoolean(node.props.enterSubmits)}
      escResets={extractValue.asOptionalBoolean(node.props.escResets)}
      classes={classes}
      registerComponentApi={registerComponentApi}
      maxRows={extractValue.asOptionalNumber(node.props.maxRows)}
      minRows={extractValue.asOptionalNumber(node.props.minRows)}
      maxLength={extractValue.asOptionalNumber(node.props.maxLength)}
      rows={extractValue.asOptionalNumber(node.props.rows)}
      autoSize={extractValue.asOptionalBoolean(node.props.autoSize)}
      validationStatus={extractValue(node.props.validationStatus)}
      required={extractValue.asOptionalBoolean(node.props.required)}
      verboseValidationFeedback={extractValue.asOptionalBoolean(
        node.props.verboseValidationFeedback,
      )}
      validationIconSuccess={extractValue.asOptionalString(node.props.validationIconSuccess)}
      validationIconError={extractValue.asOptionalString(node.props.validationIconError)}
    />
  ),
});

type RuntimeTextAreaProps = React.ComponentProps<typeof TextArea> & {
  adapter: XmluiComponentAdapter;
  bindTo?: string;
  rootAttrs?: React.HTMLAttributes<HTMLDivElement>;
};

function RuntimeTextAreaShell({
  adapter,
  bindTo,
  value,
  initialValue,
  invalidMessages,
  required,
  validationStatus,
  verboseValidationFeedback,
  onDidChange,
  rootAttrs,
  ...props
}: RuntimeTextAreaProps) {
  const form = useFormContext();
  const formRef = React.useRef(form);
  const adapterRef = React.useRef(adapter);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const fieldName = bindTo;
  const formValue = fieldName ? form?.getValue(fieldName) : undefined;
  const formError = fieldName ? form?.errors[fieldName] : undefined;
  const controlledValue = stringValue(value);
  const initial = stringValue(initialValue) ?? "";
  const [localValue, setLocalValue] = React.useState(
    stringValue(formValue) ?? controlledValue ?? initial,
  );
  const apiRef = React.useRef<Record<string, unknown>>({});
  const lastRegisteredValueRef = React.useRef<unknown>(undefined);
  formRef.current = form;
  adapterRef.current = adapter;

  React.useEffect(() => {
    const nextValue = stringValue(formValue) ?? controlledValue;
    if (nextValue !== undefined) {
      setLocalValue(nextValue);
    }
  }, [controlledValue, formValue]);

  React.useEffect(() => {
    if (!form || !fieldName) {
      return;
    }
    return form.registerItem({
      name: fieldName,
      required,
    });
  }, [fieldName, required]);

  React.useEffect(() => {
    const formElement = textAreaRef.current?.form;
    if (!formElement) {
      return;
    }
    const handleReset = () => {
      setLocalValue(initial);
      if (formRef.current && fieldName) {
        formRef.current.setValue(fieldName, initial);
      }
    };
    formElement.addEventListener("reset", handleReset);
    return () => formElement.removeEventListener("reset", handleReset);
  }, [fieldName, initial]);

  const registerApi = React.useCallback((api: Record<string, unknown>) => {
    const normalizedApi = {
      ...api,
      setValue:
        typeof api.setValue === "function"
          ? (value: unknown) => (api.setValue as (value: unknown) => void)(normalizeTextAreaApiValue(value))
          : api.setValue,
      insert:
        typeof api.insert === "function"
          ? (value: unknown) => (api.insert as (value: unknown) => void)(normalizeTextAreaApiValue(value))
          : api.insert,
    };
    apiRef.current = normalizedApi;
    lastRegisteredValueRef.current = localValue;
    adapterRef.current.registerApi({
      ...normalizedApi,
      value: localValue,
    });
  }, [localValue]);

  React.useEffect(() => {
    if (lastRegisteredValueRef.current === localValue) {
      return;
    }
    lastRegisteredValueRef.current = localValue;
    adapterRef.current.registerApi({
      ...apiRef.current,
      value: localValue,
    });
  }, [localValue]);

  const updateState = React.useCallback((state: Record<string, unknown>, options?: { initial?: boolean }) => {
    if (typeof state.value === "string") {
      setLocalValue(state.value);
      const currentForm = formRef.current;
      if (currentForm && fieldName && !options?.initial) {
        currentForm.setValue(fieldName, state.value);
        void currentForm.validateField(fieldName, state.value);
      }
    }
  }, [fieldName]);

  const effectiveValidationStatus = formError
    ? "error"
    : required && localValue
      ? "valid"
      : validationStatus;
  const effectiveInvalidMessages = formError ? formError.split("\n") : invalidMessages;
  const effectiveVerboseValidationFeedback =
    verboseValidationFeedback ?? form?.verboseValidationFeedback ?? true;

  const renderedTextArea = (
    <TextArea
      {...props}
      ref={textAreaRef}
      value={controlledValue ?? localValue}
      initialValue={initial}
      updateState={updateState}
      registerComponentApi={registerApi}
      required={required}
      validationStatus={effectiveValidationStatus}
      invalidMessages={effectiveInvalidMessages}
      verboseValidationFeedback={effectiveVerboseValidationFeedback}
      onDidChange={(newValue) => {
        onDidChange?.(newValue);
        void adapter.event("didChange")(newValue);
      }}
      onFocus={() => {
        void adapter.event("gotFocus")();
      }}
      onBlur={() => {
        void adapter.event("lostFocus")();
      }}
    />
  );

  if (formError && effectiveVerboseValidationFeedback) {
    return (
      <div {...rootAttrs}>
        {renderedTextArea}
        <div data-validation-display-severity="error">{formError}</div>
      </div>
    );
  }

  return <div {...rootAttrs}>{renderedTextArea}</div>;
}

function runtimeTextAreaProps(adapter: XmluiComponentAdapter) {
  const rootAttrs = adapter.rootAttrs("input") as React.HTMLAttributes<HTMLDivElement>;
  const { onFocus, onBlur, onChange, ...safeRootAttrs } = rootAttrs;
  return {
    id: adapter.stringProp("id"),
    bindTo: adapter.stringProp("bindTo"),
    value: stringValue(adapter.prop("value")),
    initialValue: adapter.prop("initialValue", defaultProps.initialValue),
    maxLength: adapter.prop("maxLength") as number | undefined,
    rows: adapter.prop("rows", defaultProps.rows) as number | undefined,
    minRows: adapter.prop("minRows") as number | undefined,
    maxRows: adapter.prop("maxRows") as number | undefined,
    autoSize: adapter.booleanProp("autoSize", false),
    resize: adapter.stringProp("resize") as ResizeOptions | undefined,
    enabled: adapter.booleanProp("enabled", defaultProps.enabled),
    placeholder: adapter.stringProp("placeholder", defaultProps.placeholder),
    validationStatus: adapter.stringProp("validationStatus") as React.ComponentProps<typeof TextArea>["validationStatus"],
    invalidMessages: adapter.prop("invalidMessages") as string[] | undefined,
    autoFocus: adapter.booleanProp("autoFocus", false),
    autoComplete: adapter.prop("autoComplete", defaultProps.autoComplete) as string | boolean,
    autoCorrect: adapter.prop("autoCorrect") as boolean | undefined,
    spellCheck: adapter.prop("spellCheck") as boolean | undefined,
    autoCapitalize: adapter.stringProp("autoCapitalize"),
    readOnly: adapter.booleanProp("readOnly", false),
    required: adapter.booleanProp("required", false),
    "aria-label": adapter.stringProp("label"),
    enterSubmits: adapter.booleanProp("enterSubmits", defaultProps.enterSubmits),
    escResets: adapter.booleanProp("escResets", false),
    verboseValidationFeedback: Object.prototype.hasOwnProperty.call(
      adapter.props,
      "verboseValidationFeedback",
    )
      ? adapter.booleanProp("verboseValidationFeedback", true)
      : undefined,
    validationIconSuccess: adapter.stringProp("validationIconSuccess"),
    validationIconError: adapter.stringProp("validationIconError"),
    classes: { [COMPONENT_PART_KEY]: adapter.className },
    className: compatStyles.textarea,
    rootAttrs: safeRootAttrs,
  };
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === "function") {
    return String({});
  }
  return value === undefined || value === null ? undefined : String(value);
}

function normalizeTextAreaApiValue(value: unknown): unknown {
  return typeof value === "string"
    ? value.replace(/\\n/g, "\n").replace(/\\t/g, "\t")
    : value;
}

const textAreaInputThemeAliases = {
  "backgroundColor-Input": "transparent",
  "borderRadius-Input": "$borderRadius",
  "textColor-Input": "$textColor-primary",
  "backgroundColor-Input--disabled": "$backgroundColor--disabled",
  "borderWidth-Input": "1px",
  "borderStyle-Input": "solid",
  "borderColor-Input--disabled": "$borderColor--disabled",
  "textColor-Input--disabled": "$textColor--disabled",
  "borderColor-Input": "$borderColor-Input-default",
  "borderColor-Input--hover": "$borderColor-Input-default--hover",
  "borderColor-Input--error": "$borderColor-Input-default--error",
  "borderColor-Input--warning": "$borderColor-Input-default--warning",
  "borderColor-Input--success": "$borderColor-Input-default--success",
  "textColor-placeholder-Input": "$textColor-subtitle",
  "outlineColor-Input--focus": "$outlineColor--focus",
  "outlineWidth-Input--focus": "$outlineWidth--focus",
  "outlineStyle-Input--focus": "$outlineStyle--focus",
  "outlineOffset-Input--focus": "$outlineOffset--focus",
  [`backgroundColor-${COMP}`]: "$backgroundColor-Input",
  [`backgroundColor-${COMP}--disabled`]: "$backgroundColor-Input--disabled",
  [`borderRadius-${COMP}`]: "$borderRadius-Input",
  [`borderColor-${COMP}`]: "$borderColor-Input",
  [`borderWidth-${COMP}`]: "$borderWidth-Input",
  [`borderStyle-${COMP}`]: "$borderStyle-Input",
  [`fontSize-${COMP}`]: "inherit",
  [`boxShadow-${COMP}`]: "none",
  [`textColor-${COMP}`]: "$textColor-Input",
  [`borderColor-${COMP}--hover`]: "$borderColor-Input--hover",
  [`backgroundColor-${COMP}--hover`]: "$backgroundColor-Input",
  [`boxShadow-${COMP}--hover`]: "none",
  [`textColor-${COMP}--hover`]: "$textColor-Input",
  [`borderColor-${COMP}--focus`]: "$borderColor-Input",
  [`backgroundColor-${COMP}--focus`]: "$backgroundColor-Input",
  [`boxShadow-${COMP}--focus`]: "none",
  [`textColor-${COMP}--focus`]: "$textColor-Input",
  [`outlineColor-${COMP}--focus`]: "$outlineColor-Input--focus",
  [`outlineWidth-${COMP}--focus`]: "$outlineWidth-Input--focus",
  [`outlineStyle-${COMP}--focus`]: "$outlineStyle-Input--focus",
  [`outlineOffset-${COMP}--focus`]: "$outlineOffset-Input--focus",
  [`textColor-placeholder-${COMP}`]: "$textColor-placeholder-Input",
  [`fontSize-placeholder-${COMP}`]: "inherit",
  [`textColor-${COMP}--disabled`]: "$textColor-Input--disabled",
  [`borderColor-${COMP}--disabled`]: "$borderColor-Input--disabled",
  [`paddingHorizontal-${COMP}`]: "$space-2",
  [`paddingVertical-${COMP}`]: "$space-2",
  [`borderRadius-${COMP}--error`]: `$borderRadius-${COMP}`,
  [`borderRadius-${COMP}--warning`]: `$borderRadius-${COMP}`,
  [`borderRadius-${COMP}--success`]: `$borderRadius-${COMP}`,
  [`borderColor-${COMP}--error`]: "$borderColor-Input--error",
  [`borderColor-${COMP}--warning`]: "$borderColor-Input--warning",
  [`borderColor-${COMP}--success`]: "$borderColor-Input--success",
  [`borderWidth-${COMP}--error`]: `$borderWidth-${COMP}`,
  [`borderWidth-${COMP}--warning`]: `$borderWidth-${COMP}`,
  [`borderWidth-${COMP}--success`]: `$borderWidth-${COMP}`,
  [`borderStyle-${COMP}--error`]: `$borderStyle-${COMP}`,
  [`borderStyle-${COMP}--warning`]: `$borderStyle-${COMP}`,
  [`borderStyle-${COMP}--success`]: `$borderStyle-${COMP}`,
  [`fontSize-${COMP}--error`]: `$fontSize-${COMP}`,
  [`fontSize-${COMP}--warning`]: `$fontSize-${COMP}`,
  [`fontSize-${COMP}--success`]: `$fontSize-${COMP}`,
  [`backgroundColor-${COMP}--error`]: `$backgroundColor-${COMP}`,
  [`backgroundColor-${COMP}--warning`]: `$backgroundColor-${COMP}`,
  [`backgroundColor-${COMP}--success`]: `$backgroundColor-${COMP}`,
  [`boxShadow-${COMP}--error`]: `$boxShadow-${COMP}`,
  [`boxShadow-${COMP}--warning`]: `$boxShadow-${COMP}`,
  [`boxShadow-${COMP}--success`]: `$boxShadow-${COMP}`,
  [`textColor-${COMP}--error`]: `$textColor-${COMP}`,
  [`textColor-${COMP}--warning`]: `$textColor-${COMP}`,
  [`textColor-${COMP}--success`]: `$textColor-${COMP}`,
  [`borderColor-${COMP}--error--hover`]: `$borderColor-${COMP}--error`,
  [`borderColor-${COMP}--warning--hover`]: `$borderColor-${COMP}--warning`,
  [`borderColor-${COMP}--success--hover`]: `$borderColor-${COMP}--success`,
  [`backgroundColor-${COMP}--error--hover`]: `$backgroundColor-${COMP}--error`,
  [`backgroundColor-${COMP}--warning--hover`]: `$backgroundColor-${COMP}--warning`,
  [`backgroundColor-${COMP}--success--hover`]: `$backgroundColor-${COMP}--success`,
  [`boxShadow-${COMP}--error--hover`]: `$boxShadow-${COMP}--error`,
  [`boxShadow-${COMP}--warning--hover`]: `$boxShadow-${COMP}--warning`,
  [`boxShadow-${COMP}--success--hover`]: `$boxShadow-${COMP}--success`,
  [`textColor-${COMP}--error--hover`]: `$textColor-${COMP}--error`,
  [`textColor-${COMP}--warning--hover`]: `$textColor-${COMP}--warning`,
  [`textColor-${COMP}--success--hover`]: `$textColor-${COMP}--success`,
};

Object.assign(TextAreaMd.defaultThemeVars ??= {}, textAreaInputThemeAliases);

export const textAreaRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: TextAreaMd as ComponentMetadata,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <RuntimeTextAreaShell adapter={adapter} {...runtimeTextAreaProps(adapter)} />
  ),
});
