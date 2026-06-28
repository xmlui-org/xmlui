import { useCallback, useRef, useState, type CSSProperties } from "react";

import { wrapComponent, nonPropertyChildren, templateChildren } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import { COMPONENT_PART_KEY } from "../../styling";
import { CheckboxMd } from "./Checkbox";
import { defaultProps } from "./Checkbox.defaults";
import { Toggle } from "../Toggle/Toggle";
import type { ValidationStatus } from "../abstractions";
import styles from "./Checkbox.module.scss";
import { useFormContext } from "../Form/FormContext";

const COMP = "Checkbox";

export const checkboxRenderer = wrapComponent({
  name: COMP,
  metadata: CheckboxMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const [state, setState] = useState<Record<string, unknown>>({});
    const form = useFormContext();
    const adapterRef = useRef(adapter);
    const formRef = useRef(form);
    const fieldNameRef = useRef<string | undefined>(undefined);
    const currentValueRef = useRef(state.value);
    const inputTemplate = templateChildren(adapter.node, "inputTemplate") ?? nonPropertyChildren(adapter.node.children);
    const rawRootAttrs = adapter.rootAttrs("input");
    const rootAttrs: Record<string, unknown> = {
      ...rawRootAttrs,
      "data-testid": rawRootAttrs["data-testid"] ?? adapter.stringProp("id"),
    };
    const label = adapter.prop("label");
    const hasLabel = label !== undefined && label !== null && label !== "";
    const labelPosition = adapter.stringProp("labelPosition", "top");
    const labelBreak = adapter.booleanProp("labelBreak", false);
    const labelWidth = adapter.prop("labelWidth");
    const required = adapter.booleanProp("required", false);
    const requireLabelMode = adapter.stringProp(
      "requireLabelMode",
      form?.itemRequireLabelMode ?? "markRequired",
    );
    const bindTo = adapter.stringProp("bindTo");
    const fieldName = bindTo !== undefined ? resolveFieldName(bindTo, form?.fieldPrefix) : undefined;
    const formValue = form && fieldName !== undefined ? form.getValue(fieldName) : undefined;
    const hasExplicitValue = Object.prototype.hasOwnProperty.call(adapter.node.props, "value");
    const isCompactLabelPosition =
      labelPosition === "start" ||
      labelPosition === "end" ||
      labelPosition === "before" ||
      labelPosition === "after";
    adapterRef.current = adapter;
    formRef.current = form;
    fieldNameRef.current = fieldName;
    currentValueRef.current = formValue ?? state.value;
    const hasVariantWrapper = !hasLabel && adapter.prop("variant") !== undefined;
    const labeledRootAttrs = hasLabel
      ? {
          ...rootAttrs,
          "data-xmlui-part": "input",
          "data-testid": rootAttrs["data-testid"],
          className: [
            styles.container,
            styles.checkboxItemWithLabel,
            isCompactLabelPosition ? styles.checkboxItemWithLabelCompact : undefined,
            rootAttrs.className as string | undefined,
          ].filter(Boolean).join(" "),
        }
      : undefined;
    const toggleAttrs: Record<string, unknown> = {
      ...(hasLabel || hasVariantWrapper
        ? { ...rootAttrs, "data-testid": undefined, className: undefined, style: undefined }
        : rootAttrs),
      "data-part-id": "input",
    };
    const updateState = useCallback((componentState: Record<string, unknown>, options?: unknown) => {
      if (Object.prototype.hasOwnProperty.call(componentState, "value")) {
        currentValueRef.current = componentState.value;
        adapterRef.current.registerApi({
          value: currentValueRef.current,
        });
      }
      setState((current) => ({ ...current, ...componentState }));
      const currentForm = formRef.current;
      const currentFieldName = fieldNameRef.current;
      if (
        currentForm &&
        currentFieldName !== undefined &&
        Object.prototype.hasOwnProperty.call(componentState, "value") &&
        !(typeof options === "object" && options !== null && "initial" in options)
      ) {
        currentForm.setValue(currentFieldName, componentState.value);
      }
    }, []);
    const registerComponentApi = useCallback((api: Record<string, unknown>) => {
      adapterRef.current.registerApi({
        ...api,
        value: currentValueRef.current,
      });
    }, []);
    const toggle = (
      <Toggle
        {...toggleAttrs}
        id={adapter.stringProp("id")}
        classes={{ [COMPONENT_PART_KEY]: adapter.className }}
        style={toggleAttrs.style as CSSProperties | undefined}
        className={toggleAttrs.className as string | undefined}
        value={normalizeToggleBoundaryValue(
          hasExplicitValue ? adapter.prop("value") : formValue ?? state.value,
        ) as any}
        initialValue={normalizeToggleBoundaryValue(
          adapter.prop("initialValue", defaultProps.initialValue),
        ) as any}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={required}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        indeterminate={adapter.booleanProp("indeterminate", defaultProps.indeterminate)}
        validationStatus={adapter.stringProp(
          "validationStatus",
          defaultProps.validationStatus,
        ) as ValidationStatus}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
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

    if (hasVariantWrapper) {
      return (
        <span
          {...rootAttrs}
          className={[
            styles.checkboxVariantWrapper,
            rootAttrs.className as string | undefined,
          ].filter(Boolean).join(" ")}
        >
          {toggle}
        </span>
      );
    }

    if (!hasLabel) {
      return toggle;
    }

    const labelStyle = labelWidth !== undefined
      ? { width: typeof labelWidth === "number" ? `${labelWidth}px` : String(labelWidth) }
      : undefined;
    const showRequiredIndicator =
      required && (requireLabelMode === "markRequired" || requireLabelMode === "markBoth");
    const showOptionalIndicator =
      !required && (requireLabelMode === "markOptional" || requireLabelMode === "markBoth");

    const labeledClassName = [
      styles.checkboxLabeledItem,
      labelPositionClass(labelPosition),
    ].filter(Boolean).join(" ");

    return (
      <div {...labeledRootAttrs}>
      <label
        className={labeledClassName}
        dir={adapter.stringProp("direction")}
      >
        <span
          className={[
            styles.checkboxLabel,
            labelBreak ? styles.checkboxLabelBreak : undefined,
          ].filter(Boolean).join(" ")}
          style={labelStyle}
        >
          {String(label)}
          {showRequiredIndicator ? <span className={styles.checkboxLabelRequired}>*</span> : null}
          {showOptionalIndicator ? <span className={styles.checkboxLabelOptional}>(Optional)</span> : null}
        </span>
        {toggle}
      </label>
      </div>
    );
  },
});

function normalizeToggleBoundaryValue(value: unknown): boolean | string | number | object | undefined {
  if (typeof value === "number" && Number.isNaN(value)) {
    return "NaN";
  }
  return value as boolean | string | number | object | undefined;
}

function resolveFieldName(bindTo: string, fieldPrefix?: string): string {
  if (!fieldPrefix) {
    return bindTo;
  }
  return bindTo ? `${fieldPrefix}.${bindTo}` : fieldPrefix;
}

function labelPositionClass(labelPosition: string | undefined): string {
  switch (labelPosition) {
    case "start":
      return styles.checkboxLabelPositionBefore;
    case "top":
      return styles.checkboxLabelPositionTop;
    case "bottom":
      return styles.checkboxLabelPositionBottom;
    case "before":
      return styles.checkboxLabelPositionBefore;
    case "after":
      return styles.checkboxLabelPositionAfter;
    case "end":
      return styles.checkboxLabelPositionEnd;
    default:
      return styles.checkboxLabelPositionTop;
  }
}
