import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import type { ComponentMetadata } from "xmlui";
import styles from "./TableSelect.module.scss";
import { TableSelect, defaultProps } from "./TableSelectNative";

const COMP = "TableSelect";

export const TableSelectMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "`TableSelect` is a select component that shows a filterable table in its dropdown " +
    "instead of a flat option list. Clicking a row selects the value of the row's `valueKey` " +
    "column (defaults to the first column). Supports XMLUI form binding via `bindTo`.",
  props: {
    data: {
      description:
        "Array of row objects to display in the dropdown table. " +
        "Each object's keys map to column keys.",
    },
    columns: {
      description:
        "Optional array of column definitions (`{ key: string; label: string }[]`). " +
        "When omitted the columns are derived automatically from the keys of the first data row.",
    },
    valueKey: {
      description:
        "The key of the field whose value is used as the select value (stored / submitted). " +
        "Defaults to the first column's key.",
      valueType: "string",
    },
    labelKey: {
      description:
        "The key of the field whose value is displayed in the trigger button after a row is selected. " +
        "Defaults to the first column's key. Use this when `valueKey` points to an ID field but you " +
        "want to show a human-readable label (e.g. a name) in the trigger.",
      valueType: "string",
    },
    placeholder: {
      description: "Placeholder text shown in the trigger when no value is selected.",
      valueType: "string",
      defaultValue: defaultProps.placeholder,
    },
    initialValue: {
      description: "The initially selected value.",
      valueType: "string",
    },
    label: {
      description: "Label text displayed above the component (handled by the label behavior).",
      valueType: "string",
    },
  },
  events: {
    didChange: {
      description:
        "Fired when the user selects a row. Receives the value determined by `valueKey`.",
      type: "function",
    },
  },
  apis: {
    value: {
      description: "The currently selected value.",
      type: "string",
    },
    setValue: {
      description: "Programmatically set the selected value.",
      type: "function",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderColor-${COMP}`]: "$borderColor-Input-default",
    [`borderColor-${COMP}--hover`]: "$borderColor-Input-default--hover",
    [`borderColor-${COMP}--focus`]: "$borderColor-Input-default--hover",
    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset--focus",
    [`Input:backgroundColor-${COMP}`]: "$backgroundColor-Input-default",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`textColor-placeholder-${COMP}`]: "$textColor-subtitle",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`minHeight-${COMP}`]: "$space-7",

    [`backgroundColor-${COMP}-dropdown`]: "$color-surface-raised",
    [`borderColor-${COMP}-dropdown`]: "$borderColor",
    [`boxShadow-${COMP}-dropdown`]: "$boxShadow-md",

    [`borderColor-${COMP}-search`]: "$borderColor",
    [`backgroundColor-${COMP}-search`]: "transparent",

    [`backgroundColor-${COMP}-header`]: "$color-surface-raised",
    [`textColor-${COMP}-header`]: "$textColor-subtitle",

    [`backgroundColor-${COMP}-row--hover`]: "$backgroundColor-dropdown-item--hover",
    [`backgroundColor-${COMP}-row--selected`]: "$color-primary-100",
    [`textColor-${COMP}-row--selected`]: "$textColor-primary",
    [`borderColor-${COMP}-row`]: "$borderColor",
  },
});

export const tableSelectComponentRenderer = createComponentRenderer(
  COMP,
  TableSelectMd,
  ({ node, state, extractValue, lookupEventHandler, className, registerComponentApi, updateState }) => {
    const props = node.props as any;
    const isControlled = props?.value !== undefined;
    return (
      <TableSelect
        id={extractValue.asOptionalString(props?.id)}
        className={className}
        data={extractValue(props?.data) as Record<string, unknown>[] | undefined}
        columns={extractValue(props?.columns) as any}
        valueKey={extractValue.asOptionalString(props?.valueKey)}
        labelKey={extractValue.asOptionalString(props?.labelKey)}
        placeholder={extractValue.asOptionalString(props?.placeholder)}
        initialValue={extractValue.asOptionalString(props?.initialValue)}
        value={isControlled ? extractValue(props.value) : state?.value}
        onChange={lookupEventHandler("didChange")}
        updateState={isControlled ? undefined : updateState}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
