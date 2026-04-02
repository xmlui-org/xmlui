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
        "Defaults to the first column's key. The trigger always shows the first column's display " +
        "value of the matching row.",
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
    onChange: {
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
    [`borderColor-${COMP}`]: "$color-surface-200",
    [`borderColor-${COMP}--focus`]: "$color-primary-500",
    [`backgroundColor-${COMP}`]: "$color-surface-0",
    [`textColor-${COMP}`]: "$color-content-primary",
    [`textColor-placeholder-${COMP}`]: "$color-secondary-400",
    [`borderRadius-${COMP}`]: "6px",
    [`paddingHorizontal-${COMP}`]: "12px",
    [`paddingVertical-${COMP}`]: "8px",

    [`backgroundColor-${COMP}-dropdown`]: "$color-surface-0",
    [`borderColor-${COMP}-dropdown`]: "$color-primary-500",
    [`boxShadow-${COMP}-dropdown`]: "$boxShadow-lg",

    [`borderColor-${COMP}-search`]: "$color-surface-100",
    [`backgroundColor-${COMP}-search`]: "transparent",

    [`backgroundColor-${COMP}-header`]: "$color-surface-50",
    [`textColor-${COMP}-header`]: "$color-secondary-600",

    [`backgroundColor-${COMP}-row--hover`]: "$color-surface-50",
    [`backgroundColor-${COMP}-row--selected`]: "$color-primary-50",
    [`textColor-${COMP}-row--selected`]: "$color-primary-700",
    [`borderColor-${COMP}-row`]: "$color-surface-100",

    dark: {
      [`backgroundColor-${COMP}`]: "$color-surface-800",
      [`borderColor-${COMP}`]: "$color-surface-600",
      [`backgroundColor-${COMP}-dropdown`]: "$color-surface-800",
      [`borderColor-${COMP}-dropdown`]: "$color-primary-400",
      [`backgroundColor-${COMP}-header`]: "$color-surface-700",
      [`backgroundColor-${COMP}-row--hover`]: "$color-surface-700",
      [`backgroundColor-${COMP}-row--selected`]: "rgb(from $color-primary-500 r g b / 0.2)",
    },
  },
});

export const tableSelectComponentRenderer = createComponentRenderer(
  COMP,
  TableSelectMd,
  ({ node, extractValue, lookupEventHandler, className, registerComponentApi }) => {
    const props = node.props as any;
    return (
      <TableSelect
        id={extractValue.asOptionalString(props?.id)}
        className={className}
        data={extractValue(props?.data) as Record<string, unknown>[] | undefined}
        columns={extractValue(props?.columns) as any}
        valueKey={extractValue.asOptionalString(props?.valueKey)}
        placeholder={extractValue.asOptionalString(props?.placeholder)}
        initialValue={extractValue.asOptionalString(props?.initialValue)}
        onChange={lookupEventHandler("onChange")}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
