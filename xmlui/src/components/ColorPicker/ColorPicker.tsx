import { defaultProps } from "./ColorPicker.defaults";
import { ColorPicker } from "./ColorPickerReact";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import styles from "./ColorPicker.module.scss";
import { wrapComponent } from "../../components-core/wrapComponent";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { useFormContext } from "../Form/FormContext";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const COMP = "ColorPicker";

export const ColorPickerMd = createMetadata({
  status: "stable",
  description:
    "`ColorPicker` enables users to choose colors by specifying RGB, HSL, or HEX values.",
  props: {
    initialValue: dInitialValue(defaultProps.initialValue, "color"),
    enabled: dEnabled(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: {
      description: `Focus the ${COMP} component.`,
      signature: "focus(): void",
    },
    value: {
      description: `This method returns the current value of the ${COMP}.`,
      signature: "get value(): string",
    },
    setValue: {
      description: `This method sets the current value of the ${COMP}.`,
      signature: "set value(value: string): void",
      parameters: {
        value: "The new value to set for the color picker.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  parts: {
    input: { description: "The color picker input element." },
  },
  defaultThemeVars: {
    [`width-${COMP}`]: "3em",
    [`height-${COMP}`]: "1.5em",
  },
});

type ThemedColorPickerProps = React.ComponentPropsWithoutRef<typeof ColorPicker>;

export const ThemedColorPicker = React.forwardRef<React.ElementRef<typeof ColorPicker>, ThemedColorPickerProps>(
  function ThemedColorPicker({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(ColorPickerMd);
    return (
      <ColorPicker
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const colorPickerComponentRenderer = wrapComponent(
  "ColorPicker",
  ThemedColorPicker,
  ColorPickerMd,
  {
    exposeRegisterApi: true,
    events: {
      gotFocus: "onFocus",
      lostFocus: "onBlur",
      didChange: "onDidChange",
    },
  },
);

type RuntimeColorPickerProps = React.ComponentProps<typeof ColorPicker> & {
  adapter: XmluiComponentAdapter;
  bindTo?: string;
};

function RuntimeColorPickerShell({
  adapter,
  bindTo,
  value,
  initialValue,
  required,
  validationStatus,
  onDidChange,
  ...props
}: RuntimeColorPickerProps) {
  const form = useFormContext();
  const formRef = React.useRef(form);
  const adapterRef = React.useRef(adapter);
  const registerFormItem = form?.registerItem;
  const fieldName = bindTo;
  const formValue = fieldName ? form?.getValue(fieldName) : undefined;
  const controlledValue = stringValue(formValue) ?? stringValue(value);
  const initial = stringValue(initialValue) ?? defaultProps.initialValue;
  const [localValue, setLocalValue] = React.useState(controlledValue ?? initial);
  const apiRef = React.useRef<Record<string, unknown>>({});
  const lastRegisteredValueRef = React.useRef<unknown>(undefined);
  formRef.current = form;
  adapterRef.current = adapter;

  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  React.useEffect(() => {
    if (!registerFormItem || !fieldName) {
      return;
    }
    return registerFormItem({
      name: fieldName,
      required,
    });
  }, [fieldName, registerFormItem, required]);

  const registerApi = React.useCallback((api: Record<string, unknown>) => {
    apiRef.current = api;
    lastRegisteredValueRef.current = localValue;
    adapterRef.current.registerApi({
      ...api,
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
    if (typeof state.value !== "string") {
      return;
    }
    setLocalValue(state.value);
    const currentForm = formRef.current;
    if (currentForm && fieldName && !options?.initial) {
      currentForm.setValue(fieldName, state.value);
      void currentForm.validateField(fieldName, state.value);
    }
  }, [fieldName]);

  const formError = fieldName ? form?.errors[fieldName] : undefined;
  const effectiveValidationStatus = formError
    ? "error"
    : required && localValue
      ? "valid"
      : validationStatus;

  return (
    <ColorPicker
      {...props}
      value={controlledValue ?? localValue}
      initialValue={initial}
      updateState={updateState}
      registerComponentApi={registerApi}
      required={required}
      validationStatus={effectiveValidationStatus}
      invalidMessages={formError ? formError.split("\n") : undefined}
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
}

function runtimeColorPickerProps(adapter: XmluiComponentAdapter) {
  const rootAttrs = adapter.rootAttrs("input") as React.HTMLAttributes<HTMLInputElement>;
  const { onFocus, onBlur, onChange, ...safeRootAttrs } = rootAttrs;
  const style = normalizeColorPickerStyle(rootAttrs.style);
  return {
    ...safeRootAttrs,
    id: adapter.stringProp("id"),
    bindTo: adapter.stringProp("bindTo"),
    value: adapter.prop("value") as string | undefined,
    initialValue: adapter.prop("initialValue", defaultProps.initialValue) as string,
    enabled: adapter.booleanProp("enabled", defaultProps.enabled),
    readOnly: adapter.booleanProp("readOnly", false),
    required: adapter.booleanProp("required", false),
    autoFocus: adapter.booleanProp("autoFocus", false),
    tabIndex: adapter.prop("tabIndex", 0) as number,
    validationStatus: adapter.stringProp(
      "validationStatus",
      defaultProps.validationStatus,
    ) as React.ComponentProps<typeof ColorPicker>["validationStatus"],
    classes: { [COMPONENT_PART_KEY]: adapter.className },
    style,
    className: rootAttrs.className as string | undefined,
  };
}

function normalizeColorPickerStyle(style: React.CSSProperties | undefined): React.CSSProperties | undefined {
  const width = style?.width;
  if (typeof width !== "string" || !width.trim().endsWith("%")) {
    return style;
  }
  return {
    ...style,
    width: `${width.trim().slice(0, -1)}vw`,
  };
}

function stringValue(value: unknown): string | undefined {
  return value === undefined || value === null ? undefined : String(value);
}

const colorPickerInputThemeAliases = {
  [`backgroundColor-${COMP}`]: "transparent",
  [`borderRadius-${COMP}`]: "$borderRadius",
  [`borderColor-${COMP}`]: "$borderColor-Input-default",
  [`borderWidth-${COMP}`]: "1px",
  [`borderStyle-${COMP}`]: "solid",
  [`boxShadow-${COMP}`]: "none",
  [`borderColor-${COMP}--hover`]: "$borderColor-Input-default--hover",
  [`boxShadow-${COMP}--hover`]: `$boxShadow-${COMP}`,
  [`borderColor-${COMP}--focus`]: "$borderColor-Input-default--hover",
  [`boxShadow-${COMP}--focus`]: `$boxShadow-${COMP}`,
  [`borderRadius-${COMP}--error`]: `$borderRadius-${COMP}`,
  [`borderColor-${COMP}--error`]: "$borderColor-Input-default--error",
  [`borderWidth-${COMP}--error`]: `$borderWidth-${COMP}`,
  [`borderStyle-${COMP}--error`]: `$borderStyle-${COMP}`,
  [`boxShadow-${COMP}--error`]: `$boxShadow-${COMP}`,
  [`borderColor-${COMP}--error--hover`]: `$borderColor-${COMP}--error`,
  [`boxShadow-${COMP}--error--hover`]: `$boxShadow-${COMP}--error`,
  [`borderColor-${COMP}--error--focus`]: `$borderColor-${COMP}--error`,
  [`boxShadow-${COMP}--error--focus`]: `$boxShadow-${COMP}--error`,
  [`borderRadius-${COMP}--warning`]: `$borderRadius-${COMP}`,
  [`borderColor-${COMP}--warning`]: "$borderColor-Input-default--warning",
  [`borderWidth-${COMP}--warning`]: `$borderWidth-${COMP}`,
  [`borderStyle-${COMP}--warning`]: `$borderStyle-${COMP}`,
  [`boxShadow-${COMP}--warning`]: `$boxShadow-${COMP}`,
  [`borderColor-${COMP}--warning--hover`]: `$borderColor-${COMP}--warning`,
  [`boxShadow-${COMP}--warning--hover`]: `$boxShadow-${COMP}--warning`,
  [`borderColor-${COMP}--warning--focus`]: `$borderColor-${COMP}--warning`,
  [`boxShadow-${COMP}--warning--focus`]: `$boxShadow-${COMP}--warning`,
  [`borderRadius-${COMP}--success`]: `$borderRadius-${COMP}`,
  [`borderColor-${COMP}--success`]: "$borderColor-Input-default--success",
  [`borderWidth-${COMP}--success`]: `$borderWidth-${COMP}`,
  [`borderStyle-${COMP}--success`]: `$borderStyle-${COMP}`,
  [`boxShadow-${COMP}--success`]: `$boxShadow-${COMP}`,
  [`borderColor-${COMP}--success--hover`]: `$borderColor-${COMP}--success`,
  [`boxShadow-${COMP}--success--hover`]: `$boxShadow-${COMP}--success`,
  [`borderColor-${COMP}--success--focus`]: `$borderColor-${COMP}--success`,
  [`boxShadow-${COMP}--success--focus`]: `$boxShadow-${COMP}--success`,
};

Object.assign(ColorPickerMd.defaultThemeVars ??= {}, colorPickerInputThemeAliases);

export const colorPickerRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: ColorPickerMd as ComponentMetadata,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <RuntimeColorPickerShell adapter={adapter} {...runtimeColorPickerProps(adapter)} />
  ),
});
