import type { ReactNode } from "react";

import { createMetadata, dAutoFocus, dDidChange, dEnabled, dGotFocus, dInitialValue, dLostFocus, dPlaceholder, dReadonly, dRequired } from "../../component-core/metadata/helpers";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { wrapComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { evaluateExpressionOrText } from "../../runtime/rendering/bindings";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./AutoComplete.defaults";
import { AutoCompleteNative, type AutoCompleteApi, type AutoCompleteOption } from "./AutoCompleteReact";

const COMP = "AutoComplete";

const autoCompleteStylesSource = `
$backgroundColor-AutoComplete: createThemeVar("backgroundColor-AutoComplete");
$backgroundColor-menu-AutoComplete: createThemeVar("backgroundColor-menu-AutoComplete");
$boxShadow-menu-AutoComplete: createThemeVar("boxShadow-menu-AutoComplete");
$borderRadius-menu-AutoComplete: createThemeVar("borderRadius-menu-AutoComplete");
$borderWidth-menu-AutoComplete: createThemeVar("borderWidth-menu-AutoComplete");
$borderColor-menu-AutoComplete: createThemeVar("borderColor-menu-AutoComplete");
$backgroundColor-item-AutoComplete: createThemeVar("backgroundColor-item-AutoComplete");
$backgroundColor-item-AutoComplete--hover: createThemeVar("backgroundColor-item-AutoComplete--hover");
$textColor-item-AutoComplete--disabled: createThemeVar("textColor-item-AutoComplete--disabled");
`;

export const AutoCompleteMd = createMetadata({
  status: "experimental",
  description:
    "`AutoComplete` is a searchable dropdown input that allows users to type and filter through options.",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    value: { description: "Controlled value.", valueType: "any" },
    maxLength: { description: "Maximum input length.", valueType: "number" },
    autoFocus: { ...dAutoFocus(), defaultValue: defaultProps.autoFocus },
    required: { ...dRequired(), defaultValue: defaultProps.required },
    readOnly: { ...dReadonly(), defaultValue: defaultProps.readOnly },
    enabled: { ...dEnabled(), defaultValue: defaultProps.enabled },
    initiallyOpen: {
      description: "Determines whether the dropdown list is open initially.",
      valueType: "boolean",
      defaultValue: defaultProps.initiallyOpen,
    },
    creatable: {
      description: "Allows users to create new options that are not present in the list.",
      valueType: "boolean",
      defaultValue: defaultProps.creatable,
    },
    validationStatus: {
      description: "Validation status.",
      valueType: "string",
      defaultValue: defaultProps.validationStatus,
    },
    dropdownHeight: {
      description: "Sets the height of the dropdown list.",
      valueType: "length",
    },
    multi: {
      description: "Allows multiple selections in the full AutoComplete implementation.",
      valueType: "boolean",
      defaultValue: defaultProps.multi,
    },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
    itemCreated: {
      description: "Triggered when a new item is created by the user.",
      signature: "(item: string) => void",
    },
  },
  apis: {
    focus: { description: "Focuses the AutoComplete input.", signature: "focus()" },
    value: { description: "Gets the current value.", signature: "get value(): any" },
    setValue: { description: "Sets the current value.", signature: "setValue(value: any)" },
  },
  contextVars: {
    $item: {
      description: "Represents an option item in option templates.",
    },
  },
  themeVars: extractScssThemeVars(autoCompleteStylesSource),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`backgroundColor-menu-${COMP}`]: "$color-surface-raised",
    [`boxShadow-menu-${COMP}`]: "$boxShadow-md",
    [`borderRadius-menu-${COMP}`]: "$borderRadius",
    [`borderWidth-menu-${COMP}`]: "1px",
    [`borderColor-menu-${COMP}`]: "$borderColor",
    [`backgroundColor-item-${COMP}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-item-${COMP}--hover`]: "$backgroundColor-dropdown-item--hover",
    [`textColor-item-${COMP}--disabled`]: "$color-surface-300",
  },
});

export const autoCompleteRenderer = wrapComponent({
  name: COMP,
  metadata: AutoCompleteMd,
  renderer: ({ adapter }) => {
    const apiRef = { current: null as AutoCompleteApi | null };
    return (
      <AutoCompleteNative
        {...adapter.rootAttrs()}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        initialValue={adapter.prop("initialValue")}
        value={adapter.prop("value")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        placeholder={adapter.stringProp("placeholder", defaultProps.placeholder)}
        autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
        readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
        required={adapter.booleanProp("required", defaultProps.required)}
        initiallyOpen={adapter.booleanProp("initiallyOpen", defaultProps.initiallyOpen)}
        creatable={adapter.booleanProp("creatable", defaultProps.creatable)}
        options={autoCompleteOptions(adapter)}
        onDidChange={(value) => void adapter.event("didChange")(value)}
        onFocus={() => void adapter.event("gotFocus")()}
        onBlur={() => void adapter.event("lostFocus")()}
        onItemCreated={(value) => void adapter.event("itemCreated")(value)}
      />
    );
  },
});

function autoCompleteOptions(adapter: XmluiComponentAdapter): AutoCompleteOption[] {
  return adapter.node.children.flatMap((child) => optionFromChild(child, adapter));
}

function optionFromChild(child: XmluiNode, adapter: XmluiComponentAdapter): AutoCompleteOption[] {
  if (child.kind !== "element" || child.type !== "Option") {
    return [];
  }
  const value = Object.prototype.hasOwnProperty.call(child.props, "value")
    ? evaluateExpressionOrText(child.props.value, child.parsed?.props?.value, adapter.scope, "AutoComplete:Option:value")
    : undefined;
  if (value === undefined) {
    return [];
  }
  const label = Object.prototype.hasOwnProperty.call(child.props, "label")
    ? evaluateExpressionOrText(child.props.label, child.parsed?.props?.label, adapter.scope, "AutoComplete:Option:label")
    : optionLabelFromChildren(child, adapter);
  const enabled = Object.prototype.hasOwnProperty.call(child.props, "enabled")
    ? booleanOptionValue(evaluateExpressionOrText(child.props.enabled, child.parsed?.props?.enabled, adapter.scope, "AutoComplete:Option:enabled"))
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
