import { wrapComponent, nonPropertyChildren, templateChildren } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import { radioOptions } from "../RadioGroup/RadioGroup";
import { selectOptions } from "../Select/Select";
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
