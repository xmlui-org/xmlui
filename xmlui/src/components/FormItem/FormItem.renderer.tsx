import { wrapComponent, nonPropertyChildren, templateChildren } from "../../runtime/rendering/adapter";
import type { XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { evaluateExpressionOrText } from "../../runtime/rendering/bindings";
import { createRuntimeScope } from "../../runtime/state";
import { radioOptions } from "../RadioGroup/RadioGroup";
import type { LabelPosition, Option as XmluiOption, RequireLabelMode } from "../abstractions";
import type {
  FormControlType,
  FormItemValidations,
  ValidateEventHandler,
  ValidationMode,
  ValidationSeverity,
} from "../Form/FormContext";
import { FormItemMd } from "./FormItem";
import { CustomFormItem, FormItem } from "./FormItemReact";
import { ValidationWrapper } from "./ValidationWrapper";

export const formItemRenderer = wrapComponent({
  name: "FormItem",
  metadata: FormItemMd,
  renderer({ adapter }) {
    const rootAttrs = adapter.rootAttrs();
    const explicitType = adapter.stringProp("type");
    const bindTo = adapter.stringProp("bindTo");
    const required = adapter.booleanProp("required", false);
    const inputTemplate = templateChildren(adapter.node, "inputTemplate") ?? [];
    const itemTemplate = nonPropertyChildren(adapter.node.children);
    const isCustomFormItem =
      (explicitType === undefined || explicitType === "custom") && itemTemplate.length > 0;
    const normalizedType = explicitType === "radio" ? "radioGroup" : explicitType;
    const type = (isCustomFormItem ? "custom" : normalizedType ?? "text") as FormControlType;
    const effectiveInputTemplate =
      type === "items" && inputTemplate.length === 0 ? itemTemplate : inputTemplate;
    const scopedItemIndex = adapter.scope.contextValues.$itemIndex;
    const validations: FormItemValidations = {
      required,
      requiredInvalidMessage: adapter.stringProp("requiredInvalidMessage"),
      minLength: optionalNumberProp(adapter, "minLength"),
      maxLength: optionalNumberProp(adapter, "maxLength"),
      lengthInvalidMessage: adapter.stringProp("lengthInvalidMessage"),
      lengthInvalidSeverity: optionalSeverityProp(adapter, "lengthInvalidSeverity"),
      minValue: optionalNumberProp(adapter, "minValue"),
      maxValue: optionalNumberProp(adapter, "maxValue"),
      rangeInvalidMessage: adapter.stringProp("rangeInvalidMessage"),
      rangeInvalidSeverity: optionalSeverityProp(adapter, "rangeInvalidSeverity"),
      validator: adapter.prop("validator") as string | string[] | undefined,
      validatorParams: adapter.prop("validatorParams"),
      validatorInvalidMessage: adapter.stringProp("validatorInvalidMessage"),
      validatorInvalidSeverity: optionalSeverityProp(adapter, "validatorInvalidSeverity"),
      pattern: adapter.stringProp("pattern"),
      patternInvalidMessage: adapter.stringProp("patternInvalidMessage"),
      patternInvalidSeverity: optionalSeverityProp(adapter, "patternInvalidSeverity"),
      regex: adapter.stringProp("regex"),
      regexInvalidMessage: adapter.stringProp("regexInvalidMessage"),
      regexInvalidSeverity: optionalSeverityProp(adapter, "regexInvalidSeverity"),
      matchValue: adapter.prop("matchValue"),
      matchInvalidMessage: adapter.stringProp("matchInvalidMessage"),
    };
    const onValidate = (
      adapter.node.events.validate ? (value: unknown) => adapter.event("validate")(value) : undefined
    ) as ValidateEventHandler;
    const formItem = (
      <FormItem
        bindTo={bindTo ?? ""}
        label={adapter.stringProp("label")}
        labelPosition={adapter.stringProp("labelPosition") as LabelPosition | undefined}
        labelWidth={adapter.stringProp("labelWidth")}
        labelBreak={
          Object.prototype.hasOwnProperty.call(adapter.props, "labelBreak")
            ? adapter.booleanProp("labelBreak", false)
            : undefined
        }
        enabled={adapter.booleanProp("enabled", true)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        type={type}
        initialValue={adapter.prop("initialValue")}
        required={required}
        requireLabelMode={adapter.stringProp("requireLabelMode") as RequireLabelMode | undefined}
        requiredInvalidMessage={adapter.stringProp("requiredInvalidMessage")}
        minLength={optionalNumberProp(adapter, "minLength")}
        maxLength={optionalNumberProp(adapter, "maxLength")}
        lengthInvalidMessage={adapter.stringProp("lengthInvalidMessage")}
        lengthInvalidSeverity={optionalSeverityProp(adapter, "lengthInvalidSeverity")}
        minValue={optionalNumberProp(adapter, "minValue")}
        maxValue={optionalNumberProp(adapter, "maxValue")}
        rangeInvalidMessage={adapter.stringProp("rangeInvalidMessage")}
        rangeInvalidSeverity={optionalSeverityProp(adapter, "rangeInvalidSeverity")}
        validator={adapter.prop("validator") as string | string[] | undefined}
        validatorParams={adapter.prop("validatorParams")}
        validatorInvalidMessage={adapter.stringProp("validatorInvalidMessage")}
        validatorInvalidSeverity={optionalSeverityProp(adapter, "validatorInvalidSeverity")}
        pattern={adapter.stringProp("pattern")}
        patternInvalidMessage={adapter.stringProp("patternInvalidMessage")}
        patternInvalidSeverity={optionalSeverityProp(adapter, "patternInvalidSeverity")}
        regex={adapter.stringProp("regex")}
        regexInvalidMessage={adapter.stringProp("regexInvalidMessage")}
        regexInvalidSeverity={optionalSeverityProp(adapter, "regexInvalidSeverity")}
        matchValue={adapter.prop("matchValue")}
        matchInvalidMessage={adapter.stringProp("matchInvalidMessage")}
        noSubmit={adapter.booleanProp("noSubmit", false)}
        validationMode={adapter.stringProp("validationMode") as ValidationMode | undefined}
        customValidationsDebounce={adapter.numberProp("customValidationsDebounce", 0)}
        onValidate={onValidate}
        {...(Object.prototype.hasOwnProperty.call(adapter.props, "zeroOrPositive")
          ? { zeroOrPositive: adapter.booleanProp("zeroOrPositive", false) }
          : {})}
        {...(type === "select"
          ? {
              options: selectOptions(adapter),
              groupBy: adapter.stringProp("groupBy"),
              searchable: adapter.booleanProp("searchable", false),
              ...(templateChildren(adapter.node, "groupHeaderTemplate")
                ? { groupHeaderRenderer: createScopedTemplateRenderer(adapter, "groupHeaderTemplate") }
                : {}),
              ...(templateChildren(adapter.node, "ungroupedHeaderTemplate")
                ? { ungroupedHeaderRenderer: createScopedTemplateRenderer(adapter, "ungroupedHeaderTemplate") }
                : {}),
            }
          : {})}
        {...(type === "radioGroup" ? { options: radioOptions(adapter) } : {})}
        inputRenderer={
          effectiveInputTemplate.length > 0
            ? (contextVars: Record<string, unknown>) => {
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
                return adapter.context.renderChildren(effectiveInputTemplate, inputScope);
              }
            : undefined
        }
        registerComponentApi={adapter.registerApi}
        itemIndex={typeof scopedItemIndex === "number" ? scopedItemIndex : undefined}
        className={adapter.className}
        style={adapter.style}
      >
        {isCustomFormItem ? (
          <CustomFormItem
            renderChild={(child: any, layoutContext: any) =>
              renderScopedChild(adapter, child, layoutContext)
            }
            node={adapter.node as any}
            bindTo={bindTo ?? ""}
          />
        ) : type !== "items" && itemTemplate.length > 0 ? (
          adapter.context.renderChildren(itemTemplate, adapter.scope)
        ) : undefined}
      </FormItem>
    );
    return (
      <div {...rootAttrs}>
        <ValidationWrapper
          bindTo={bindTo}
          validations={validations}
          onValidate={onValidate}
          customValidationsDebounce={adapter.numberProp("customValidationsDebounce", 0)}
          validationMode={adapter.stringProp("validationMode") as ValidationMode | undefined}
          formItemType={type}
          componentType="FormItem"
          inline={adapter.booleanProp("inline", false)}
          itemIndex={typeof scopedItemIndex === "number" ? scopedItemIndex : undefined}
          isFormItem
        >
          {formItem}
        </ValidationWrapper>
      </div>
    );
  },
});

function optionalNumberProp(adapter: XmluiComponentAdapter, name: string): number | undefined {
  return Object.prototype.hasOwnProperty.call(adapter.props, name)
    ? adapter.numberProp(name)
    : undefined;
}

function renderScopedChild(adapter: XmluiComponentAdapter, child: any, layoutContext: any) {
  if (
    child &&
    typeof child === "object" &&
    (child.type === "Container" || child.type === "Fragment") &&
    child.contextVars
  ) {
    const scoped = createRuntimeScope({
      store: adapter.scope.store,
      parent: adapter.scope,
      props: adapter.scope.props,
      contextValues: child.contextVars,
      references: adapter.scope.references,
      slots: adapter.scope.slots,
      routing: adapter.scope.routing,
      toast: adapter.scope.toast,
      emitEvent: adapter.scope.emitEvent,
      extensionFunctions: adapter.scope.extensionFunctions,
    });
    return adapter.context.renderChildren(
      nonPropertyChildren(child.children ?? []),
      scoped,
      adapter.node.range.end,
      layoutContext,
    );
  }
  return adapter.context.renderChildren(
    Array.isArray(child) ? child : [child],
    adapter.scope,
    adapter.node.range.end,
    layoutContext,
  );
}

function optionalSeverityProp(adapter: XmluiComponentAdapter, name: string): ValidationSeverity | undefined {
  return adapter.stringProp(name) as ValidationSeverity | undefined;
}

function selectOptions(adapter: XmluiComponentAdapter): XmluiOption[] {
  const data = adapter.prop<unknown>("data");
  if (Array.isArray(data)) {
    const valueField = adapter.stringProp("valueField", "value") ?? "value";
    const labelField = adapter.stringProp("labelField", "label") ?? "label";
    return data.map((item) => dataOption(item, valueField, labelField));
  }
  return adapter.node.children.flatMap((child) => {
    if (child.kind === "element" && child.type === "Items") {
      const items = evaluateExpressionOrText(
        child.props.items ?? child.props.data,
        child.parsed?.props?.items ?? child.parsed?.props?.data,
        adapter.scope,
        "Items:items",
      );
      const itemTemplate = templateChildren(child, "itemTemplate") ?? nonPropertyChildren(child.children);
      if (!Array.isArray(items)) {
        return [];
      }
      return items.flatMap((item, index) => {
        const itemScope = createRuntimeScope({
          store: adapter.scope.store,
          parent: adapter.scope,
          props: adapter.scope.props,
          contextValues: {
            $item: item,
            $itemIndex: index,
            $isFirst: index === 0,
            $isLast: index === items.length - 1,
          },
          references: adapter.scope.references,
          slots: adapter.scope.slots,
          routing: adapter.scope.routing,
          toast: adapter.scope.toast,
          emitEvent: adapter.scope.emitEvent,
          extensionFunctions: adapter.scope.extensionFunctions,
        });
        return itemTemplate.flatMap((itemChild) =>
          itemChild.kind === "element" && itemChild.type === "Option"
            ? optionNodeToData(itemChild, itemScope)
            : []
        );
      });
    }
    if (child.kind !== "element" || child.type !== "Option") {
      return [];
    }
    return optionNodeToData(child, adapter.scope);
  });
}

function optionNodeToData(child: any, scope: any): XmluiOption[] {
  const resolvedProps = Object.fromEntries(
    Object.entries(child.props ?? {}).map(([name, propValue]) => [
      name,
      evaluateExpressionOrText(
        propValue,
        child.parsed?.props?.[name],
        scope,
        `Option:${name}`,
      ),
    ]),
  );
  const hasValue = Object.prototype.hasOwnProperty.call(child.props, "value");
  const hasLabel = Object.prototype.hasOwnProperty.call(child.props, "label");
  const value = hasValue ? resolvedProps.value : undefined;
  const label = hasLabel
    ? resolvedProps.label
    : child.children.every((optionChild: any) => optionChild.kind === "text")
      ? child.children.map((optionChild: any) => optionChild.kind === "text" ? optionChild.value : "").join("")
      : undefined;
  if (value === undefined && label === undefined) {
    return [];
  }
  const enabled = Object.prototype.hasOwnProperty.call(child.props, "enabled")
    ? Boolean(resolvedProps.enabled)
    : true;
  return [{
    ...resolvedProps,
    value: String(value ?? label ?? ""),
    label: String(label ?? value ?? ""),
    enabled,
    testId: child.props.testId as string | undefined,
  }];
}

function dataOption(item: unknown, valueField: string, labelField: string): XmluiOption {
  if (item !== null && typeof item === "object") {
    const record = item as Record<string, unknown>;
    const value = record[valueField];
    const label = record[labelField] ?? value;
    return { ...record, value: String(value ?? ""), label: String(label ?? ""), enabled: true };
  }
  return { value: String(item ?? ""), label: String(item ?? ""), enabled: true };
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
