import styles from "./AutoComplete.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  dPlaceholder,
  dInitialValue,
  dMaxLength,
  dAutoFocus,
  dRequired,
  dReadonly,
  dEnabled,
  dValidationStatus,
  dComponent,
  dDidChange,
  dGotFocus,
  dLostFocus,
  dMulti,
  createMetadata,
} from "../metadata-helpers";
import { defaultProps } from "./AutoComplete.defaults";
import { AutoComplete } from "./AutoCompleteReact";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { wrapComponent } from "../../components-core/wrapComponent";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { createRuntimeScope } from "../../runtime/state";
import { nonPropertyChildren, templateChildren, wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { useFormContext } from "../Form/FormContext";
import { RuntimeOptionClassContext } from "../Option/Option";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const COMP = "AutoComplete";

export const AutoCompleteMd = createMetadata({
  status: "experimental",
  description:
    "`AutoComplete` is a searchable dropdown input that allows users to type and " +
    "filter through options, with support for single or multiple selections. Unlike " +
    "a basic [`Select`](/docs/reference/components/Select), it provides type-ahead functionality " +
    "and can allow users to create new options.",
  optimization: {
    isImplicitContainerByDefault: true,
  },
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    maxLength: dMaxLength(),
    autoFocus: {
      ...dAutoFocus(),
      defaultValue: defaultProps.autoFocus,
    },
    required: {
      ...dRequired(),
      defaultValue: defaultProps.required,
    },
    readOnly: {
      ...dReadonly(),
      defaultValue: defaultProps.readOnly,
    },
    enabled: {
      ...dEnabled(),
      defaultValue: defaultProps.enabled,
    },
    initiallyOpen: {
      description: `This property determines whether the dropdown list is open when the component is first rendered.`,
      availableValues: null,
      valueType: "boolean",
      defaultValue: defaultProps.initiallyOpen,
    },
    creatable: {
      description: `This property allows the user to create new items that are not present in the list of options.`,
      availableValues: null,
      valueType: "boolean",
      defaultValue: defaultProps.creatable,
    },
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: defaultProps.validationStatus,
    },
    dropdownHeight: {
      description: "This property sets the height of the dropdown list.",
      valueType: "length",
    },
    multi: {
      ...dMulti(),
      defaultValue: defaultProps.multi,
    },
    optionTemplate: dComponent(
      `This property enables the customization of list items. To access the attributes of ` +
        `a list item use the \`$item\` context variable.`,
    ),
    emptyListTemplate: dComponent(
      "This property defines the template to display when the list of options is empty.",
    ),
    groupBy: {
      description:
        "Field name on each Option to group by. When set, the dropdown shows a " +
        "section header above each group of options sharing the same value of " +
        "`option[groupBy]`. Headers are computed against the currently visible " +
        "(filtered) options, so searching automatically updates which option carries " +
        "its group's header. Use it together with an extra attribute on `<Option>` " +
        '(e.g. `clientName="{$item.clientName}"`). Mirrors `Select`\'s `groupBy`.',
      valueType: "string" as const,
    },
    groupHeaderTemplate: dComponent(
      "Customizes the section header rendered above each group when `groupBy` " +
        "is set. Use the `$group` context variable to access the group name. " +
        "When omitted, the group name is rendered as plain text.",
    ),
    ungroupedHeaderTemplate: dComponent(
      'Customizes the section header for the "Ungrouped" bucket (options that ' +
        "do not declare a value for the `groupBy` field). When omitted, the " +
        "Ungrouped bucket has no header.",
    ),
    modal: {
      isInternal: true,
      description: "internal radix modal prop",
      valueType: "boolean",
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in input components.",
      valueType: "boolean" as const,
      isInternal: true,
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      valueType: "string" as const,
      isInternal: true,
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      valueType: "string" as const,
      isInternal: true,
    },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
    itemCreated: {
      description:
        "This event is triggered when a new item is created by the user " +
        "(if `creatable` is enabled).",
      signature: "(item: string) => void",
      parameters: {
        item: "The newly created item value.",
      },
    },
  },
  apis: {
    focus: {
      description: `This method focuses the ${COMP} component.`,
      signature: "focus()",
    },
    value: {
      description:
        "This API allows you to get or set the value of the component. If no value is set, " +
        "it will retrieve `undefined`.",
      signature: "get value(): any",
    },
    setValue: {
      description:
        "This API allows you to set the value of the component. If the value is not valid, " +
        "the component will not update its internal state.",
      signature: "setValue(value: any)",
      parameters: {
        value: "The value to set.",
      },
    },
  },
  contextVars: {
    $item: {
      description:
        "This context value represents an item when you define an option item template. " +
        "Use `$item.value` and `$item.label` to refer to the value and label of the " +
        "particular option.",
    },
    $group: {
      description: "Group name available inside `groupHeaderTemplate` when `groupBy` is set.",
    },
    $selectedValue: {
      description: "Currently selected value, injected into the trigger/option template.",
      isInternal: true,
    },
    $inTrigger: {
      description: "True when rendering inside the trigger (vs the dropdown list).",
      isInternal: true,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`backgroundColor-menu-${COMP}`]: "$color-surface-raised",
    [`boxShadow-menu-${COMP}`]: "$boxShadow-md",
    [`borderRadius-menu-${COMP}`]: "$borderRadius",
    [`borderWidth-menu-${COMP}`]: "1px",
    [`borderColor-menu-${COMP}`]: "$borderColor",
    [`backgroundColor-${COMP}-badge`]: "$color-primary-500",
    [`fontSize-${COMP}-badge`]: "$fontSize-sm",
    [`paddingHorizontal-${COMP}-badge`]: "$space-2_5",
    [`paddingVertical-${COMP}-badge`]: "$space-0_5",
    [`borderRadius-${COMP}-badge`]: "$borderRadius",
    [`paddingHorizontal-item-${COMP}`]: "$space-2",
    [`paddingVertical-item-${COMP}`]: "$space-2",
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`backgroundColor-${COMP}-badge--hover`]: "$color-primary-400",
    [`backgroundColor-${COMP}-badge--active`]: "$color-primary-500",
    [`textColor-item-${COMP}--disabled`]: "$color-surface-300",
    [`textColor-${COMP}-badge`]: "$const-color-surface-50",
    [`backgroundColor-item-${COMP}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-item-${COMP}--hover`]: "$backgroundColor-dropdown-item--hover",
    [`backgroundColor-item-${COMP}--active`]: "$backgroundColor-dropdown-item--active",
    [`borderColor-${COMP}--disabled`]: "$borderColor--disabled",
    [`textColor-${COMP}--disabled`]: "$textColor--disabled",
    // Group header styling (used when `groupBy` is set on AutoComplete).
    [`paddingHorizontal-groupHeader-${COMP}`]: "$space-3",
    [`paddingTop-groupHeader-${COMP}`]: "$space-3",
    [`paddingBottom-groupHeader-${COMP}`]: "$space-1",
    [`fontSize-groupHeader-${COMP}`]: "$fontSize-tiny",
    [`fontWeight-groupHeader-${COMP}`]: "700",
    [`letterSpacing-groupHeader-${COMP}`]: "0.05em",
    [`textTransform-groupHeader-${COMP}`]: "uppercase",
    [`textColor-groupHeader-${COMP}`]: "$textColor-subtitle",
  },
});

type ThemedAutoCompleteProps = React.ComponentPropsWithoutRef<typeof AutoComplete>;

export const ThemedAutoComplete = React.forwardRef<
  React.ElementRef<typeof AutoComplete>,
  ThemedAutoCompleteProps
>(function ThemedAutoComplete({ className, ...props }, ref) {
  const themeClass = useComponentThemeClass(AutoCompleteMd);
  const combinedClassName = `${themeClass}${className ? ` ${className}` : ""}`;
  return (
    <AutoComplete
      {...props}
      className={combinedClassName}
      contentClassName={combinedClassName}
      ref={ref}
    />
  );
});

export const autoCompleteComponentRenderer = wrapComponent(COMP, AutoComplete, AutoCompleteMd, {
  contentClassName: true,
  exposeRegisterApi: true,
  events: {
    gotFocus: "onFocus",
    lostFocus: "onBlur",
    didChange: "onDidChange",
    itemCreated: "onItemCreated",
  },
  renderers: {
    optionTemplate: {
      contextVars: ["$item", "$selectedValue", "$inTrigger"],
    },
    groupHeaderTemplate: {
      contextVars: ["$group"],
    },
    ungroupedHeaderTemplate: {
      contextVars: [],
    },
  },
});

type RuntimeAutoCompleteProps = React.ComponentProps<typeof AutoComplete> & {
  adapter: XmluiComponentAdapter;
  bindTo?: string;
};

function RuntimeAutoCompleteShell({
  adapter,
  bindTo,
  value,
  initialValue,
  required,
  validationStatus,
  invalidMessages,
  verboseValidationFeedback,
  onDidChange,
  ...props
}: RuntimeAutoCompleteProps) {
  const form = useFormContext();
  const adapterRef = React.useRef(adapter);
  const formRef = React.useRef(form);
  const fieldName = React.useMemo(() => {
    if (!bindTo) {
      return undefined;
    }
    return form?.fieldPrefix ? `${form.fieldPrefix}.${bindTo}` : bindTo;
  }, [bindTo, form?.fieldPrefix]);
  const formValue = fieldName ? form?.getValue(fieldName) : undefined;
  const formError = fieldName ? form?.errors[fieldName] : undefined;
  const controlledValue = formValue !== undefined ? formValue : value;
  const [localValue, setLocalValue] = React.useState(
    controlledValue !== undefined ? controlledValue : initialValue,
  );
  const apiRef = React.useRef<Record<string, unknown>>({});
  const lastRegisteredValueRef = React.useRef<unknown>(undefined);
  adapterRef.current = adapter;
  formRef.current = form;

  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  React.useEffect(() => {
    if (!form || !fieldName) {
      return;
    }
    if (form.getValue(fieldName) == null && initialValue !== undefined) {
      form.setValue(fieldName, initialValue);
    }
  }, [fieldName, form, initialValue]);

  React.useEffect(() => {
    if (!form || !fieldName) {
      return;
    }
    return form.registerItem({
      name: fieldName,
      required,
    });
  }, [fieldName, form, required]);

  const registerComponentApi = React.useCallback((api: Record<string, unknown>) => {
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

  const updateState = React.useCallback((
    state: Record<string, unknown>,
    options?: { initial?: boolean; formOnly?: boolean },
  ) => {
    if (!Object.prototype.hasOwnProperty.call(state, "value")) {
      return;
    }
    const nextValue = state.value;
    if (!options?.formOnly) {
      setLocalValue(nextValue);
    }
    const currentForm = formRef.current;
    if (currentForm && fieldName && !options?.initial) {
      currentForm.setValue(fieldName, nextValue);
      void currentForm.validateField(fieldName, nextValue);
    }
  }, [fieldName]);

  const effectiveValidationStatus = formError
    ? "error"
    : required && hasAutoCompleteValue(localValue)
      ? "valid"
      : validationStatus;
  const effectiveInvalidMessages = formError ? formError.split("\n") : invalidMessages;
  const effectiveVerboseValidationFeedback =
    verboseValidationFeedback ?? form?.verboseValidationFeedback ?? true;

  const renderedAutoComplete = (
    <AutoComplete
      {...props}
      value={controlledValue !== undefined ? controlledValue : localValue}
      initialValue={initialValue as string | string[] | undefined}
      updateState={updateState}
      registerComponentApi={registerComponentApi}
      required={required}
      validationStatus={effectiveValidationStatus}
      invalidMessages={effectiveInvalidMessages}
      verboseValidationFeedback={effectiveVerboseValidationFeedback}
      onDidChange={(newValue) => {
        setLocalValue(newValue);
        onDidChange?.(newValue);
        void adapter.event("didChange")(newValue);
      }}
      onFocus={(event) => {
        props.onFocus?.(event);
        void adapter.event("gotFocus")();
      }}
      onBlur={(event) => {
        props.onBlur?.(event);
        void adapter.event("lostFocus")();
      }}
      onItemCreated={(item) => {
        props.onItemCreated?.(item);
        void adapter.event("itemCreated")(item);
      }}
    />
  );

  if (formError && effectiveVerboseValidationFeedback) {
    return (
      <>
        {renderedAutoComplete}
        <div data-validation-display-severity="error">{formError}</div>
      </>
    );
  }

  return renderedAutoComplete;
}

function runtimeAutoCompleteProps(adapter: XmluiComponentAdapter): RuntimeAutoCompleteProps {
  const rootAttrs = adapter.rootAttrs(COMPONENT_PART_KEY) as React.HTMLAttributes<HTMLDivElement>;
  const rootStyle = rootAttrs.style as React.CSSProperties | undefined;
  const {
    onFocus,
    onBlur,
    onChange,
    label,
    labelPosition,
    labelBreak,
    labelWidth,
    style: _rootStyle,
    className: _rootClassName,
  } = rootAttrs as React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>;
  return {
    adapter,
    id: adapter.stringProp("id"),
    bindTo: adapter.stringProp("bindTo"),
    readOnly: adapter.booleanProp("readOnly", defaultProps.readOnly),
    value: adapter.prop("value"),
    initialValue: adapter.prop("initialValue") as string | string[] | undefined,
    autoFocus: adapter.booleanProp("autoFocus", defaultProps.autoFocus),
    enabled: adapter.booleanProp("enabled", defaultProps.enabled),
    placeholder: adapter.stringProp("placeholder", defaultProps.placeholder),
    maxLength: Object.prototype.hasOwnProperty.call(adapter.props, "maxLength")
      ? adapter.numberProp("maxLength")
      : undefined,
    validationStatus: adapter.stringProp(
      "validationStatus",
      defaultProps.validationStatus,
    ) as React.ComponentProps<typeof AutoComplete>["validationStatus"],
    emptyListTemplate: templateChildren(adapter.node, "emptyListTemplate")
      ? adapter.renderTemplate("emptyListTemplate")
      : undefined,
    dropdownHeight: adapter.prop("dropdownHeight") as React.CSSProperties["height"],
    required: adapter.booleanProp("required", defaultProps.required),
    modal: adapter.booleanProp("modal"),
    multi: adapter.booleanProp("multi", defaultProps.multi),
    creatable: adapter.booleanProp("creatable", defaultProps.creatable),
    initiallyOpen: adapter.booleanProp("initiallyOpen", defaultProps.initiallyOpen),
    groupBy: adapter.stringProp("groupBy"),
    verboseValidationFeedback: Object.prototype.hasOwnProperty.call(
      adapter.props,
      "verboseValidationFeedback",
    )
      ? adapter.booleanProp("verboseValidationFeedback", true)
      : undefined,
    validationIconSuccess: adapter.stringProp("validationIconSuccess"),
    validationIconError: adapter.stringProp("validationIconError"),
    groupHeaderRenderer: templateChildren(adapter.node, "groupHeaderTemplate")
      ? (groupName) => renderAutoCompleteTemplate(adapter, "groupHeaderTemplate", {
          $group: groupName,
        })
      : undefined,
    ungroupedHeaderRenderer: templateChildren(adapter.node, "ungroupedHeaderTemplate")
      ? () => renderAutoCompleteTemplate(adapter, "ungroupedHeaderTemplate", {})
      : undefined,
    optionRenderer: templateChildren(adapter.node, "optionTemplate")
      ? (item, selectedValue, inTrigger) => renderAutoCompleteTemplate(adapter, "optionTemplate", {
          $item: item,
          $selectedValue: selectedValue,
          $inTrigger: inTrigger,
        })
      : undefined,
    classes: { [COMPONENT_PART_KEY]: adapter.className },
    className: rootAttrs.className as string | undefined,
    contentClassName: rootAttrs.className as string | undefined,
    style: {
      width: normalizeAutoCompleteRuntimeWidth(adapter.stringProp("width") ?? rootStyle?.width),
    },
    children: adapter.renderChildren(nonPropertyChildren(adapter.node.children)),
  };
}

function renderAutoCompleteTemplate(
  adapter: XmluiComponentAdapter,
  templateName: string,
  contextValues: Record<string, unknown>,
) {
  const template = templateChildren(adapter.node, templateName) ?? [];
  const templateScope = createRuntimeScope({
    store: adapter.scope.store,
    parent: adapter.scope,
    props: adapter.scope.props,
    contextValues,
    references: adapter.scope.references,
    slots: adapter.scope.slots,
    emitEvent: adapter.scope.emitEvent,
  });
  return adapter.context.renderChildren(template, templateScope, adapter.node.range.end);
}

function hasAutoCompleteValue(value: unknown): boolean {
  return Array.isArray(value)
    ? value.length > 0
    : value !== undefined && value !== null && value !== "";
}

Object.assign(AutoCompleteMd.defaultThemeVars ??= {}, {
  "backgroundColor-Input": "transparent",
  "borderRadius-Input": "$borderRadius",
  "textColor-Input": "$textColor-primary",
  "backgroundColor-Input--disabled": "$backgroundColor--disabled",
  "borderWidth-Input": "1px",
  "minHeight-Input": "2.5rem",
  "gap-adornment-Input": "$space-2",
  "borderStyle-Input": "solid",
  "borderColor-Input--disabled": "$borderColor--disabled",
  "textColor-Input--disabled": "$textColor--disabled",
  "borderColor-Input": "$borderColor-Input-default",
  "borderColor-Input--hover": "$borderColor-Input-default--hover",
  "borderColor-Input--error": "$borderColor-Input-default--error",
  "borderColor-Input--warning": "$borderColor-Input-default--warning",
  "borderColor-Input--success": "$borderColor-Input-default--success",
  "textColor-placeholder-Input": "$textColor-subtitle",
  "color-adornment-Input": "$textColor-subtitle",
  "outlineColor-Input--focus": "$outlineColor--focus",
  "outlineWidth-Input--focus": "$outlineWidth--focus",
  "outlineStyle-Input--focus": "$outlineStyle--focus",
  "outlineOffset-Input--focus": "$outlineOffset--focus",
  "backgroundColor-dropdown-item": "transparent",
  "backgroundColor-dropdown-item--hover": "hsl(204, 30.3%, 98%)",
  "backgroundColor-dropdown-item--active": "hsl(204, 30.3%, 95%)",
  [`backgroundColor-item-${COMP}--hover`]: "$backgroundColor-dropdown-item--hover",
  [`backgroundColor-item-${COMP}--active`]: "$backgroundColor-dropdown-item--active",
});

export const autoCompleteRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: AutoCompleteMd as ComponentMetadata,
  defaultPart: COMPONENT_PART_KEY,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs(COMPONENT_PART_KEY);
    const focusCombobox = (event: React.PointerEvent<HTMLDivElement>) => {
      const input = event.currentTarget.querySelector<HTMLInputElement>('input[role="combobox"]');
      input?.focus({ preventScroll: true });
    };
    return (
      <div {...rootAttrs} onPointerDownCapture={focusCombobox}>
        <RuntimeOptionClassContext.Provider value={adapter.className}>
          <RuntimeAutoCompleteShell adapter={adapter} {...runtimeAutoCompleteProps(adapter)} />
        </RuntimeOptionClassContext.Provider>
      </div>
    );
  },
});

function normalizeAutoCompleteRuntimeWidth(width: React.CSSProperties["width"]) {
  if (typeof width !== "string") {
    return width;
  }
  const trimmed = width.trim();
  return trimmed.endsWith("%") ? `${trimmed.slice(0, -1)}vw` : width;
}
