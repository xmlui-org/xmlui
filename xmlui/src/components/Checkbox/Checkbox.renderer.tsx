import { wrapComponent, nonPropertyChildren, templateChildren } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import { CheckboxMd } from "./Checkbox";
import { defaultProps } from "./Checkbox.defaults";
import { CheckboxNative, type CheckboxApi } from "./CheckboxReact";

const COMP = "Checkbox";

export const checkboxRenderer = wrapComponent({
  name: COMP,
  metadata: CheckboxMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const apiRef = { current: null as CheckboxApi | null };
    const inputTemplate = templateChildren(adapter.node, "inputTemplate") ?? nonPropertyChildren(adapter.node.children);
    return (
      <CheckboxNative
        {...adapter.rootAttrs("input")}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        bindTo={adapter.stringProp("bindTo")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        label={adapter.prop("label")}
        labelPosition={adapter.stringProp("labelPosition", "end")}
        labelBreak={adapter.booleanProp("labelBreak", false)}
        labelWidth={adapter.prop("labelWidth")}
        requireLabelMode={adapter.stringProp("requireLabelMode")}
        direction={adapter.stringProp("direction")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        indeterminate={adapter.booleanProp("indeterminate", defaultProps.indeterminate)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        variant={adapter.stringProp("variant")}
        inputRenderer={
          inputTemplate.length > 0
            ? (contextVars) => {
                const templateScope = createRuntimeScope({
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
                return adapter.context.renderChildren(inputTemplate, templateScope);
              }
            : undefined
        }
        onClick={(event) => {
          void adapter.event("click")(event);
        }}
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
