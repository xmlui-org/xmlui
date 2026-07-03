import { wrapComponent, nonPropertyChildren, templateChildren } from "../../runtime/rendering/adapter";
import type { XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { evaluateExpressionOrText } from "../../runtime/rendering/bindings";
import { createRuntimeScope } from "../../runtime/state";
import { radioOptions } from "../RadioGroup/RadioGroup";
import type { Option as XmluiOption } from "../abstractions";
import { FormItemMd } from "./FormItem";
import { FormItem } from "./FormItemReact";

export const formItemRenderer = wrapComponent({
  name: "FormItem",
  metadata: FormItemMd,
  renderer({ adapter }) {
    const type = adapter.stringProp("type", "text");
    const inputTemplate = templateChildren(adapter.node, "inputTemplate") ?? [];
    const itemTemplate = nonPropertyChildren(adapter.node.children);
    return (
      <FormItem
        {...adapter.rootAttrs()}
        id={adapter.stringProp("id")}
        bindTo={adapter.stringProp("bindTo")}
        label={adapter.stringProp("label")}
        labelPosition={adapter.stringProp("labelPosition")}
        labelWidth={adapter.prop("labelWidth") as string | number | undefined}
        labelBreak={
          Object.prototype.hasOwnProperty.call(adapter.props, "labelBreak")
            ? adapter.booleanProp("labelBreak", false)
            : undefined
        }
        enabled={adapter.booleanProp("enabled", true)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        type={type}
        initialValue={adapter.prop("initialValue")}
        required={adapter.booleanProp("required", false)}
        requireLabelMode={adapter.stringProp("requireLabelMode")}
        requiredInvalidMessage={adapter.stringProp("requiredInvalidMessage")}
        minLength={adapter.numberProp("minLength")}
        lengthInvalidMessage={adapter.stringProp("lengthInvalidMessage")}
        pattern={adapter.stringProp("pattern")}
        patternInvalidMessage={adapter.stringProp("patternInvalidMessage")}
        patternInvalidSeverity={adapter.stringProp("patternInvalidSeverity")}
        regex={adapter.stringProp("regex")}
        regexInvalidMessage={adapter.stringProp("regexInvalidMessage")}
        regexInvalidSeverity={adapter.stringProp("regexInvalidSeverity")}
        matchValue={adapter.prop("matchValue")}
        matchInvalidMessage={adapter.stringProp("matchInvalidMessage")}
        noSubmit={adapter.booleanProp("noSubmit", false)}
        validationMode={adapter.stringProp("validationMode")}
        customValidationsDebounce={adapter.numberProp("customValidationsDebounce", 0)}
        onValidate={adapter.node.events.validate ? (value) => adapter.event("validate")(value) : undefined}
        options={
          type === "select"
            ? selectOptions(adapter)
            : type === "radioGroup"
              ? radioOptions(adapter)
              : undefined
        }
        groupBy={type === "select" ? adapter.stringProp("groupBy") : undefined}
        searchable={type === "select" ? adapter.booleanProp("searchable", false) : undefined}
        groupHeaderTemplateRenderer={
          type === "select" && templateChildren(adapter.node, "groupHeaderTemplate")
            ? createScopedTemplateRenderer(adapter, "groupHeaderTemplate")
            : undefined
        }
        ungroupedHeaderTemplateRenderer={
          type === "select" && templateChildren(adapter.node, "ungroupedHeaderTemplate")
            ? createScopedTemplateRenderer(adapter, "ungroupedHeaderTemplate")
            : undefined
        }
        inputRenderer={
          inputTemplate.length > 0
            ? (contextVars) => {
                const inputScope = createRuntimeScope({
                  store: adapter.scope.store,
                  parent: adapter.scope,
                  props: adapter.scope.props,
                  contextValues: contextVars,
                  references: adapter.scope.references,
                  slots: adapter.scope.slots,
                  routing: adapter.scope.routing,
                  toast: adapter.scope.toast,
                  emitEvent: adapter.scope.emitEvent,
                  extensionFunctions: adapter.scope.extensionFunctions,
                });
                return adapter.context.renderChildren(inputTemplate, inputScope);
              }
            : undefined
        }
        registerComponentApi={adapter.registerApi}
        renderItemTemplate={
          type === "items"
            ? (contextVars) => {
                const itemScope = createRuntimeScope({
                  store: adapter.scope.store,
                  parent: adapter.scope,
                  props: adapter.scope.props,
                  contextValues: contextVars,
                  references: adapter.scope.references,
                  slots: adapter.scope.slots,
                  routing: adapter.scope.routing,
                  toast: adapter.scope.toast,
                  emitEvent: adapter.scope.emitEvent,
                  extensionFunctions: adapter.scope.extensionFunctions,
                });
                return adapter.context.renderChildren(itemTemplate, itemScope);
              }
            : undefined
        }
        className={adapter.className}
        style={adapter.style}
      >
        {type !== "items" && itemTemplate.length > 0 ? adapter.context.renderChildren(itemTemplate, adapter.scope) : undefined}
      </FormItem>
    );
  },
});

function selectOptions(adapter: XmluiComponentAdapter): XmluiOption[] {
  const data = adapter.prop<unknown>("data");
  if (Array.isArray(data)) {
    const valueField = adapter.stringProp("valueField", "value") ?? "value";
    const labelField = adapter.stringProp("labelField", "label") ?? "label";
    return data.map((item) => dataOption(item, valueField, labelField));
  }
  return adapter.node.children.flatMap((child) => {
    if (child.kind !== "element" || child.type !== "Option") {
      return [];
    }
    const hasValue = Object.prototype.hasOwnProperty.call(child.props, "value");
    const hasLabel = Object.prototype.hasOwnProperty.call(child.props, "label");
    const value = hasValue
      ? evaluateExpressionOrText(child.props.value, child.parsed?.props?.value, adapter.scope, "Option:value")
      : undefined;
    const label = hasLabel
      ? evaluateExpressionOrText(child.props.label, child.parsed?.props?.label, adapter.scope, "Option:label")
      : child.children.every((optionChild) => optionChild.kind === "text")
        ? child.children.map((optionChild) => optionChild.kind === "text" ? optionChild.value : "").join("")
        : undefined;
    if (value === undefined && label === undefined) {
      return [];
    }
    const enabled = Object.prototype.hasOwnProperty.call(child.props, "enabled")
      ? Boolean(evaluateExpressionOrText(child.props.enabled, child.parsed?.props?.enabled, adapter.scope, "Option:enabled"))
      : true;
    return [{
      value: value ?? label ?? "",
      label: label ?? value ?? "",
      enabled,
      testId: child.props.testId,
    }];
  });
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

function createScopedTemplateRenderer(
  adapter: Parameters<Parameters<typeof wrapComponent>[0]["renderer"]>[0]["adapter"],
  templateName: string,
) {
  const template = templateChildren(adapter.node, templateName) ?? [];
  return (contextValues: Record<string, unknown>) => {
    const templateScope = createRuntimeScope({
      store: adapter.scope.store,
      parent: adapter.scope,
      props: adapter.scope.props,
      contextValues,
      references: adapter.scope.references,
      slots: adapter.scope.slots,
      routing: adapter.scope.routing,
      toast: adapter.scope.toast,
      emitEvent: adapter.scope.emitEvent,
      extensionFunctions: adapter.scope.extensionFunctions,
    });
    return adapter.context.renderChildren(template, templateScope);
  };
}
