import React from "react";
import type { ReactNode } from "react";
import styles from "./RadioGroup.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dInternal,
  dLostFocus,
  dOrientation,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import { defaultProps } from "./RadioGroup.defaults";
import { RadioGroup } from "./RadioGroupReact";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { evaluateExpressionOrText } from "../../runtime/rendering/bindings";

const COMP = "RadioGroup";
const RGOption = `RadioGroupOption`;

export const RadioGroupMd = createMetadata({
  status: "stable",
  description:
    "`RadioGroup` creates a mutually exclusive selection interface where users can " +
    "choose only one option from a group of radio buttons. It manages the selection " +
    "state and ensures that selecting one option automatically deselects all others in " +
    "the group." +
    "Radio options store their values as strings. Numbers and booleans are converted to strings " +
    "when assigned, while objects, functions and arrays default to an empty string unless resolved " +
    "via binding expressions.",
  parts: {
    label: {
      description: "The label displayed for the radio group.",
    }
  },
  contextVars: {
    $checked: dInternal("Current checked state, injected into the option template."),
    $setChecked: dInternal("Setter for the checked state, injected into the option template."),
  },
  props: {
    initialValue: {
      ...dInitialValue(),
      valueType: "string",
      defaultValue: defaultProps.initialValue,
    },
    autoFocus: dAutoFocus(),
    required: {
      ...dRequired(),
      defaultValue: defaultProps.required,
    },
    readOnly: dReadonly(),
    enabled: {
      ...dEnabled(),
      defaultValue: defaultProps.enabled,
    },
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: defaultProps.validationStatus,
    },
    orientation: {
      ...dOrientation(defaultProps.orientation),
      description:
        "This property sets the layout direction of the radio options within the group. " +
        "Use `horizontal` to arrange them in a row, or `vertical` (default) to stack them.",
    },
    gap: {
      description:
        "This property sets the gap between the radio options in the group. " +
        "Accepts any valid CSS size value or a theme token (e.g. `$gap-normal`).",
      valueType: "string",
      defaultValue: defaultProps.gap,
    },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    value: {
      description: `This API retrieves the current value of the \`${COMP}\`. You can use it to get the value programmatically.`,
      signature: "get value(): string | undefined",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: string): void",
      parameters: {
        value: "The new value to set.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`gap-RadioGroup`]: "$gap-normal",
    [`gap-${RGOption}`]: "0.25em",
    [`borderWidth-${RGOption}`]: "1px",
    [`borderWidth-${RGOption}-validation`]: `2px`,

    [`borderColor-${RGOption}--default`]: "$color-surface-500",
    [`borderColor-checked-${RGOption}`]: "$color-primary-500",
    [`borderColor-${RGOption}--default--hover`]: "$color-surface-700",
    [`borderColor-${RGOption}--default--active`]: "$color-primary-500",
    [`borderColor-${RGOption}--error`]: `$borderColor-Input--error`,
    [`borderColor-${RGOption}--warning`]: `$borderColor-Input--warning`,
    [`borderColor-${RGOption}--success`]: `$borderColor-Input--success`,

    [`backgroundColor-${RGOption}--disabled`]: "$backgroundColor--disabled",
    [`backgroundColor-checked-${RGOption}`]: "$color-primary-500",
    [`backgroundColor-checked-${RGOption}--disabled`]: `$textColor--disabled`,

    [`fontSize-${RGOption}`]: "$fontSize-sm",
    [`fontWeight-${RGOption}`]: "$fontWeight-bold",
    [`textColor-${RGOption}--disabled`]: "$textColor--disabled",
  },
});

type ThemedRadioGroupProps = React.ComponentPropsWithoutRef<typeof RadioGroup>;

export const ThemedRadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroup>, ThemedRadioGroupProps>(
  function ThemedRadioGroup({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(RadioGroupMd);
    return (
      <RadioGroup
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const radioGroupRenderer = wrapComponent(COMP, ThemedRadioGroup, RadioGroupMd, {
  customRender: (_props, { node, extractValue, classes, state, updateState, lookupEventHandler, renderChild, registerComponentApi }) => (
    <ThemedRadioGroup
      autofocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
      enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      orientation={extractValue(node.props.orientation)}
      gap={extractValue.asSize(node.props.gap)}
      classes={classes}
      initialValue={extractValue(node.props.initialValue)}
      value={state?.value}
      updateState={updateState}
      validationStatus={extractValue(node.props.validationStatus)}
      onDidChange={lookupEventHandler("didChange")}
      onFocus={lookupEventHandler("gotFocus")}
      onBlur={lookupEventHandler("lostFocus")}
      registerComponentApi={registerComponentApi}
      required={extractValue.asOptionalBoolean(node.props.required)}
      readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
    >
      {renderChild(node.children)}
    </ThemedRadioGroup>
  ),
});

type RuntimeRadioGroupProps = React.ComponentProps<typeof ThemedRadioGroup> & {
  adapter: XmluiComponentAdapter;
};

function RuntimeRadioGroupShell({
  adapter,
  value,
  initialValue,
  onDidChange,
  onFocus,
  onBlur,
  ...props
}: RuntimeRadioGroupProps) {
  const controlledValue = stringValue(value);
  const initial = stringValue(initialValue);
  const [localValue, setLocalValue] = React.useState<string | undefined>(controlledValue ?? initial);

  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  const updateState = React.useCallback((state: Record<string, unknown>) => {
    const nextValue = stringValue(state.value);
    setLocalValue(nextValue);
    adapter.registerApi({ value: nextValue });
  }, [adapter]);

  return (
    <ThemedRadioGroup
      {...props}
      value={controlledValue ?? localValue}
      initialValue={initial}
      updateState={updateState}
      registerComponentApi={adapter.registerApi}
      onDidChange={(nextValue) => {
        setLocalValue(nextValue);
        onDidChange?.(nextValue);
        void adapter.event("didChange")(nextValue);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        void adapter.event("gotFocus")();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        void adapter.event("lostFocus")();
      }}
    />
  );
}

function runtimeRadioGroupProps(adapter: XmluiComponentAdapter) {
  const rootAttrs = adapter.rootAttrs() as React.HTMLAttributes<HTMLDivElement>;
  return {
    ...rootAttrs,
    id: adapter.stringProp("id"),
    value: adapter.prop("value"),
    initialValue: adapter.prop("initialValue", defaultProps.initialValue),
    autofocus: adapter.booleanProp("autoFocus", false),
    enabled: adapter.booleanProp("enabled", defaultProps.enabled),
    orientation: adapter.stringProp("orientation", defaultProps.orientation) as React.ComponentProps<typeof ThemedRadioGroup>["orientation"],
    gap: adapter.stringProp("gap"),
    validationStatus: adapter.stringProp("validationStatus", defaultProps.validationStatus) as React.ComponentProps<typeof ThemedRadioGroup>["validationStatus"],
    required: adapter.booleanProp("required", defaultProps.required),
    readOnly: adapter.booleanProp("readOnly", defaultProps.readOnly),
    classes: { [COMPONENT_PART_KEY]: adapter.className },
    children: adapter.renderChildren(),
  };
}

function stringValue(value: unknown): string | undefined {
  return value === undefined || value === null ? undefined : String(value);
}

const radioGroupThemeAliases = {
  [`borderColor-${RGOption}`]: "$borderColor-Input-default",
  [`borderColor-${RGOption}--hover`]: "$borderColor-Input-default--hover",
  [`borderColor-${RGOption}--active`]: "$color-primary-500",
  [`borderColor-${RGOption}--disabled`]: "$borderColor--disabled",
  [`borderColor-${RGOption}--error`]: "hsl(356, 100%, 48%)",
  [`borderColor-${RGOption}--warning`]: "hsl(35, 100%, 42.8%)",
  [`borderColor-${RGOption}--success`]: "hsl(129.5, 58.4%, 58.1%)",
};

Object.assign(RadioGroupMd.defaultThemeVars ??= {}, radioGroupThemeAliases);

Object.assign(RadioGroupMd, {
  defaultPart: "root",
} satisfies Partial<ComponentMetadata>);

export const radioGroupRuntimeRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: RadioGroupMd,
  renderer: ({ adapter }) => (
    <RuntimeRadioGroupShell adapter={adapter} {...runtimeRadioGroupProps(adapter)} />
  ),
});

export function radioOptions(adapter: XmluiComponentAdapter) {
  return adapter.node.children.flatMap((child) => optionFromChild(child, adapter));
}

function optionFromChild(child: XmluiNode, adapter: XmluiComponentAdapter): Array<{
  value: unknown;
  label: ReactNode;
  enabled: boolean;
  testId?: string;
}> {
  if (child.kind !== "element") {
    return [];
  }
  if (child.type !== "Option") {
    return child.children.flatMap((nestedChild) => optionFromChild(nestedChild, adapter));
  }
  const rawValue = Object.prototype.hasOwnProperty.call(child.props, "value")
    ? evaluateExpressionOrText(child.props.value, child.parsed?.props?.value, adapter.scope, "RadioGroup:Option:value")
    : undefined;
  if (rawValue === undefined) {
    return [];
  }
  const value = rawValue;
  const label = Object.prototype.hasOwnProperty.call(child.props, "label")
    ? evaluateExpressionOrText(child.props.label, child.parsed?.props?.label, adapter.scope, "RadioGroup:Option:label")
    : optionLabelFromChildren(child, adapter);
  const enabled = Object.prototype.hasOwnProperty.call(child.props, "enabled")
    ? booleanOptionValue(evaluateExpressionOrText(child.props.enabled, child.parsed?.props?.enabled, adapter.scope, "RadioGroup:Option:enabled"))
    : true;
  return [{ value, label: renderableLabel(label, value), enabled, testId: child.props.testId }];
}

function optionLabelFromChildren(child: XmluiElement, adapter: XmluiComponentAdapter) {
  if (child.children.length === 0) {
    return String(child.props.value ?? "");
  }
  const allText = child.children.every((optionChild) => optionChild.kind === "text");
  if (allText) {
    return child.children.map((optionChild) => optionChild.kind === "text" ? optionChild.value : "").join("");
  }
  return adapter.renderChildren(child.children);
}

function booleanOptionValue(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value !== "false";
  }
  return Boolean(value);
}

function renderableLabel(label: unknown, value: unknown): ReactNode {
  if (label === undefined || label === null) {
    return String(value ?? "");
  }
  if (typeof label === "string" || typeof label === "number" || typeof label === "boolean") {
    return String(label);
  }
  return label as ReactNode;
}
