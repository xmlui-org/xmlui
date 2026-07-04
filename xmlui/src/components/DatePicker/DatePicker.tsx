import styles from "./DatePicker.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dEndIcon,
  dEndText,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dRequired,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import { defaultProps } from "./DatePicker.defaults";
import { DatePicker, type DatePickerProps } from "./DatePickerReact";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import React from "react";
import { useFormContext } from "../Form/FormContext";

const COMP = "DatePicker";

export const DatePickerMd = createMetadata({
  status: "stable",
  description:
    "`DatePicker` provides an interactive calendar interface for selecting single dates " +
    "or date ranges, with customizable formatting and validation options. It displays " +
    "a text input that opens a calendar popup when clicked, offering both keyboard and " +
    "mouse interaction.",
  props: {
    placeholder: dPlaceholder(),
    value: {
      description:
        "Controlled value. In single mode, a date string; in range mode, a " +
        "`{ from, to }` object.",
    },
    initialValue: dInitialValue(null, "string"),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    mode: {
      description: "The mode of the datepicker (single or range)",
      valueType: "string",
      defaultValue: defaultProps.mode,
      availableValues: ["single", "range"],
    },
    label: {
      description: "Optional label rendered above the input.",
      valueType: "string",
    },
    dateFormat: {
      description: "The format of the date displayed in the input field",
      valueType: "string",
      defaultValue: defaultProps.dateFormat,
      availableValues: [
        "MM/dd/yyyy",
        "MM-dd-yyyy",
        "yyyy/MM/dd",
        "yyyy-MM-dd",
        "dd/MM/yyyy",
        "dd-MM-yyyy",
        "yyyyMMdd",
        "MMddyyyy",
      ],
    },
    required: dRequired(),
    inline: {
      description:
        "If set to true, the calendar is always visible and its panel is rendered as " +
        "part of the layout. If false, the calendar is shown in a popup when the input " +
        "is focused or clicked.",
      valueType: "boolean",
      defaultValue: defaultProps.inline,
    },
    clearable: {
      description: "Set to `true` to show a clear button that resets the value. Hidden by default.",
      valueType: "boolean",
      defaultValue: defaultProps.clearable,
    },
    weekStartsOn: {
      description: "The first day of the week. 0 is Sunday, 1 is Monday, etc.",
      valueType: "number",
      defaultValue: defaultProps.weekStartsOn,
      availableValues: [
        { value: 0, description: "Sunday" },
        { value: 1, description: "Monday" },
        { value: 2, description: "Tuesday" },
        { value: 3, description: "Wednesday" },
        { value: 4, description: "Thursday" },
        { value: 5, description: "Friday" },
        { value: 6, description: "Saturday" },
      ],
    },
    showWeekNumber: {
      description: "Show week number cells in the day table.",
      valueType: "boolean",
      defaultValue: defaultProps.showWeekNumber,
    },
    showWeekNumbers: {
      description: "Alias for `showWeekNumber`.",
      valueType: "boolean",
      defaultValue: defaultProps.showWeekNumbers,
    },
    startDate: {
      description:
        "The earliest month to start the month navigation from (inclusive). " +
        "If not defined, the component allows any dates in the past. " +
        "Accepts the same date format as the `initialValue`. " +
        "Example: '2023-01-01' ensures the first month to select a date from is January 2023.",
      valueType: "string",
    },
    endDate: {
      description:
        "The latest month to start the month navigation from (inclusive). " +
        "If not defined, the component allows any future dates. " +
        "Accepts the same date format as the `initialValue`. " +
        "Example: '2023-12-31' ensures the last month to select a date from is December 2023.",
      valueType: "string",
    },
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
    width: {
      description: "CSS width for the picker root.",
      valueType: "string",
    },
    locale: {
      description: "BCP 47 locale used for calendar labels.",
      valueType: "string",
      defaultValue: defaultProps.locale,
    },
    timeZone: {
      description: "The time zone used for date calculations.",
      valueType: "string",
      defaultValue: defaultProps.timeZone,
    },
    numOfMonths: {
      description: "The number of months displayed at once.",
      valueType: "number",
      defaultValue: defaultProps.numOfMonths,
    },
    presets: {
      description:
        "Customizes the range presets (range mode only). Supplying a list also " +
        "turns the presets on. Accepts a comma-separated string or array of " +
        "built-in preset keys (e.g. `last7Days`, `thisMonth`), `{ value, label }` " +
        "objects to relabel a built-in, or `{ label, from, to }` objects for fully " +
        "custom date ranges (parsed with `dateFormat`).",
    },
    showPresets: {
      description:
        "Range presets are hidden by default. Set to `true` to show the built-in " +
        "presets (Last 7 days, Last 30 days, This month, Last month); set to " +
        "`false` to force them off even when a `presets` list is supplied.",
      valueType: "boolean",
      defaultValue: defaultProps.showPresets,
    },
    disabledDates: {
      description:
        "An optional array of dates that are to be disabled. Accepts a date string, " +
        "`{ from, to }`, `{ before }`, `{ after }`, `{ before, after }`, or " +
        "`{ dayOfWeek }` matchers (parsed with `dateFormat`).",
      valueType: "any",
    },
    confirmRangeSelection: {
      description:
        "In `range` mode, show a Cancel/Proceed footer so the user must explicitly " +
        "confirm the selected range before it is committed. When `false` (default), " +
        "the range auto-commits on the second click and the popup closes.",
      valueType: "boolean",
      defaultValue: defaultProps.confirmRangeSelection,
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in the input.",
      valueType: "boolean",
    },
    validationIconSuccess: {
      description: "Icon to display for the valid state when the concise summary is enabled.",
      valueType: "string",
    },
    validationIconError: {
      description: "Icon to display for the error state when the concise summary is enabled.",
      valueType: "string",
    },
    invalidMessages: {
      description: "The invalid messages to display in the concise validation summary.",
      valueType: "string[]",
    },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: {
      description: `Focus the ${COMP} component.`,
      signature: "focus(): void",
    },
    value: {
      description: `You can query the component's value. If no value is set, it will retrieve \`undefined\`.`,
      signature: "get value(): any",
    },
    setValue: {
      description: `This method sets the current value of the ${COMP}.`,
      signature: "setValue(value: string | { from?: string; to?: string }): void",
      parameters: {
        value: "The new value to set for the date picker.",
      },
    },
    getValue: {
      description: `Return the current value of the ${COMP}.`,
      signature: "getValue(): string | { from?: string; to?: string } | undefined",
    },
  },
  contextVars: {
    value: {
      description:
        "Current value. Single mode returns a string; range mode returns " + "`{ from, to }`.",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`boxShadow-menu-${COMP}`]: "$boxShadow-md",
    [`backgroundColor-menu-${COMP}`]: "$color-surface-50",
    [`borderColor-menu-${COMP}`]: "$borderColor",
    [`borderRadius-menu-${COMP}`]: "$borderRadius",
    [`backgroundColor-overlay-${COMP}`]: "$backgroundColor-overlay",
    [`backgroundColor-item-${COMP}--hover`]: "$color-surface-100",
    [`backgroundColor-item-${COMP}--active`]: "$color-surface-200",
    [`textColor-value-${COMP}`]: "$textColor-primary",
    [`borderColor-selectedItem-${COMP}`]: "$color-primary-300",
    // Day-cell modifiers — selected days, range middle, today, and disabled
    // days each get a distinct look matching the core DatePicker.
    [`backgroundColor-day-${COMP}--selected`]: "$color-primary-500",
    [`textColor-day-${COMP}--selected`]: "$color-surface-0",
    [`backgroundColor-day-${COMP}--rangeMiddle`]: "$color-primary-100",
    [`textColor-day-${COMP}--rangeMiddle`]: "$textColor-primary",
    [`backgroundColor-day-${COMP}--today`]: "transparent",
    [`textColor-day-${COMP}--today`]: "$textColor-primary",
    [`borderColor-day-${COMP}--today`]: "$color-secondary-300",
    [`borderWidth-day-${COMP}--today`]: "1px",
    [`borderStyle-day-${COMP}--today`]: "solid",
    [`backgroundColor-day-${COMP}--disabled`]: "transparent",
    [`textColor-day-${COMP}--disabled`]: "$color-secondary-300",
    [`textColor-weekday-${COMP}`]: "$color-secondary-300",
    [`paddingHorizontal-${COMP}`]: "$space-3",
    [`paddingVertical-${COMP}`]: "$space-2",
  },
});

// Emits the component's theme variables (themeVars + defaultThemeVars resolved
// against the active theme) onto a scoped class, then applies it to both the
// root and the calendar popup. Without this the `--xmlui-*-DatePicker`
// variables the SCSS references would never be defined. Mirrors the core
// DatePicker's `ThemedDatePicker` wrapper.
export function ThemedDatePicker({ className, ...rest }: DatePickerProps) {
  const themeClass = useComponentThemeClass(DatePickerMd);
  const combinedClassName = className ? `${themeClass} ${className}` : themeClass;
  return <DatePicker {...rest} className={combinedClassName} contentClassName={themeClass} />;
}

export const datePickerComponentRenderer = wrapComponent(COMP, ThemedDatePicker, DatePickerMd, {
  customRender: (
    _props,
    { node, extractValue, lookupEventHandler, updateState, registerComponentApi, classes },
  ) => {
    const props = (node.props ?? {}) as Record<string, any>;

    return (
      <ThemedDatePicker
        id={extractValue.asOptionalString(props.id)}
        value={extractValue(props.value)}
        initialValue={extractValue(props.initialValue)}
        mode={extractValue.asOptionalString(props.mode)}
        label={extractValue.asOptionalString(props.label)}
        placeholder={extractValue.asOptionalString(props.placeholder)}
        dateFormat={extractValue.asOptionalString(props.dateFormat)}
        enabled={extractValue.asOptionalBoolean(props.enabled, defaultProps.enabled)}
        readOnly={extractValue.asOptionalBoolean(props.readOnly)}
        required={extractValue.asOptionalBoolean(props.required)}
        autoFocus={extractValue.asOptionalBoolean(props.autoFocus)}
        inline={extractValue.asOptionalBoolean(props.inline)}
        clearable={extractValue.asOptionalBoolean(props.clearable, defaultProps.clearable)}
        validationStatus={
          extractValue.asOptionalString(props.validationStatus) as
            | "none"
            | "error"
            | "warning"
            | "valid"
            | undefined
        }
        weekStartsOn={extractValue(props.weekStartsOn)}
        showWeekNumber={extractValue.asOptionalBoolean(props.showWeekNumber)}
        showWeekNumbers={extractValue.asOptionalBoolean(props.showWeekNumbers)}
        startDate={extractValue(props.startDate)}
        endDate={extractValue(props.endDate)}
        startIcon={extractValue.asOptionalString(props.startIcon)}
        endIcon={extractValue.asOptionalString(props.endIcon)}
        startText={extractValue.asOptionalString(props.startText)}
        endText={extractValue.asOptionalString(props.endText)}
        width={extractValue.asSize(props.width) || undefined}
        locale={extractValue.asOptionalString(props.locale)}
        timeZone={extractValue.asOptionalString(props.timeZone)}
        numOfMonths={extractValue.asOptionalNumber(props.numOfMonths)}
        presets={extractValue(props.presets) as never}
        showPresets={extractValue.asOptionalBoolean(props.showPresets)}
        disabledDates={extractValue(props.disabledDates) as never}
        confirmRangeSelection={extractValue.asOptionalBoolean(props.confirmRangeSelection)}
        verboseValidationFeedback={extractValue.asOptionalBoolean(props.verboseValidationFeedback)}
        validationIconSuccess={extractValue.asOptionalString(props.validationIconSuccess)}
        validationIconError={extractValue.asOptionalString(props.validationIconError)}
        invalidMessages={extractValue(props.invalidMessages) as never}
        className={classes?.[COMPONENT_PART_KEY]}
        onDidChange={lookupEventHandler("didChange") as never}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
      />
    );
  },
});

const datePickerInputThemeAliases = {
  [`borderRadius-${COMP}`]: "$borderRadius",
  [`borderColor-${COMP}`]: "$color-surface-200",
  [`borderWidth-${COMP}`]: "1px",
  [`borderStyle-${COMP}`]: "solid",
  [`backgroundColor-${COMP}`]: "$backgroundColor",
  [`boxShadow-${COMP}`]: "none",
  [`textColor-${COMP}`]: "$textColor-primary",
  [`fontSize-${COMP}`]: "$fontSize-base",
  [`minHeight-${COMP}`]: "2.5rem",
  [`borderColor-${COMP}--hover`]: `$borderColor-${COMP}`,
  [`backgroundColor-${COMP}--hover`]: `$backgroundColor-${COMP}`,
  [`outlineWidth-${COMP}--focus`]: "2px",
  [`outlineColor-${COMP}--focus`]: "$color-primary-500",
  [`outlineStyle-${COMP}--focus`]: "solid",
  [`outlineOffset-${COMP}--focus`]: "0",
  [`textColor-placeholder-${COMP}`]: "$textColor-secondary",
  [`color-adornment-${COMP}`]: "$textColor-secondary",
  [`backgroundColor-${COMP}--disabled`]: "$backgroundColor",
  [`textColor-${COMP}--disabled`]: "$textColor--disabled",
  [`borderColor-${COMP}--disabled`]: "$borderColor--disabled",
  [`borderColor-${COMP}--error`]: "hsl(356, 100%, 48%)",
  [`borderColor-${COMP}--warning`]: "hsl(35, 100%, 42.8%)",
  [`borderColor-${COMP}--success`]: "hsl(129.5, 58.4%, 58.1%)",
  [`backgroundColor-overlay-${COMP}`]: "$backgroundColor-overlay",
  [`backgroundColor-item-${COMP}--active`]: "$color-surface-200",
  [`borderColor-selectedItem-${COMP}`]: "$color-secondary-300",
};

Object.assign(DatePickerMd.defaultThemeVars ??= {}, datePickerInputThemeAliases);

export const datePickerRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: DatePickerMd as ComponentMetadata,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <RuntimeDatePicker adapter={adapter} {...runtimeDatePickerProps(adapter)} />
  ),
});

function RuntimeDatePicker({
  adapter,
  onDidChange,
  onFocus,
  onBlur,
  className,
  ...props
}: DatePickerProps & { adapter: XmluiComponentAdapter }) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const themeClass = useComponentThemeClass(DatePickerMd);
  const rootAttrs = adapter.rootAttrs("input") as React.HTMLAttributes<HTMLDivElement>;
  const form = useFormContext();
  const registerFormItem = form?.registerItem;
  const bindTo = adapter.stringProp("bindTo");
  const required = adapter.booleanProp("required", defaultProps.required);
  const formValue = bindTo ? form?.getValue(bindTo) : undefined;
  const formError = bindTo ? form?.errors[bindTo] : undefined;
  const fieldIssue = bindTo ? form?.issues.find((issue) => issue.field === bindTo) : undefined;
  const validationMessage = formError ?? fieldIssue?.message;
  const effectiveValidationStatus = fieldIssue?.severity ??
    (formError
      ? "error"
      : required && (formValue ?? props.value)
        ? "valid"
        : props.validationStatus);
  const verboseValidationFeedback = props.verboseValidationFeedback ?? form?.verboseValidationFeedback ?? true;
  const label = decorateLabel(
    props.label,
    required,
    adapter.stringProp("requireLabelMode") ?? form?.itemRequireLabelMode,
  );

  React.useEffect(() => {
    if (!registerFormItem || !bindTo) {
      return;
    }
    return registerFormItem({
      name: bindTo,
      label: typeof props.label === "string" ? props.label : undefined,
      required,
    });
  }, [bindTo, props.label, registerFormItem, required]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    applyRuntimeRootAttrs(root, rootAttrs);
    const syncState = () => {
      root.setAttribute("data-state", root.hasAttribute("data-open") ? "open" : "closed");
    };
    syncState();
    const observer = new MutationObserver(syncState);
    observer.observe(root, { attributes: true, attributeFilter: ["data-open"] });
    return () => observer.disconnect();
  }, [rootAttrs]);

  return (
    <>
      <DatePicker
        {...props}
        value={formValue ?? props.value}
        label={label}
        required={required}
        validationStatus={effectiveValidationStatus}
        invalidMessages={validationMessage ? [validationMessage] : props.invalidMessages}
        ref={rootRef}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        contentClassName={themeClass}
        updateState={(state, options) => {
          const value = state.value;
          if (bindTo && !options?.initial) {
            form?.setValue(bindTo, value);
            void form?.validateField(bindTo, value);
          }
        }}
        registerComponentApi={(api) => {
          adapter.registerApi({
            ...api,
            get value() {
              const getValue = api.getValue;
              return typeof getValue === "function" ? getValue() : undefined;
            },
          });
        }}
        onDidChange={(value) => {
          onDidChange?.(value);
          if (bindTo) {
            form?.setValue(bindTo, value);
            void form?.validateField(bindTo, value);
          }
          void adapter.event("didChange")(value);
        }}
        onFocus={() => {
          onFocus?.();
          void adapter.event("gotFocus")();
        }}
        onBlur={() => {
          onBlur?.();
          void adapter.event("lostFocus")();
          if (bindTo) {
            void form?.validateField(bindTo);
          }
        }}
      />
      {validationMessage && verboseValidationFeedback ? (
        <div>{validationMessage}</div>
      ) : null}
    </>
  );
}

function runtimeDatePickerProps(adapter: XmluiComponentAdapter): DatePickerProps {
  return {
    id: adapter.stringProp("id"),
    value: adapter.prop("value"),
    initialValue: adapter.prop("initialValue"),
    mode: adapter.stringProp("mode", defaultProps.mode),
    label: adapter.stringProp("label"),
    placeholder: adapter.stringProp("placeholder"),
    dateFormat: adapter.stringProp("dateFormat", defaultProps.dateFormat),
    enabled: adapter.booleanProp("enabled", defaultProps.enabled),
    readOnly: adapter.booleanProp("readOnly", defaultProps.readOnly),
    required: adapter.booleanProp("required", defaultProps.required),
    autoFocus: adapter.booleanProp("autoFocus", defaultProps.autoFocus),
    inline: adapter.booleanProp("inline", defaultProps.inline),
    clearable: adapter.booleanProp("clearable", defaultProps.clearable),
    validationStatus: adapter.stringProp(
      "validationStatus",
      defaultProps.validationStatus,
    ) as DatePickerProps["validationStatus"],
    weekStartsOn: adapter.prop("weekStartsOn", defaultProps.weekStartsOn),
    showWeekNumber: adapter.booleanProp("showWeekNumber", defaultProps.showWeekNumber),
    showWeekNumbers: adapter.booleanProp("showWeekNumbers", defaultProps.showWeekNumbers),
    startDate: adapter.prop("startDate"),
    endDate: adapter.prop("endDate"),
    startIcon: adapter.stringProp("startIcon"),
    endIcon: adapter.stringProp("endIcon"),
    startText: adapter.stringProp("startText"),
    endText: adapter.stringProp("endText"),
    width: adapter.stringProp("width"),
    locale: adapter.stringProp("locale", defaultProps.locale),
    timeZone: adapter.stringProp("timeZone", defaultProps.timeZone),
    numOfMonths: adapter.prop("numOfMonths") as DatePickerProps["numOfMonths"],
    presets: normalizePresets(adapter.prop("presets")) as DatePickerProps["presets"],
    showPresets: Object.prototype.hasOwnProperty.call(adapter.props, "showPresets")
      ? adapter.booleanProp("showPresets", defaultProps.showPresets)
      : undefined,
    disabledDates: adapter.prop("disabledDates") as DatePickerProps["disabledDates"],
    confirmRangeSelection: adapter.booleanProp(
      "confirmRangeSelection",
      defaultProps.confirmRangeSelection,
    ),
    verboseValidationFeedback: Object.prototype.hasOwnProperty.call(
      adapter.props,
      "verboseValidationFeedback",
    )
      ? adapter.booleanProp("verboseValidationFeedback", true)
      : undefined,
    validationIconSuccess: adapter.stringProp("validationIconSuccess"),
    validationIconError: adapter.stringProp("validationIconError"),
    invalidMessages: adapter.prop("invalidMessages") as string[] | undefined,
  };
}

function decorateLabel(label: DatePickerProps["label"], required: boolean, requireLabelMode?: string) {
  if (typeof label !== "string" || !label) {
    return label;
  }
  const mode = requireLabelMode ?? "markRequired";
  if (required && (mode === "markRequired" || mode === "markBoth")) {
    return `${label} *`;
  }
  if (!required && (mode === "markOptional" || mode === "markBoth")) {
    return `${label} (Optional)`;
  }
  return label;
}

function normalizePresets(raw: unknown) {
  if (typeof raw !== "string") {
    return raw;
  }
  const trimmed = raw.trim();
  const expression = trimmed.startsWith("{") && trimmed.endsWith("}")
    ? trimmed.slice(1, -1).trim()
    : trimmed;
  if (expression.startsWith("[")) {
    try {
      return Function(`"use strict"; return (${expression});`)();
    } catch {
      // Fall through to the narrow parser below.
    }
  }
  if (!trimmed.startsWith("{[") || !trimmed.endsWith("]}")) {
    return raw;
  }
  const presets: Array<Record<string, string>> = [];
  const objectMatches = trimmed.matchAll(/\{([^{}]*)\}/g);
  for (const match of objectMatches) {
    const item: Record<string, string> = {};
    for (const prop of match[1].matchAll(/(\w+)\s*:\s*['"]([^'"]*)['"]/g)) {
      item[prop[1]] = prop[2];
    }
    if (Object.keys(item).length > 0) {
      presets.push(item);
    }
  }
  return presets.length > 0 ? presets : raw;
}

function applyRuntimeRootAttrs(
  root: HTMLDivElement,
  attrs: React.HTMLAttributes<HTMLDivElement>,
) {
  const dataAttrs = attrs as Record<string, unknown>;
  for (const [name, value] of Object.entries(dataAttrs)) {
    if (!name.startsWith("data-") && name !== "role" && name !== "aria-label") {
      continue;
    }
    if (value === undefined || value === null || value === false) {
      root.removeAttribute(name);
    } else {
      root.setAttribute(name, String(value));
    }
  }
}
