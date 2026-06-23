import type { ReactNode } from "react";

import { createMetadata, dAutoFocus, dDidChange, dEnabled, dGotFocus, dInitialValue, dLostFocus, dReadonly, dRequired } from "../../component-core/metadata/helpers";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { wrapComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { evaluateExpressionOrText } from "../../runtime/rendering/bindings";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./RadioGroup.defaults";
import { RadioGroupNative, type RadioGroupApi, type RadioGroupOption } from "./RadioGroupReact";

const COMP = "RadioGroup";
const RGOption = "RadioGroupOption";

const radioGroupStylesSource = `
$gap-RadioGroupOption: createThemeVar("gap-RadioGroupOption");
$gap-RadioGroup: createThemeVar("gap-RadioGroup");
$borderWidth-RadioGroupOption: createThemeVar("borderWidth-RadioGroupOption");
$borderWidth-RadioGroupOption-validation: createThemeVar("borderWidth-RadioGroupOption-validation");
$backgroundColor-RadioGroup: createThemeVar("Input:backgroundColor-RadioGroup");
$backgroundColor-RadioGroupOption: createThemeVar("Input:backgroundColor-RadioGroupOption");
$backgroundColor-checked-RadioGroupOption: createThemeVar("Input:backgroundColor-checked-RadioGroupOption");
$backgroundColor-checked-RadioGroupOption--disabled: createThemeVar("Input:backgroundColor-checked-RadioGroupOption--disabled");
$textColor-RadioGroupOption--disabled: createThemeVar("Input:textColor-RadioGroupOption--disabled");
$fontSize-RadioGroupOption: createThemeVar("Input:fontSize-RadioGroupOption");
$fontWeight-RadioGroupOption: createThemeVar("Input:fontWeight-RadioGroupOption");
$textColor-RadioGroupOption: createThemeVar("Input:textColor-RadioGroupOption");
$textColor-RadioGroupOption--error: createThemeVar("Input:textColor-RadioGroupOption--error");
$textColor-RadioGroupOption--warning: createThemeVar("Input:textColor-RadioGroupOption--warning");
$textColor-RadioGroupOption--success: createThemeVar("Input:textColor-RadioGroupOption--success");
`;

export const RadioGroupMd = createMetadata({
  status: "experimental",
  description:
    "`RadioGroup` creates a mutually exclusive selection interface where users choose one option from a group.",
  parts: {
    label: { description: "The label displayed for the radio group." },
  },
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    initialValue: { ...dInitialValue(defaultProps.initialValue, "string"), defaultValue: defaultProps.initialValue },
    value: { description: "Controlled value.", valueType: "any" },
    label: { description: "Radio group label.", valueType: "string" },
    autoFocus: dAutoFocus(),
    required: { ...dRequired(), defaultValue: defaultProps.required },
    readOnly: dReadonly(),
    enabled: { ...dEnabled(), defaultValue: defaultProps.enabled },
    validationStatus: { description: "Validation status.", valueType: "string", defaultValue: defaultProps.validationStatus },
    orientation: {
      description: "Sets the layout direction of radio options.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultProps.orientation,
    },
    gap: {
      description: "Sets the gap between radio options.",
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
      description: "Returns the current value.",
      signature: "get value(): string | undefined",
    },
    setValue: {
      description: "Sets the current value.",
      signature: "setValue(value: string): void",
    },
  },
  themeVars: extractScssThemeVars(radioGroupStylesSource),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$gap-normal",
    [`gap-${RGOption}`]: "0.25em",
    [`borderWidth-${RGOption}`]: "1px",
    [`borderWidth-${RGOption}-validation`]: "2px",
    [`backgroundColor-${COMP}`]: "transparent",
    [`backgroundColor-${RGOption}`]: "$color-surface-0",
    [`backgroundColor-checked-${RGOption}`]: "$color-primary-500",
    [`backgroundColor-checked-${RGOption}--disabled`]: "$textColor--disabled",
    [`fontSize-${RGOption}`]: "$fontSize-sm",
    [`fontWeight-${RGOption}`]: "$fontWeight-bold",
    [`textColor-${RGOption}`]: "$textColor-primary",
    [`textColor-${RGOption}--disabled`]: "$textColor--disabled",
    [`textColor-${RGOption}--error`]: "$textColor-danger",
    [`textColor-${RGOption}--warning`]: "$textColor-warning",
    [`textColor-${RGOption}--success`]: "$textColor-success",
  },
});

export const radioGroupRenderer = wrapComponent({
  name: COMP,
  metadata: RadioGroupMd,
  renderer: ({ adapter }) => {
    const apiRef = { current: null as RadioGroupApi | null };
    return (
      <RadioGroupNative
        {...adapter.rootAttrs()}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        value={adapter.prop("value")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
        required={adapter.booleanProp("required", defaultProps.required)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        orientation={adapter.stringProp("orientation", defaultProps.orientation)}
        gap={adapter.stringProp("gap")}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        label={adapter.stringProp("label")}
        options={radioOptions(adapter)}
        extraChildren={adapter.renderChildren(nonOptionChildren(adapter.node.children))}
        onDidChange={(value) => void adapter.event("didChange")(value)}
        onFocus={() => void adapter.event("gotFocus")()}
        onBlur={() => void adapter.event("lostFocus")()}
      />
    );
  },
});

function radioOptions(adapter: XmluiComponentAdapter): RadioGroupOption[] {
  return adapter.node.children.flatMap((child) => optionFromChild(child, adapter));
}

function optionFromChild(child: XmluiNode, adapter: XmluiComponentAdapter): RadioGroupOption[] {
  if (child.kind !== "element" || child.type !== "Option") {
    return [];
  }
  const value = Object.prototype.hasOwnProperty.call(child.props, "value")
    ? evaluateExpressionOrText(child.props.value, child.parsed?.props?.value, adapter.scope, "RadioGroup:Option:value")
    : undefined;
  if (value === undefined) {
    return [];
  }
  const label = Object.prototype.hasOwnProperty.call(child.props, "label")
    ? evaluateExpressionOrText(child.props.label, child.parsed?.props?.label, adapter.scope, "RadioGroup:Option:label")
    : optionLabelFromChildren(child, adapter);
  const enabled = Object.prototype.hasOwnProperty.call(child.props, "enabled")
    ? booleanOptionValue(evaluateExpressionOrText(child.props.enabled, child.parsed?.props?.enabled, adapter.scope, "RadioGroup:Option:enabled"))
    : true;
  return [{ value, label: renderableLabel(label, value), enabled }];
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

function nonOptionChildren(children: XmluiNode[]): XmluiNode[] {
  return children.filter((child) => !(child.kind === "element" && child.type === "Option"));
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
