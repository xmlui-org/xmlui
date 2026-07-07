import styles from "../Toggle/Toggle.module.scss";

import React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { wrapComponent as wrapRuntimeComponent, nonPropertyChildren, templateChildren } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import {
  createMetadata,
  dAutoFocus,
  dClick,
  dComponent,
  dDidChange,
  dEnabled,
  dGotFocus,
  dIndeterminate,
  dInitialValue,
  dInternal,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../../components/metadata-helpers";
import { CheckboxNative as Toggle, CheckboxNative, type CheckboxApi } from "./CheckboxReact";
import { defaultProps as toggleDefaultProps } from "../Toggle/Toggle.defaults";

export const defaultProps = {
  ...toggleDefaultProps,
};

const COMP = "Checkbox";

export const CheckboxMd = createMetadata({
  status: "stable",
  description:
    "`Checkbox` allows users to make binary choices with a clickable box that shows " +
    "checked/unchecked states. It's essential for settings, preferences, multi-select " +
    "lists, and accepting terms or conditions.",
  parts: {
    label: {
      description: "The label displayed for the checkbox.",
    },
    input: {
      description: "The checkbox input area.",
    },
  },
  contextVars: {
    $checked: dInternal("Current checked state, injected into the input template."),
    $setChecked: dInternal("Setter for the checked state, injected into the input template."),
  },
  props: {
    indeterminate: dIndeterminate(toggleDefaultProps.indeterminate),
    required: dRequired(),
    initialValue: dInitialValue(toggleDefaultProps.initialValue, "boolean"),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(toggleDefaultProps.validationStatus),
    description: dInternal(
      `(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description ` +
        `of the ${COMP} besides its label.`,
    ),
    inputTemplate: dComponent("This property is used to define a custom checkbox input template"),
  },
  childrenAsTemplate: "inputTemplate",
  events: {
    click: dClick(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    value: {
      description: `This method returns the current value of the ${COMP}.`,
      signature: "get value(): boolean",
    },
    setValue: {
      description: `This method sets the current value of the ${COMP}.`,
      signature: "set value(value: boolean): void",
      parameters: {
        value: "The new value to set for the checkbox.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  compactInlineLabel: true,
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`borderColor-${COMP}`]: `$borderColor-Input-default`,
    [`borderColor-${COMP}--hover`]: `$borderColor-Input-default--hover`,
    [`outlineWidth-${COMP}`]: `$outlineWidth--focus`,
    [`outlineColor-${COMP}`]: `$outlineColor--focus`,
    [`outlineOffset-${COMP}`]: `$outlineOffset--focus`,
    [`outlineStyle-${COMP}`]: `$outlineStyle--focus`,
    [`borderColor-checked-${COMP}--error`]: `$borderColor-${COMP}--error`,
    [`backgroundColor-checked-${COMP}--error`]: `$borderColor-${COMP}--error`,
    [`borderColor-checked-${COMP}--warning`]: `$borderColor-${COMP}--warning`,
    [`backgroundColor-checked-${COMP}--warning`]: `$borderColor-${COMP}--warning`,
    [`borderColor-checked-${COMP}--success`]: `$borderColor-${COMP}--success`,
    [`backgroundColor-checked-${COMP}--success`]: `$borderColor-${COMP}--success`,
    [`backgroundColor-indicator-${COMP}`]: "$backgroundColor-primary",
    [`borderColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-${COMP}--disabled`]: "$color-surface-200",
  },
});

type ThemedToggleProps = React.ComponentPropsWithoutRef<typeof Toggle>;
export const ThemedToggle = React.forwardRef<HTMLInputElement, ThemedToggleProps>(
  function ThemedToggle({ className, ...props }: ThemedToggleProps, ref) {
    const themeClass = useComponentThemeClass(CheckboxMd);
    return (
      <Toggle
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const checkboxComponentRenderer = wrapComponent(
  COMP,
  Toggle,
  CheckboxMd,
  {
    booleans: ["indeterminate"],
    events: { click: "onClick", gotFocus: "onFocus", lostFocus: "onBlur", didChange: "onDidChange" },
    renderers: {
      inputTemplate: {
        reactProp: "inputRenderer",
        contextVars: (contextVars: Record<string, any>) => contextVars,
      },
    },
    exposeRegisterApi: true,
    customRender: (props, { node, extractValue }) => {
      // initialValue needs explicit boolean coercion (e.g. "" → false, "false" → false)
      props.initialValue = extractValue.asOptionalBoolean(
        node.props?.initialValue,
        defaultProps.initialValue,
      );
      return <Toggle {...props} />;
    },
  },
);

export const checkboxRenderer: XmluiBuiltInRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: CheckboxMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const inputTemplate = templateChildren(adapter.node, "inputTemplate") ?? nonPropertyChildren(adapter.node.children);
    return (
      <CheckboxNative
        {...adapter.rootAttrs("input")}
        ref={(api: CheckboxApi | null) => {
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        bindTo={adapter.stringProp("bindTo")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
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
