import { SelectRender } from "./SelectRender";
import styles from "./Select.module.scss";
import {
  wrapCompound,
  createMetadata,
  d,
  dDidChange,
  dEnabled,
  dInitialValue,
  dPlaceholder,
  parseScssVar,
} from "xmlui";

const COMP = "Select";

export const SelectMd = createMetadata({
  status: "experimental",
  description:
    "`Select` wraps the ark-ui Select primitive, providing a fully accessible, " +
    "headless dropdown select with XMLUI theming integration. " +
    "It supports single and multi-select, custom items, and keyboard navigation.",
  props: {
    initialValue: dInitialValue(),
    items: {
      description:
        "The list of selectable options. Each item can be a plain string " +
        "or an object with `value`, `label`, and optional `disabled` fields.",
      valueType: "any",
    },
    placeholder: {
      ...dPlaceholder(),
      defaultValue: "Select an option",
    },
    enabled: dEnabled(),
    multiple: {
      description: "When `true`, allows selecting multiple items at once.",
      valueType: "boolean",
      defaultValue: false,
    },
    clearable: {
      description:
        "When `true`, a clear button appears next to the trigger when a value is selected.",
      valueType: "boolean",
      defaultValue: false,
    },
  },
  events: {
    didChange: dDidChange(COMP),
  },
  apis: {
    value: {
      description:
        "Returns the current selection. A single string for single-select, " +
        "or a `string[]` for multi-select.",
      signature: "get value(): string | string[] | undefined",
    },
    setValue: {
      description: "Sets the selection programmatically.",
      signature: "setValue(value: string | string[]): void",
      parameters: {
        value: "The value(s) to select.",
      },
    },
    clear: {
      description: "Clears the current selection.",
      signature: "clear(): void",
    },
    focus: {
      description: "Sets focus on the select trigger.",
      signature: "focus(): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // Trigger defaults
    [`backgroundColor-${COMP}`]: "$color-surface-50",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`borderColor-${COMP}`]: "$color-surface-300",
    [`borderWidth-${COMP}`]: "1px",
    [`borderStyle-${COMP}`]: "solid",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`paddingHorizontal-${COMP}`]: "$space-3",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`fontSize-${COMP}`]: "$fontSize-md",
    [`minHeight-${COMP}`]: "36px",

    // Trigger hover / focus / disabled
    [`backgroundColor-${COMP}--hover`]: "$color-surface-100",
    [`borderColor-${COMP}--hover`]: "$color-surface-400",
    [`backgroundColor-${COMP}--focus`]: "$color-surface-50",
    [`borderColor-${COMP}--focus`]: "$color-primary",
    [`boxShadow-${COMP}--focus`]: "0 0 0 3px rgb(from $color-primary r g b / 0.2)",
    [`backgroundColor-${COMP}--disabled`]: "$color-surface-100",
    [`textColor-${COMP}--disabled`]: "$color-surface-400",
    [`borderColor-${COMP}--disabled`]: "$color-surface-200",

    // Dropdown panel
    [`backgroundColor-content-${COMP}`]: "$color-surface-0",
    [`borderColor-content-${COMP}`]: "$color-surface-200",
    [`borderWidth-content-${COMP}`]: "1px",
    [`borderStyle-content-${COMP}`]: "solid",
    [`borderRadius-content-${COMP}`]: "$borderRadius",
    [`boxShadow-content-${COMP}`]: "$boxShadow-lg",
    [`paddingVertical-content-${COMP}`]: "$space-1",
    [`maxHeight-content-${COMP}`]: "280px",

    // Items
    [`paddingHorizontal-item-${COMP}`]: "$space-3",
    [`paddingVertical-item-${COMP}`]: "$space-2",
    [`borderRadius-item-${COMP}`]: "$borderRadius-sm",
    [`textColor-item-${COMP}`]: "$textColor-primary",
    [`fontSize-item-${COMP}`]: "$fontSize-md",
    [`backgroundColor-item-${COMP}--hover`]: "$color-primary-50",
    [`textColor-item-${COMP}--hover`]: "$textColor-primary",
    [`backgroundColor-item-${COMP}--selected`]: "$color-primary-100",
    [`textColor-item-${COMP}--selected`]: "$color-primary-700",
    [`backgroundColor-item-${COMP}--disabled`]: "transparent",
    [`textColor-item-${COMP}--disabled`]: "$color-surface-400",

    // Icons
    [`textColor-indicator-${COMP}`]: "$color-surface-500",
    [`textColor-itemIndicator-${COMP}`]: "$color-primary",

    light: {
      [`backgroundColor-${COMP}`]: "$color-surface-0",
      [`backgroundColor-content-${COMP}`]: "$color-surface-0",
    },
    dark: {
      [`backgroundColor-${COMP}`]: "$color-surface-100",
      [`backgroundColor-content-${COMP}`]: "$color-surface-100",
      [`borderColor-content-${COMP}`]: "$color-surface-300",
      [`backgroundColor-item-${COMP}--hover`]: "rgb(from $color-primary-200 r g b / 0.2)",
      [`backgroundColor-item-${COMP}--selected`]: "rgb(from $color-primary-200 r g b / 0.3)",
      [`textColor-item-${COMP}--selected`]: "$color-primary-300",
    },
  },
});

function normalizeToArray(raw: any): string[] {
  if (!raw && raw !== 0) return [];
  if (Array.isArray(raw)) return raw.map(String);
  return [String(raw)];
}

export const selectComponentRenderer = wrapCompound(COMP, SelectRender, SelectMd, {
  booleans: ["enabled", "multiple", "clearable"],
  events: {
    didChange: "onDidChange",
  },
  // Return undefined for "no selection" so the StateWrapper init-effect never
  // calls updateState with an empty array. This prevents the wrapCompound sync
  // loop where setLocalValue(new []) fires on every render because
  // Object.is([], []) === false even for semantically identical empty arrays.
  parseInitialValue: (raw) => {
    if (raw == null || raw === "") return undefined;
    const arr = normalizeToArray(raw);
    return arr.length > 0 ? arr : undefined;
  },
  // No formatExternalValue — the identity function preserves the original array
  // reference that XMLUI stored via updateState. Because wrapCompound's sync
  // effect does setLocalValue(__value), and localValue was set from the same
  // reference in onChange, Object.is(localValue, __value) === true → React
  // bails out and the loop never starts.
});
