import React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import { defaultProps } from "./RatingInput.defaults";
import { RatingInput } from "./RatingInputReact";
import styles from "./RatingInput.module.scss";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";

const COMP = "RatingInput";

export const RatingInputMd = createMetadata({
  status: "experimental",
  description: "`RatingInput` is a star-based rating input control.",
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`textColor-placeholder-${COMP}`]: "$color-surface-500",
    [`fontSize-placeholder-${COMP}`]: "14px",
    [`color-star-${COMP}`]: "$color-surface-400",
    [`color-star-${COMP}--active`]: "$color-warn-500",
    [`fontSize-star-${COMP}`]: "18px",
    [`gap-${COMP}`]: "4px",
    [`outlineColor-${COMP}--error`]: "$color-danger-500",
    [`outlineWidth-${COMP}--error`]: "1px",
    [`outlineStyle-${COMP}--error`]: "solid",
    [`borderRadius-${COMP}--error`]: "$borderRadius",
    [`outlineColor-${COMP}--warning`]: "$color-warn-500",
    [`outlineWidth-${COMP}--warning`]: "1px",
    [`outlineStyle-${COMP}--warning`]: "solid",
    [`borderRadius-${COMP}--warning`]: "$borderRadius",
    [`outlineColor-${COMP}--valid`]: "$color-success-500",
    [`outlineWidth-${COMP}--valid`]: "1px",
    [`outlineStyle-${COMP}--valid`]: "solid",
    [`borderRadius-${COMP}--valid`]: "$borderRadius",
    [`opacity-${COMP}--disabled`]: "0.6",
    [`opacity-${COMP}--readOnly`]: "0.8",
  },
  parts: {
    input: {
      description: "The rating input area (star buttons container).",
    },
  },
  props: {
    placeholder: dPlaceholder(),
    initialValue: {
      ...dInitialValue(),
      valueType: "number",
      defaultValue: defaultProps.initialValue,
    },
    maxRating: {
      description: "Maximum number of stars to render.",
      isRequired: false,
      valueType: "number",
      defaultValue: defaultProps.maxRating,
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
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: {
      ...dEnabled(),
      defaultValue: defaultProps.enabled,
    },
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: defaultProps.validationStatus,
    },
    invalidMessages: {
      description: "The invalid messages to display for the input component.",
      valueType: "string[]",
    },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    value: {
      description: "The current rating value.",
      signature: "get value(): number | undefined",
    },
    setValue: {
      description: "Set the rating value.",
      signature: "setValue(value: number): void",
    },
    focus: {
      description: "Focus the rating input.",
      signature: "focus(): void",
    },
  },
});

export const ratingInputComponentRenderer = wrapComponent(
  COMP,
  RatingInput,
  RatingInputMd,
  {
    exposeRegisterApi: true,
    stateful: true,
    exclude: ["maxRating"],
    events: [],
    customRender(_props, {
      node,
      state,
      updateState,
      lookupEventHandler,
      extractValue,
      classes,
      registerComponentApi,
    }) {
      const props = (node.props ?? {}) as Record<string, unknown>;
      const rawMax = extractValue(props.maxRating);
      const maxRating =
        typeof rawMax === "number" && Number.isFinite(rawMax)
          ? rawMax
          : typeof rawMax === "string" && !Number.isNaN(parseFloat(rawMax))
            ? Number(rawMax)
            : defaultProps.maxRating;

      return (
        <RatingInput
          classes={classes}
          value={state?.value}
          updateState={updateState}
          initialValue={extractValue.asOptionalNumber(props.initialValue)}
          maxRating={maxRating}
          autoFocus={extractValue.asOptionalBoolean(props.autoFocus)}
          readOnly={extractValue.asOptionalBoolean(props.readOnly)}
          required={extractValue.asOptionalBoolean(props.required)}
          verboseValidationFeedback={extractValue.asOptionalBoolean(props.verboseValidationFeedback)}
          validationIconSuccess={extractValue.asOptionalString(props.validationIconSuccess)}
          validationIconError={extractValue.asOptionalString(props.validationIconError)}
          enabled={extractValue.asOptionalBoolean(props.enabled)}
          placeholder={extractValue.asOptionalString(props.placeholder)}
          validationStatus={extractValue(props.validationStatus)}
          invalidMessages={extractValue(props.invalidMessages)}
          onDidChange={lookupEventHandler("didChange")}
          onFocus={lookupEventHandler("gotFocus")}
          onBlur={lookupEventHandler("lostFocus")}
          registerComponentApi={registerComponentApi}
        />
      );
    },
  },
);

type RuntimeRatingInputProps = React.ComponentProps<typeof RatingInput> & {
  adapter: XmluiComponentAdapter;
};

function RuntimeRatingInputShell({
  adapter,
  value,
  initialValue,
  onDidChange,
  onFocus,
  onBlur,
  ...props
}: RuntimeRatingInputProps) {
  const controlledValue = numberValue(value);
  const initial = numberValue(initialValue);
  const [localValue, setLocalValue] = React.useState<number | undefined>(controlledValue ?? initial);

  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  const updateState = React.useCallback((state: Record<string, unknown>) => {
    const nextValue = numberValue(state.value);
    setLocalValue(nextValue);
    adapter.registerApi({ value: nextValue });
  }, [adapter]);

  return (
    <RatingInput
      {...props}
      value={controlledValue ?? localValue}
      initialValue={initial}
      updateState={updateState}
      registerComponentApi={adapter.registerApi}
      onDidChange={(nextValue) => {
        setLocalValue(nextValue);
        onDidChange?.(nextValue);
        void adapter.event("didChange")(nextValue);
      }}
      onFocus={() => {
        onFocus?.();
        void adapter.event("gotFocus")();
      }}
      onBlur={() => {
        onBlur?.();
        void adapter.event("lostFocus")();
      }}
    />
  );
}

function runtimeRatingInputProps(adapter: XmluiComponentAdapter) {
  const rootAttrs = adapter.rootAttrs("input") as React.HTMLAttributes<HTMLDivElement>;
  return {
    ...rootAttrs,
    id: adapter.stringProp("id"),
    value: adapter.prop("value"),
    initialValue: adapter.prop("initialValue", defaultProps.initialValue),
    maxRating: adapter.numberProp("maxRating", defaultProps.maxRating),
    placeholder: adapter.stringProp("placeholder"),
    enabled: adapter.booleanProp("enabled", defaultProps.enabled),
    readOnly: adapter.booleanProp("readOnly", defaultProps.readOnly),
    required: adapter.booleanProp("required", false),
    autoFocus: adapter.booleanProp("autoFocus", false),
    validationStatus: adapter.stringProp("validationStatus", defaultProps.validationStatus) as React.ComponentProps<typeof RatingInput>["validationStatus"],
    invalidMessages: adapter.prop("invalidMessages") as string[] | undefined,
    verboseValidationFeedback: Object.prototype.hasOwnProperty.call(adapter.props, "verboseValidationFeedback")
      ? adapter.booleanProp("verboseValidationFeedback", true)
      : undefined,
    validationIconSuccess: adapter.stringProp("validationIconSuccess"),
    validationIconError: adapter.stringProp("validationIconError"),
    classes: { [COMPONENT_PART_KEY]: adapter.className },
  };
}

function numberValue(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

Object.assign(RatingInputMd, {
  defaultPart: "input",
} satisfies Partial<ComponentMetadata>);

export const ratingInputRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: RatingInputMd,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <RuntimeRatingInputShell adapter={adapter} {...runtimeRatingInputProps(adapter)} />
  ),
});
