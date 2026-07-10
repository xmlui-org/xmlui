import styles from "./TimeInput.module.scss";
import compatStyles from "./TimeInputCompat.module.scss";

import React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dEndIcon,
  dEndText,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dReadonly,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import { TimeInputNative } from "./TimeInputReact";
import { defaultProps } from "./TimeInput.defaults";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { useFormContext } from "../Form/FormContext";
import { FormItemContext } from "../FormItem/FormItemContext";
import { resolveFormItemId } from "../FormItem/FormItemUtils";
import { readContext } from "../../runtime/state";

const COMP = "TimeInput";

export const TimeInputMd = createMetadata({
  status: "experimental",
  description:
    "`TimeInput` provides time input with support for 12-hour and 24-hour formats " +
    "and configurable precision for hours, minutes, and seconds.",
  parts: {
    hour: {
      description: "The hour input field.",
    },
    minute: {
      description: "The minute input field.",
    },
    second: {
      description: "The second input field.",
    },
    ampm: {
      description: "The AM/PM indicator.",
    },
    clearButton: {
      description: "The button to clear the time input.",
    },
  },
  props: {
    initialValue: {
      ...dInitialValue(),
      valueType: "string",
    },
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    hour24: {
      description: "Whether to use 24-hour format (true) or 12-hour format with AM/PM (false)",
      valueType: "boolean",
      defaultValue: defaultProps.hour24,
    },
    seconds: {
      description: "Whether to show and allow input of seconds",
      valueType: "boolean",
      defaultValue: defaultProps.seconds,
    },
    minTime: {
      description: "Minimum time that the user can select",
      valueType: "string",
    },
    maxTime: {
      description: "Maximum time that the user can select",
      valueType: "string",
    },
    clearable: {
      description: "Whether to show a clear button that allows clearing the selected time",
      valueType: "boolean",
      defaultValue: defaultProps.clearable,
    },
    clearIcon: {
      description: "The icon to display in the clear button.",
      valueType: "icon",
    },
    clearToInitialValue: {
      description: "Whether the clear button resets the time input to its initial value",
      valueType: "boolean",
      defaultValue: defaultProps.clearToInitialValue,
    },
    required: {
      description: "Whether the time input should be required",
      valueType: "boolean",
      defaultValue: defaultProps.required,
    },
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
    gap: {
      description:
        "This property defines the gap between the adornments and the input area. If not " +
        "set, the gap declared by the current theme is used.",
      valueType: "string",
    },
    emptyCharacter: {
      description:
        "Character to use as placeholder for empty time values. If longer than 1 character, uses the first character. Defaults to '-'",
      valueType: "string",
      defaultValue: defaultProps.emptyCharacter,
    },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    invalidTime: {
      description: "Fired when the user enters an invalid time",
      signature: "invalidTime(value: string): void",
      parameters: {
        value: "The invalid time value that was entered.",
      },
    },
  },
  apis: {
    focus: {
      description: `Focus the ${COMP} component.`,
      signature: "focus(): void",
    },
    value: {
      description: `You can query the component's value. If no value is set, it will retrieve \`undefined\`.`,
      signature: "get value(): any",
    },
    setValue: {
      description: `This method sets the current value of the ${COMP}.`,
      signature: "set value(value: any): void",
      parameters: {
        value: "The new time value to set for the time picker.",
      },
    },
    isoValue: {
      description: `Get the current time value formatted in ISO standard (HH:MM:SS) using 24-hour format, suitable for JSON serialization.`,
      signature: "isoValue(): string | null",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // TimeInput specific theme variables
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`color-divider-${COMP}`]: "$textColor-secondary",
    [`spacing-divider-${COMP}`]: "1px 0",
    [`width-input-${COMP}`]: "1.8em",
    [`minWidth-input-${COMP}`]: "0.54em",
    [`padding-input-${COMP}`]: "0 2px",
    [`textAlign-input-${COMP}`]: "center",
    [`fontSize-input-${COMP}`]: "inherit",
    [`borderRadius-input-${COMP}`]: "$borderRadius",
    [`backgroundColor-input-${COMP}-invalid`]: "rgba(220, 53, 69, 0.15)",
    [`padding-button-${COMP}`]: "4px 4px",
    [`borderRadius-button-${COMP}`]: "$borderRadius",
    [`hoverColor-button-${COMP}`]: "$color-surface-800",
    [`disabledColor-button-${COMP}`]: "$textColor-disabled",
    [`outlineColor-button-${COMP}--focused`]: "$color-accent-500",
    [`outlineWidth-button-${COMP}--focused`]: "2px",
    [`outlineOffset-button-${COMP}--focused`]: "0",
    [`minWidth-ampm-${COMP}`]: "2.2em",
    [`fontSize-ampm-${COMP}`]: "inherit",
  },
});

export const timeInputComponentRenderer = wrapComponent(COMP, TimeInputNative, TimeInputMd, {
  exposeRegisterApi: true,
  stateful: true,
  events: {},
  customRender(
    _props,
    { node, state, updateState, extractValue, classes, lookupEventHandler, registerComponentApi },
  ) {
    const extractedInitialValue = extractValue(node.props.initialValue);
    const stateValue = state?.value;

    return (
      <TimeInputNative
        classes={classes}
        initialValue={extractedInitialValue}
        value={stateValue}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
        enabled={extractValue.asOptionalBoolean(node.props.enabled, defaultProps.enabled)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus, defaultProps.autoFocus)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly, defaultProps.readOnly)}
        validationStatus={extractValue(node.props.validationStatus)}
        hour24={extractValue.asOptionalBoolean(node.props.hour24, defaultProps.hour24)}
        seconds={extractValue.asOptionalBoolean(node.props.seconds, defaultProps.seconds)}
        minTime={extractValue(node.props.minTime)}
        maxTime={extractValue(node.props.maxTime)}
        clearable={extractValue.asOptionalBoolean(node.props.clearable, defaultProps.clearable)}
        clearIcon={extractValue(node.props.clearIcon)}
        clearToInitialValue={extractValue.asOptionalBoolean(
          node.props.clearToInitialValue,
          defaultProps.clearToInitialValue,
        )}
        required={extractValue.asOptionalBoolean(node.props.required, defaultProps.required)}
        startText={extractValue(node.props.startText)}
        startIcon={extractValue(node.props.startIcon)}
        endText={extractValue(node.props.endText)}
        endIcon={extractValue(node.props.endIcon)}
        gap={extractValue.asOptionalString(node.props.gap)}
        emptyCharacter={extractValue.asOptionalString(
          node.props.emptyCharacter,
          defaultProps.emptyCharacter,
        )}
        ariaLabel={extractValue.asOptionalString(node.props["aria-label"])}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        onInvalidChange={lookupEventHandler("invalidTime")}
      />
    );
  },
});

const timeInputThemeAliases = {
  [`padding-button-${COMP}`]: "1.5px 6px",
  [`minHeight-${COMP}`]: "2.5rem",
  [`gap-adornment-${COMP}`]: "$space-2",
  [`borderRadius-${COMP}`]: "$borderRadius",
  [`borderColor-${COMP}`]: "$borderColor-Input-default",
  [`borderWidth-${COMP}`]: "1px",
  [`borderStyle-${COMP}`]: "solid",
  [`fontSize-${COMP}`]: "$fontSize-base",
  [`backgroundColor-${COMP}`]: "$backgroundColor",
  [`boxShadow-${COMP}`]: "none",
  [`textColor-${COMP}`]: "$textColor-primary",
  [`borderColor-${COMP}--hover`]: "$borderColor-Input-default--hover",
  [`backgroundColor-${COMP}--hover`]: `$backgroundColor-${COMP}`,
  [`boxShadow-${COMP}--hover`]: `$boxShadow-${COMP}`,
  [`textColor-${COMP}--hover`]: `$textColor-${COMP}`,
  [`borderColor-${COMP}--focus`]: "$borderColor-Input-default--focus",
  [`backgroundColor-${COMP}--focus`]: `$backgroundColor-${COMP}`,
  [`boxShadow-${COMP}--focus`]: `$boxShadow-${COMP}`,
  [`textColor-${COMP}--focus`]: `$textColor-${COMP}`,
  [`outlineWidth-${COMP}--focus`]: "0",
  [`outlineColor-${COMP}--focus`]: "$color-primary-500",
  [`outlineStyle-${COMP}--focus`]: "solid",
  [`outlineOffset-${COMP}--focus`]: "0",
  [`opacity-${COMP}--disabled`]: "1",
  [`backgroundColor-${COMP}--disabled`]: "$backgroundColor",
  [`textColor-${COMP}--disabled`]: "$textColor--disabled",
  [`borderColor-${COMP}--disabled`]: "$borderColor--disabled",
  [`borderColor-${COMP}--error`]: "hsl(356, 100%, 48%)",
  [`borderColor-${COMP}--warning`]: "hsl(35, 100%, 42.8%)",
  [`borderColor-${COMP}--success`]: "hsl(129.5, 58.4%, 58.1%)",
  [`borderRadius-${COMP}--error`]: `$borderRadius-${COMP}`,
  [`borderRadius-${COMP}--warning`]: `$borderRadius-${COMP}`,
  [`borderRadius-${COMP}--success`]: `$borderRadius-${COMP}`,
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

Object.assign(TimeInputMd.defaultThemeVars ??= {}, timeInputThemeAliases);

Object.assign(TimeInputMd, {
  defaultPart: "input",
} satisfies Partial<ComponentMetadata>);

export const timeInputRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: TimeInputMd as ComponentMetadata,
  defaultPart: "input",
  renderer: ({ adapter }) => <RuntimeTimeInput adapter={adapter} style={adapter.style} />,
});

type RuntimeTimeInputApi = Record<string, unknown>;
type RuntimeTimeInputProps = React.HTMLAttributes<HTMLDivElement> & {
  adapter: XmluiComponentAdapter;
};

const RuntimeTimeInput = React.forwardRef<HTMLDivElement, RuntimeTimeInputProps>(
function RuntimeTimeInput({ adapter, className, style, onFocus, onBlur, ...triggerProps }: RuntimeTimeInputProps, forwardedRef) {
  const form = useFormContext();
  const defaultId = React.useId();
  const { parentFormItemId } = React.useContext(FormItemContext);
  const bindTo = adapter.stringProp("bindTo");
  const required = adapter.booleanProp("required", defaultProps.required);
  const itemIndex =
    typeof readContext(adapter.scope, "$itemIndex") === "number"
      ? (readContext(adapter.scope, "$itemIndex") as number)
      : undefined;
  const fieldName = React.useMemo(
    () =>
      bindTo !== undefined || parentFormItemId
        ? resolveFormItemId({ bindTo, defaultId, parentFormItemId, itemIndex })
        : undefined,
    [bindTo, defaultId, itemIndex, parentFormItemId],
  );
  const formValue = fieldName ? form?.getValue(fieldName) : undefined;
  const initialValue = timeInputValue(adapter.prop("initialValue"));
  const controlledValue = timeInputValue(formValue) ?? timeInputValue(adapter.prop("value"));
  const [localValue, setLocalValue] = React.useState<string | null | undefined>(
    controlledValue ?? initialValue,
  );
  const apiRef = React.useRef<RuntimeTimeInputApi>({});
  const adapterRef = React.useRef(adapter);
  const formRef = React.useRef(form);
  adapterRef.current = adapter;
  formRef.current = form;

  React.useEffect(() => {
    if (!form || !fieldName) {
      return;
    }
    return form.registerItem({
      name: fieldName,
      required,
    });
  }, [fieldName, form, required]);

  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  const registerComponentApi = React.useCallback((api: RuntimeTimeInputApi) => {
    apiRef.current = api;
    adapterRef.current.registerApi({
      ...api,
      value: localValue,
    });
  }, [localValue]);

  React.useEffect(() => {
    adapterRef.current.registerApi({
      ...apiRef.current,
      value: localValue,
    });
  }, [localValue]);

  const updateState = React.useCallback((state: Record<string, unknown>, options?: { initial?: boolean }) => {
    const nextValue = timeInputValue(state.value);
    setLocalValue(nextValue);
    const currentForm = formRef.current;
    if (currentForm && fieldName && !options?.initial) {
      currentForm.setValue(fieldName, nextValue);
      void currentForm.validateField(fieldName, nextValue);
    }
    adapterRef.current.registerApi({
      ...apiRef.current,
      value: nextValue,
    });
  }, [fieldName]);

  const rootAttrs = adapter.rootAttrs("input") as React.HTMLAttributes<HTMLDivElement>;
  const {
    "data-part-id": _injectedPartId,
    "data-xmlui-component": _injectedComponent,
    "data-xmlui-part": _injectedPart,
    ...forwardedTriggerProps
  } = triggerProps as React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>;

  return (
    <TimeInputNative
      {...rootAttrs}
      {...forwardedTriggerProps}
      ref={forwardedRef}
      className={[rootAttrs.className, compatStyles.equalClearableVerticalSizing, className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootAttrs.style as React.CSSProperties | undefined),
        ...style,
      }}
      id={adapter.stringProp("id")}
      initialValue={initialValue as string | undefined}
      value={(controlledValue !== undefined ? controlledValue : localValue) as string | undefined}
      updateState={updateState}
      registerComponentApi={registerComponentApi}
      enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
      autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
      readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
      validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus) as React.ComponentProps<typeof TimeInputNative>["validationStatus"]}
      hour24={adapter.booleanProp("hour24", defaultProps.hour24)}
      seconds={adapter.booleanProp("seconds", defaultProps.seconds)}
      minTime={adapter.stringProp("minTime")}
      maxTime={adapter.stringProp("maxTime")}
      clearable={adapter.booleanProp("clearable", defaultProps.clearable)}
      clearIcon={adapter.stringProp("clearIcon")}
      clearToInitialValue={adapter.booleanProp("clearToInitialValue", defaultProps.clearToInitialValue)}
      required={required}
      startText={adapter.stringProp("startText")}
      startIcon={adapter.stringProp("startIcon")}
      endText={adapter.stringProp("endText")}
      endIcon={adapter.stringProp("endIcon")}
      gap={adapter.stringProp("gap")}
      emptyCharacter={adapter.stringProp("emptyCharacter", defaultProps.emptyCharacter)}
      ariaLabel={adapter.stringProp("aria-label")}
      classes={{ [COMPONENT_PART_KEY]: adapter.className }}
      onDidChange={(nextValue) => {
        setLocalValue(nextValue);
        void adapter.event("didChange")(nextValue);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        void adapter.event("gotFocus")(event);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        void adapter.event("lostFocus")(event);
      }}
      onInvalidChange={() => { void adapter.event("invalidTime")(); }}
    />
  );
}
);

function timeInputValue(value: unknown): string | null | undefined {
  return value === undefined
    ? undefined
    : value === null
      ? null
      : typeof value === "string"
        ? value
        : undefined;
}
