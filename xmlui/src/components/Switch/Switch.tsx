import styles from "../Toggle/Toggle.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import {
  createMetadata,
  dAutoFocus,
  dClick,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dInternal,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import { SwitchNative as Toggle, SwitchNative, type SwitchApi } from "./SwitchReact";
import { defaultProps } from "../Toggle/Toggle.defaults";

const COMP = "Switch";

export const SwitchMd = createMetadata({
  status: "stable",
  compactInlineLabel: true,
  description: "`Switch` enables users to toggle between two states: on and off.",
  parts: {
    label: {
      description: "The label displayed for the switch.",
    },
    input: {
      description: "The switch input area.",
    },
  },
  props: {
    required: dRequired(),
    initialValue: {
      ...dInitialValue(defaultProps.initialValue),
      valueType: "boolean",
    },
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    description: dInternal(
      `(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description ` +
        `of the ${COMP} besides its label.`,
    ),
  },
  events: {
    click: dClick(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    value: {
      description:
        `This property holds the current value of the ${COMP}, which can be either ` +
        `"true" (on) or "false" (off).`,
      signature: "get value():boolean",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: boolean): void",
      parameters: {
        value: "The new value to set. Can be either true (on) or false (off).",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`borderColor-${COMP}`]: `$borderColor-Input-default`,
    [`borderWidth-${COMP}`]: "1px",
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
    [`backgroundColor-${COMP}`]: "$color-surface-0",
    [`backgroundColor-indicator-${COMP}`]: "$color-surface-400",
    [`backgroundColor-${COMP}-indicator--disabled`]: "$backgroundColor-primary",
    [`backgroundColor-indicator-checked-${COMP}`]: "$backgroundColor-primary",
    [`borderColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-${COMP}--disabled`]: "$color-surface-200",

    dark: {
      [`backgroundColor-indicator-${COMP}`]: "$color-surface-500",
    },
  },
});

export const switchComponentRenderer = wrapComponent(
  COMP,
  Toggle,
  SwitchMd,
  {
    exposeRegisterApi: true,
    stateful: true,
    events: {},
    customRender(_props, {
      node,
      extractValue,
      classes,
      updateState,
      state,
      lookupEventHandler,
      registerComponentApi,
    }) {
      return (
        <Toggle
          enabled={extractValue.asOptionalBoolean(node.props.enabled)}
          classes={classes}
          initialValue={extractValue.asOptionalBoolean(
            node.props.initialValue,
            defaultProps.initialValue,
          )}
          value={state?.value}
          readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
          validationStatus={extractValue(node.props.validationStatus)}
          updateState={updateState}
          autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
          onClick={lookupEventHandler("click")}
          onDidChange={lookupEventHandler("didChange")}
          onFocus={lookupEventHandler("gotFocus")}
          onBlur={lookupEventHandler("lostFocus")}
          required={extractValue.asOptionalBoolean(node.props.required)}
          variant="switch"
          registerComponentApi={registerComponentApi}
        />
      );
    },
  },
);

export const switchRenderer: XmluiBuiltInRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: SwitchMd,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <SwitchNative
      {...adapter.rootAttrs("input")}
      ref={(api: SwitchApi | null) => {
        if (api) {
          adapter.registerApi(api as unknown as Record<string, unknown>);
        }
      }}
      id={adapter.stringProp("id")}
      bindTo={adapter.stringProp("bindTo")}
      value={adapter.prop("value")}
      initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
      label={adapter.prop("label")}
      labelPosition={adapter.stringProp("labelPosition") as any}
      labelBreak={adapter.booleanProp("labelBreak", false)}
      labelWidth={adapter.prop("labelWidth") as any}
      requireLabelMode={adapter.stringProp("requireLabelMode")}
      direction={adapter.stringProp("direction")}
      enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
      readOnly={adapter.booleanProp("readOnly", false)}
      required={adapter.booleanProp("required", false)}
      autoFocus={adapter.booleanProp("autoFocus", false)}
      validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
      variant={adapter.stringProp("variant")}
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
  ),
});
