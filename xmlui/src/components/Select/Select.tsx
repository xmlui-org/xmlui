import styles from "./Select.module.scss";

import React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import {
  dPlaceholder,
  dInitialValue,
  dAutoFocus,
  dRequired,
  dReadonly,
  dEnabled,
  dValidationStatus,
  dDidChange,
  dGotFocus,
  dLostFocus,
  dMulti,
  dComponent,
  createMetadata,
} from "../metadata-helpers";
import { MemoizedItem } from "../container-helpers";
import { defaultProps } from "./Select.defaults";
import { Select } from "./SelectReact";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { createRuntimeScope } from "../../runtime/state";
import { nonPropertyChildren, templateChildren, wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { useFormContext } from "../Form/FormContext";
import { RuntimeOptionClassContext } from "../Option/Option";

const COMP = "Select";

export const SelectMd = createMetadata({
  status: "stable",
  description:
    "`Select` provides a dropdown interface for choosing from a list of options, " +
    "supporting both single and multiple selection modes. It offers extensive " +
    "customization capabilities including search functionality, custom templates, " +
    "and comprehensive form integration.",
  optimization: {
    isImplicitContainerByDefault: true,
  },
  parts: {
    clearButton: {
      description: "The button to clear the selected value(s).",
    },
    item: {
      description: "Each option item within the Select component.",
    },
    menu: {
      description: "The dropdown menu within the Select component.",
    },
  },
  props: {
    placeholder: {
      ...dPlaceholder(),
      defaultValue: defaultProps.placeholder,
    },
    initialValue: {
      ...dInitialValue(),
      valueType: "any",
    },
    value: {
      description: "This property sets the current value of the component.",
      valueType: "any",
      isInternal: true, //TODO illesg temp
    },
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
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: defaultProps.validationStatus,
    },
    variant: {
      description:
        "Controls the visual border treatment. `outlined` matches the border color of an outlined Button, " +
        "so that a Select can be visually composed next to one. Only the border color (and its hover/focus " +
        "states) is affected; padding, background, and typography are unchanged.",
      availableValues: [
        { value: "default", description: "Standard input border using the surface color." },
        {
          value: "outlined",
          description:
            "Accent border using the shared `borderColor-outlined` token, matching outlined Buttons.",
        },
      ],
      valueType: "string",
      defaultValue: defaultProps.variant,
    },
    data: {
      description:
        "The data array to populate the option list from. When provided, `Option` children are not needed — " +
        "the component builds options from this array using `valueField` and `labelField`. " +
        "This is the most efficient approach for large lists because the options are derived in JavaScript " +
        "and re-evaluated only when the data reference changes, not on every unrelated state update.",
      valueType: "any",
    },
    valueField: {
      description:
        'The property name of each data item to use as the option value when `data` is provided. Defaults to `"value"`.',
      valueType: "string",
      defaultValue: "value",
    },
    labelField: {
      description:
        'The property name of each data item to use as the option label when `data` is provided. Defaults to `"label"`.',
      valueType: "string",
      defaultValue: "label",
    },
    optionLabelTemplate: dComponent(
      `This property allows replacing the default template to display an option in the dropdown list.`,
    ),
    optionTemplate: dComponent(
      `This property allows replacing the default template to display an option in the dropdown list.`,
    ),
    valueTemplate: dComponent(
      `This property allows replacing the default template to display a selected value. ` +
        `It works in both single-select and multi-select modes (\`multiSelect\` is \`true\`).`,
    ),
    dropdownHeight: {
      description:
        "This property sets the height of the dropdown list. If not set, the height is determined automatically.",
      valueType: "length",
    },
    scrollIndicators: {
      description:
        "This property controls whether scroll indicator arrows are displayed at the top and bottom of the dropdown list when the content overflows.",
      valueType: "boolean",
      defaultValue: true,
    },
    emptyListTemplate: dComponent(
      `This optional property provides the ability to customize what is displayed when the ` +
        `list of options is empty.`,
    ),
    multiSelect: {
      ...dMulti(),
      defaultValue: defaultProps.multiSelect,
    },
    searchable: {
      description: `This property enables the search functionality in the dropdown list.`,
      valueType: "boolean",
      defaultValue: defaultProps.searchable,
    },
    inProgress: {
      description: `This property indicates whether the component is in progress. It can be used to show a loading message.`,
      valueType: "boolean",
      defaultValue: defaultProps.inProgress,
    },
    inProgressNotificationMessage: {
      description: `This property indicates the message to display when the component is in progress.`,
      valueType: "string",
      defaultValue: defaultProps.inProgressNotificationMessage,
    },
    clearable: {
      description: `This property enables a clear button that allows the user to clear the selected value(s).`,
      valueType: "boolean",
      defaultValue: defaultProps.clearable,
    },
    modal: {
      isInternal: true,
      description: "internal radix modal prop",
      valueType: "boolean",
    },
    groupBy: {
      description:
        "This property sets which attribute should be used to group the available options. " +
        "No grouping is done if omitted. Use it with the \`category\` attribute on \`Options\` to " +
        "define groups. If no options belong to a group, that group will not be shown.",
      valueType: "string",
    },
    groupHeaderTemplate: {
      description:
        `Enables the customization of how option groups are displayed in the dropdown. ` +
        `You can use the \`$group\` context variable to access the group name.`,
      valueType: "ComponentDef",
    },
    ungroupedHeaderTemplate: {
      description:
        `Enables the customization of how the ungrouped options header is displayed in the dropdown. ` +
        `If not provided, ungrouped options will not have a header.`,
      valueType: "ComponentDef",
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in input components.",
      valueType: "boolean",
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      valueType: "icon",
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      valueType: "icon",
    },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: `This method focuses the \`${COMP}\` component. You can use it to programmatically focus the component.`,
      signature: "focus(): void",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: string | string[] | undefined): void",
      parameters: {
        value:
          "The new value to set. Can be a single value or an array of values for multi-select.",
      },
    },
    value: {
      description: `This API retrieves the current value of the \`${COMP}\`. You can use it to get the value programmatically.`,
      signature: "get value(): string | string[] | undefined",
    },
    reset: {
      description: `This method resets the component to its initial value, or clears the selection if no initial value was provided.`,
      signature: "reset(): void",
    },
  },
  contextVars: {
    $item: {
      description: "Represents the current option's data (label and value properties)",
    },
    $itemContext: {
      description: "Provides the `removeItem()` method for multi-select scenarios",
    },
    $group: {
      description: "Group name when using `groupBy` (available in group header templates)",
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
    [`minHeight-${COMP}`]: "2.5rem",
    [`minHeight-item-${COMP}`]: "$space-7",
    [`minWidth-${COMP}`]: "$space-16",

    // --- `variant="outlined"` overrides. Only border color is rebound, so the input keeps
    // its standard background, padding and typography.
    [`borderColor-${COMP}--outlined`]: "$borderColor-outlined",
    [`borderColor-${COMP}--outlined--hover`]: "$borderColor-outlined--hover",
    [`borderColor-${COMP}--outlined--focus`]: "$borderColor-outlined--focus",
  },
});

type ThemedSelectProps = React.ComponentProps<typeof Select> & { className?: string };
export const ThemedSelect = React.forwardRef<HTMLDivElement, ThemedSelectProps>(
  function ThemedSelect({ className, ...props }: ThemedSelectProps, ref) {
    const themeClass = useComponentThemeClass(SelectMd);
    const combinedClassName = `${themeClass}${className ? ` ${className}` : ""}`;
    return (
      <Select
        {...props}
        className={combinedClassName}
        contentClassName={combinedClassName}
        ref={ref}
      />
    );
  },
);

export const selectComponentRenderer = wrapComponent(COMP, Select, SelectMd, {
  exposeRegisterApi: true,
  stateful: true,
  exclude: [
    "multiSelect",
    "searchable",
    "clearable",
    "value",
    "initialValue",
    "inProgress",
    "inProgressNotificationMessage",
    "readOnly",
    "autoFocus",
    "enabled",
    "placeholder",
    "validationStatus",
    "emptyListTemplate",
    "dropdownHeight",
    "scrollIndicators",
    "required",
    "modal",
    "groupBy",
    "groupHeaderTemplate",
    "ungroupedHeaderTemplate",
    "valueTemplate",
    "optionTemplate",
    "optionLabelTemplate",
    "verboseValidationFeedback",
    "validationIconSuccess",
    "validationIconError",
    "data",
    "valueField",
    "labelField",
  ],
  strings: ["variant"],
  events: [],
  customRender(
    _props,
    {
      node,
      state,
      updateState,
      extractValue,
      renderChild,
      lookupEventHandler,
      classes,
      registerComponentApi,
    },
  ) {
    const multiSelect = extractValue.asOptionalBoolean(node.props.multiSelect);
    const searchable = extractValue.asOptionalBoolean(node.props.searchable);
    const clearable = extractValue.asOptionalBoolean(node.props.clearable);
    const data = extractValue(node.props.data);
    const valueField = extractValue.asOptionalString(node.props.valueField);
    const labelField = extractValue.asOptionalString(node.props.labelField);

    // When data is provided, children are ignored — options are derived in JS.
    const hasData = data != null;

    const isControlled = node.props.value !== undefined;
    return (
      <Select
        aria-label={_props["aria-label"]}
        multiSelect={multiSelect}
        classes={classes}
        contentClassName={classes?.[COMPONENT_PART_KEY]}
        inProgress={extractValue.asOptionalBoolean(node.props.inProgress)}
        inProgressNotificationMessage={extractValue.asOptionalString(
          node.props.inProgressNotificationMessage,
        )}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        updateState={isControlled ? undefined : updateState}
        searchable={searchable}
        clearable={clearable}
        initialValue={extractValue(node.props.initialValue)}
        value={isControlled ? extractValue(node.props.value) : state?.value}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        validationStatus={extractValue(node.props.validationStatus)}
        variant={extractValue.asOptionalString(node.props.variant) as any}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        emptyListTemplate={renderChild(node.props.emptyListTemplate)}
        dropdownHeight={extractValue(node.props.dropdownHeight)}
        scrollIndicators={extractValue.asOptionalBoolean(node.props.scrollIndicators)}
        required={extractValue.asOptionalBoolean(node.props.required)}
        modal={extractValue.asOptionalBoolean(node.props.modal)}
        groupBy={extractValue(node.props.groupBy)}
        verboseValidationFeedback={extractValue.asOptionalBoolean(
          node.props.verboseValidationFeedback,
        )}
        validationIconSuccess={extractValue.asOptionalString(node.props.validationIconSuccess)}
        validationIconError={extractValue.asOptionalString(node.props.validationIconError)}
        data={data}
        valueField={valueField}
        labelField={labelField}
        groupHeaderRenderer={
          node.props.groupHeaderTemplate
            ? (contextVars) => {
                return (
                  <MemoizedItem
                    contextVars={contextVars}
                    node={node.props.groupHeaderTemplate}
                    renderChild={renderChild}
                  />
                );
              }
            : undefined
        }
        ungroupedHeaderRenderer={
          node.props.ungroupedHeaderTemplate
            ? () => {
                return (
                  <MemoizedItem
                    contextVars={{}}
                    node={node.props.ungroupedHeaderTemplate}
                    renderChild={renderChild}
                  />
                );
              }
            : undefined
        }
        valueRenderer={
          node.props.valueTemplate
            ? (item, removeItem) => {
                return (
                  <MemoizedItem
                    contextVars={{
                      $item: item,
                      $itemContext: { removeItem },
                    }}
                    node={node.props.valueTemplate}
                    renderChild={renderChild}
                  />
                );
              }
            : undefined
        }
        optionRenderer={
          node.props.optionTemplate
            ? (item, val, inTrigger) => {
                return (
                  <MemoizedItem
                    node={node.props.optionTemplate}
                    contextVars={{
                      $item: item,
                      $selectedValue: val,
                      $inTrigger: inTrigger,
                    }}
                    renderChild={renderChild}
                  />
                );
              }
            : undefined
        }
      >
        {!hasData && renderChild(node.children)}
      </Select>
    );
  },
});

type RuntimeSelectProps = React.ComponentProps<typeof Select> & {
  adapter: XmluiComponentAdapter;
  bindTo?: string;
};

function RuntimeSelectShell({
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
}: RuntimeSelectProps) {
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
    : required && hasSelectValue(localValue)
      ? "valid"
      : validationStatus;
  const effectiveInvalidMessages = formError ? formError.split("\n") : invalidMessages;
  const effectiveVerboseValidationFeedback =
    verboseValidationFeedback ?? form?.verboseValidationFeedback ?? true;

  const renderedSelect = (
    <Select
      {...props}
      value={controlledValue !== undefined ? controlledValue : localValue}
      initialValue={initialValue}
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
      onFocus={() => {
        void adapter.event("gotFocus")();
      }}
      onBlur={() => {
        void adapter.event("lostFocus")();
      }}
    />
  );

  if (formError && effectiveVerboseValidationFeedback) {
    return (
      <>
        {renderedSelect}
        <div data-validation-display-severity="error">{formError}</div>
      </>
    );
  }

  return renderedSelect;
}

function runtimeSelectProps(adapter: XmluiComponentAdapter): RuntimeSelectProps {
  const rootAttrs = adapter.rootAttrs(COMPONENT_PART_KEY) as React.HTMLAttributes<HTMLDivElement>;
  const rootStyle = rootAttrs.style as React.CSSProperties | undefined;
  const authoredWidth = adapter.stringProp("width");
  const runtimeWidth = normalizeSelectRuntimeWidth(authoredWidth ?? rootStyle?.width);
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
    ...safeRootAttrs
  } = rootAttrs as React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>;
  const data = adapter.prop("data");
  const hasData = data !== undefined && data !== null;
  return {
    ...safeRootAttrs,
    adapter,
    id: adapter.stringProp("id"),
    bindTo: adapter.stringProp("bindTo"),
    multiSelect: Object.prototype.hasOwnProperty.call(adapter.props, "multiSelect")
      ? adapter.booleanProp("multiSelect", defaultProps.multiSelect)
      : adapter.booleanProp("multmultiSelect", defaultProps.multiSelect),
    searchable: adapter.booleanProp("searchable", defaultProps.searchable),
    clearable: adapter.booleanProp("clearable", defaultProps.clearable),
    inProgress: adapter.booleanProp("inProgress", defaultProps.inProgress),
    inProgressNotificationMessage: adapter.stringProp(
      "inProgressNotificationMessage",
      defaultProps.inProgressNotificationMessage,
    ),
    readOnly: adapter.booleanProp("readOnly", defaultProps.readOnly),
    value: adapter.prop("value"),
    initialValue: adapter.prop("initialValue"),
    autoFocus: adapter.booleanProp("autoFocus", defaultProps.autoFocus),
    enabled: adapter.booleanProp("enabled", defaultProps.enabled),
    placeholder: adapter.stringProp("placeholder", defaultProps.placeholder),
    validationStatus: adapter.stringProp(
      "validationStatus",
      defaultProps.validationStatus,
    ) as React.ComponentProps<typeof Select>["validationStatus"],
    variant: adapter.stringProp("variant", defaultProps.variant) as React.ComponentProps<typeof Select>["variant"],
    emptyListTemplate: templateChildren(adapter.node, "emptyListTemplate")
      ? adapter.renderTemplate("emptyListTemplate")
      : undefined,
    dropdownHeight: adapter.prop("dropdownHeight") as React.CSSProperties["height"],
    scrollIndicators: adapter.booleanProp("scrollIndicators", true),
    required: adapter.booleanProp("required", defaultProps.required),
    modal: adapter.booleanProp("modal", defaultProps.modal),
    groupBy: adapter.stringProp("groupBy"),
    verboseValidationFeedback: Object.prototype.hasOwnProperty.call(
      adapter.props,
      "verboseValidationFeedback",
    )
      ? adapter.booleanProp("verboseValidationFeedback", true)
      : undefined,
    validationIconSuccess: adapter.stringProp("validationIconSuccess"),
    validationIconError: adapter.stringProp("validationIconError"),
    data: hasData ? data as any[] : undefined,
    valueField: adapter.stringProp("valueField"),
    labelField: adapter.stringProp("labelField"),
    groupHeaderRenderer: templateChildren(adapter.node, "groupHeaderTemplate")
      ? (contextVars) => renderSelectTemplate(adapter, "groupHeaderTemplate", contextVars)
      : undefined,
    ungroupedHeaderRenderer: templateChildren(adapter.node, "ungroupedHeaderTemplate")
      ? () => renderSelectTemplate(adapter, "ungroupedHeaderTemplate", {})
      : undefined,
    valueRenderer: templateChildren(adapter.node, "valueTemplate")
      ? (item, removeItem) => renderSelectTemplate(adapter, "valueTemplate", {
          $item: item,
          $itemContext: { removeItem },
        })
      : undefined,
    optionRenderer: templateChildren(adapter.node, "optionTemplate")
      ? (item, selectedValue, inTrigger) => renderSelectTemplate(adapter, "optionTemplate", {
          $item: item,
          $selectedValue: selectedValue,
          $inTrigger: inTrigger,
        })
      : undefined,
    classes: { [COMPONENT_PART_KEY]: adapter.className },
    className: rootAttrs.className as string | undefined,
    contentClassName: rootAttrs.className as string | undefined,
    style: { ...rootStyle, width: runtimeWidth ?? "100%" },
    "aria-label": adapter.stringProp("aria-label"),
    children: hasData ? undefined : adapter.renderChildren(nonPropertyChildren(adapter.node.children)),
  };
}

function normalizeSelectRuntimeWidth(width: React.CSSProperties["width"]) {
  if (typeof width !== "string") {
    return width;
  }
  const trimmed = width.trim();
  return trimmed.endsWith("%") ? `${trimmed.slice(0, -1)}vw` : width;
}

function renderSelectTemplate(
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

function hasSelectValue(value: unknown): boolean {
  return Array.isArray(value)
    ? value.length > 0
    : value !== undefined && value !== null && value !== "";
}

Object.assign(SelectMd.defaultThemeVars ??= {}, {
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

Object.assign(SelectMd.props ??= {}, {
  multmultiSelect: {
    description: "Compatibility alias for a historical copied Select test fixture typo.",
    valueType: "boolean",
    isInternal: true,
  },
});

delete SelectMd.props?.label;
delete SelectMd.props?.labelPosition;
delete SelectMd.props?.labelWidth;
delete SelectMd.props?.labelBreak;

export const selectRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: SelectMd as ComponentMetadata,
  defaultPart: COMPONENT_PART_KEY,
  renderer: ({ adapter }) => (
    <RuntimeOptionClassContext.Provider value={adapter.className}>
      <RuntimeSelectShell adapter={adapter} {...runtimeSelectProps(adapter)} />
    </RuntimeOptionClassContext.Provider>
  ),
});
