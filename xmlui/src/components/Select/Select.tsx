import { createMetadata, dAutoFocus, dDidChange, dEnabled, dGotFocus, dInitialValue, dLostFocus, dPlaceholder, dReadonly, dRequired } from "../../component-core/metadata/helpers";
import type { ReactNode } from "react";
import type { XmluiElement } from "../../compiler/ir";
import { evaluateExpressionOrText } from "../../runtime/rendering/bindings";
import { nonPropertyChildren, templateChildren, wrapComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { createRuntimeScope, type RuntimeScope } from "../../runtime/state";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Select.defaults";
import { SelectNative, type SelectApi } from "./SelectReact";
import type { XmluiOption } from "../Option/OptionReact";

const COMP = "Select";

const selectStylesSource = `
$backgroundColor-Select: createThemeVar("backgroundColor-Select");
$textColor-Select: createThemeVar("textColor-Select");
$borderColor-Select: createThemeVar("borderColor-Select");
$borderWidth-Select: createThemeVar("borderWidth-Select");
$borderStyle-Select: createThemeVar("borderStyle-Select");
$borderRadius-Select: createThemeVar("borderRadius-Select");
$fontSize-Select: createThemeVar("fontSize-Select");
$boxShadow-Select: createThemeVar("boxShadow-Select");
`;

export const SelectMd = createMetadata({
  status: "experimental",
  description:
    "`Select` provides a dropdown interface for choosing from a list of options. " +
    "This rewrite slice currently preserves the native foundation while the old Radix-based dropdown behavior is migrated.",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    placeholder: { ...dPlaceholder(), defaultValue: defaultProps.placeholder },
    label: { description: "The Select label.", valueType: "string" },
    labelPosition: { description: "The label position.", valueType: "string" },
    labelBreak: { description: "Allows line breaks in the label.", valueType: "boolean", defaultValue: defaultProps.labelBreak },
    labelWidth: { description: "Sets the label width.", valueType: "length" },
    bindTo: { description: "Form field name to bind this Select to.", valueType: "string" },
    initialValue: { ...dInitialValue(), valueType: "any" },
    value: { description: "The controlled value.", valueType: "any" },
    autoFocus: { ...dAutoFocus(), defaultValue: defaultProps.autoFocus },
    required: { ...dRequired(), defaultValue: defaultProps.required },
    readOnly: { ...dReadonly(), defaultValue: defaultProps.readOnly },
    enabled: { ...dEnabled(), defaultValue: defaultProps.enabled },
    data: { description: "Data array used to populate options.", valueType: "any" },
    valueField: { description: "Field used as option value for `data`.", valueType: "string", defaultValue: "value" },
    labelField: { description: "Field used as option label for `data`.", valueType: "string", defaultValue: "label" },
    multiSelect: { description: "Allows multiple selected options.", valueType: "boolean", defaultValue: defaultProps.multiSelect },
    modal: { description: "Legacy overlay modal compatibility flag.", valueType: "boolean" },
    clearable: { description: "Enables a clear affordance in the full Select implementation.", valueType: "boolean", defaultValue: defaultProps.clearable },
    searchable: { description: "Enables searchable dropdown behavior in the full Select implementation.", valueType: "boolean", defaultValue: defaultProps.searchable },
    inProgress: { description: "Shows the in-progress message in searchable mode.", valueType: "boolean", defaultValue: defaultProps.inProgress },
    inProgressNotificationMessage: { description: "Message displayed while searchable options are loading.", valueType: "string", defaultValue: defaultProps.inProgressNotificationMessage },
    dropdownHeight: { description: "Sets the maximum height of the dropdown list.", valueType: "length" },
    groupBy: { description: "Option field used to group dropdown options.", valueType: "string" },
    scrollIndicators: { description: "Controls dropdown scroll indicator rendering.", valueType: "boolean", defaultValue: true },
    emptyListTemplate: {
      description: "Template rendered when the dropdown contains no options.",
      valueType: "ComponentDef",
    },
    valueTemplate: {
      description: "Template rendered for the selected value.",
      valueType: "ComponentDef",
    },
    groupHeaderTemplate: {
      description: "Template rendered for grouped option headers.",
      valueType: "ComponentDef",
    },
    ungroupedHeaderTemplate: {
      description: "Template rendered before ungrouped options.",
      valueType: "ComponentDef",
    },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: "Focuses the Select component.",
      signature: "focus(): void",
    },
    setValue: {
      description: "Sets the current value.",
      signature: "setValue(value: string | string[] | undefined): void",
    },
    value: {
      description: "Returns the current value.",
      signature: "get value(): string | string[] | undefined",
    },
    reset: {
      description: "Resets the component to its initial value.",
      signature: "reset(): void",
    },
  },
  themeVars: extractScssThemeVars(selectStylesSource),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-0",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`borderColor-${COMP}`]: "$borderColor-Input-default",
    [`borderWidth-${COMP}`]: "1px",
    [`borderStyle-${COMP}`]: "solid",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`fontSize-${COMP}`]: "$fontSize",
    [`boxShadow-${COMP}`]: "none",
  },
});

export const selectRenderer = wrapComponent({
  name: COMP,
  metadata: SelectMd,
  renderer: ({ adapter }) => {
    const apiRef = { current: null as SelectApi | null };
    return (
      <SelectNative
        {...adapter.rootAttrs()}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        className={adapter.className}
        style={adapter.style}
        bindTo={adapter.stringProp("bindTo")}
        label={adapter.stringProp("label")}
        labelPosition={adapter.stringProp("labelPosition")}
        labelBreak={adapter.booleanProp("labelBreak", defaultProps.labelBreak)}
        labelWidth={adapter.prop("labelWidth")}
        validationStatus={adapter.stringProp("validationStatus")}
        requireLabelMode={adapter.stringProp("requireLabelMode")}
        verboseValidationFeedback={adapter.booleanProp(
          "verboseValidationFeedback",
          adapter.prop("verboseValidationFeedback") as boolean | undefined,
        )}
        validationMode={adapter.stringProp("validationMode")}
        initialValue={adapter.prop("initialValue")}
        value={adapter.prop("value")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        placeholder={adapter.stringProp("placeholder", defaultProps.placeholder)}
        autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
        readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
        required={adapter.booleanProp("required", defaultProps.required)}
        multiSelect={adapter.booleanProp("multiSelect", defaultProps.multiSelect)}
        clearable={adapter.booleanProp("clearable", defaultProps.clearable)}
        searchable={adapter.booleanProp("searchable", defaultProps.searchable)}
        inProgress={adapter.booleanProp("inProgress", defaultProps.inProgress)}
        inProgressNotificationMessage={adapter.stringProp("inProgressNotificationMessage", defaultProps.inProgressNotificationMessage)}
        dropdownHeight={adapter.prop("dropdownHeight")}
        groupBy={adapter.stringProp("groupBy")}
        scrollIndicators={adapter.booleanProp("scrollIndicators", true)}
        options={selectOptions(adapter)}
        popupChildren={selectPopupChildren(adapter)}
        valueTemplateRenderer={templateChildren(adapter.node, "valueTemplate")
          ? createScopedTemplateRenderer(adapter, "valueTemplate")
          : undefined}
        groupHeaderTemplateRenderer={templateChildren(adapter.node, "groupHeaderTemplate")
          ? createScopedTemplateRenderer(adapter, "groupHeaderTemplate")
          : undefined}
        ungroupedHeaderTemplateRenderer={templateChildren(adapter.node, "ungroupedHeaderTemplate")
          ? createScopedTemplateRenderer(adapter, "ungroupedHeaderTemplate")
          : undefined}
        emptyListTemplate={templateChildren(adapter.node, "emptyListTemplate")
          ? adapter.renderTemplate("emptyListTemplate")
          : undefined}
        onDidChange={(value) => {
          void adapter.event("didChange")(value);
        }}
        onFocus={() => {
          void adapter.event("gotFocus")();
        }}
        onBlur={() => {
          void adapter.event("lostFocus")();
        }}
      />
    );
  },
});

export function selectOptions(adapter: XmluiComponentAdapter): XmluiOption[] {
  const data = adapter.prop<unknown>("data");
  if (Array.isArray(data)) {
    const valueField = adapter.stringProp("valueField", "value") ?? "value";
    const labelField = adapter.stringProp("labelField", "label") ?? "label";
    return data.map((item) => dataOption(item, valueField, labelField));
  }
  return adapter.node.children.flatMap((child) => optionsFromChild(child, adapter));
}

function selectPopupChildren(adapter: XmluiComponentAdapter): ReactNode {
  const children = nonPropertyChildren(adapter.node.children).filter(
    (child) => !(child.kind === "element" && (child.type === "Option" || child.type === "Items")),
  );
  return children.length > 0 ? adapter.renderChildren(children) : undefined;
}

function dataOption(item: unknown, valueField: string, labelField: string): XmluiOption {
  if (item !== null && typeof item === "object") {
    const record = item as Record<string, unknown>;
    const value = record[valueField];
    const label = record[labelField] ?? value;
    return { ...record, value, label: String(label ?? ""), enabled: true };
  }
  return { value: item, label: String(item ?? ""), enabled: true };
}

function optionsFromChild(
  child: XmluiElement["children"][number],
  adapter: XmluiComponentAdapter,
  scope: RuntimeScope = adapter.scope,
): XmluiOption[] {
  if (child.kind === "element" && child.type === "Items") {
    const items = evaluateExpressionOrText(
      child.props.items ?? child.props.data,
      child.parsed?.props?.items ?? child.parsed?.props?.data,
      scope,
      "Select:Items:data",
    );
    if (!Array.isArray(items)) {
      return [];
    }
    return items.flatMap((item, index) => {
      const itemScope = createRuntimeScope({
        store: scope.store,
        parent: scope,
        props: scope.props,
        contextValues: {
          $item: item,
          $itemIndex: index,
          $isFirst: index === 0,
          $isLast: index === items.length - 1,
        },
        references: scope.references,
        slots: scope.slots,
        emitEvent: scope.emitEvent,
      });
      return child.children.flatMap((itemChild) => optionsFromChild(itemChild, adapter, itemScope));
    });
  }
  if (child.kind !== "element" || child.type !== "Option") {
    return [];
  }
  const hasValue = Object.prototype.hasOwnProperty.call(child.props, "value");
  const hasLabel = Object.prototype.hasOwnProperty.call(child.props, "label");
  const hasChildren = child.children.length > 0;
  if (!hasValue && !hasLabel && !hasChildren) {
    return [];
  }
  let value = hasValue
    ? evaluateExpressionOrText(child.props.value, child.parsed?.props?.value, scope, "Option:value")
    : undefined;
  if (
    hasValue &&
    (child.props.value === "{null}" || parsedExpressionSource(child.parsed?.props?.value) === "null")
  ) {
    value = null;
  }
  const plainLabel = hasLabel
    ? evaluateExpressionOrText(child.props.label, child.parsed?.props?.label, scope, "Option:label")
    : undefined;
  const childrenArePlainText = hasChildren && child.children.every((optionChild) => optionChild.kind === "text");
  const childLabel = hasChildren
    ? optionLabelFromChildren(child, adapter, scope)
    : undefined;
  const label = plainLabel !== undefined
    ? plainLabel
    : hasChildren
      ? childLabel
      : undefined;
  const enabled = Object.prototype.hasOwnProperty.call(child.props, "enabled")
    ? booleanOptionValue(evaluateExpressionOrText(child.props.enabled, child.parsed?.props?.enabled, scope, "Option:enabled"))
    : true;
  return [{
    ...evaluatedOptionProps(child, scope),
    value: value ?? label ?? "",
    label: (plainLabel !== undefined && childrenArePlainText
      ? plainLabel
      : hasChildren
        ? childLabel
        : label ?? value ?? "") as ReactNode,
    selectionLabel: labelText(plainLabel ?? value ?? "", value),
    searchText: labelText(plainLabel ?? label ?? value ?? "", value),
    enabled,
    testId: child.props.testId,
    __xmluiRawValue: child.props.value,
    __xmluiParsedValueSource: parsedExpressionSource(child.parsed?.props?.value),
  }];
}

function optionLabelFromChildren(
  child: XmluiElement,
  adapter: XmluiComponentAdapter,
  scope: RuntimeScope,
): ReactNode {
  if (child.children.length === 0) {
    return String(child.props.value ?? "");
  }
  const allText = child.children.every((optionChild) => optionChild.kind === "text");
  if (allText) {
    return child.children.map((optionChild) => optionChild.kind === "text" ? optionChild.value : "").join("");
  }
  return adapter.context.renderChildren(child.children, scope);
}

function createScopedTemplateRenderer(adapter: XmluiComponentAdapter, templateName: string) {
  const template = templateChildren(adapter.node, templateName) ?? [];
  return (contextValues: Record<string, unknown>, key?: string | number) => {
    const templateScope = createRuntimeScope({
      store: adapter.scope.store,
      parent: adapter.scope,
      props: adapter.scope.props,
      contextValues,
      references: adapter.scope.references,
      slots: adapter.scope.slots,
      emitEvent: adapter.scope.emitEvent,
    });
    return <>{adapter.context.renderChildren(template, templateScope)}</>;
  };
}

function evaluatedOptionProps(
  child: Extract<XmluiElement["children"][number], { kind: "element" }>,
  scope: RuntimeScope,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [propName, propValue] of Object.entries(child.props)) {
    if (
      propName === "value" ||
      propName === "label" ||
      propName === "enabled" ||
      propName === "testId"
    ) {
      continue;
    }
    result[propName] = evaluateExpressionOrText(
      propValue,
      child.parsed?.props?.[propName],
      scope,
      `Option:${propName}`,
    );
  }
  return result;
}

function labelText(label: unknown, value: unknown): string {
  if (label !== undefined && label !== null && label !== "") {
    return String(label);
  }
  if (value !== undefined && value !== null) {
    return String(value);
  }
  return "";
}

function parsedExpressionSource(parsed: unknown): string | undefined {
  return parsed && typeof parsed === "object" && "source" in parsed
    ? String((parsed as { source: unknown }).source)
    : undefined;
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
