import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { MultiSelectOption } from "@components/MultiSelect/MultiSelectOptionNative";
import { parseScssVar } from "@components-core/theming/themeVars";
import styles from "@components/MultiSelect/MultiSelectOption.module.scss";

const COMP = "MultiSelectOption";

export const MultiSelectOptionMd = createMetadata({
  description:
    `\`${COMP}\` is a non-visual component describing a selection option. Other components ` +
    `(such as \`Select\`, \`Combobox\`, and others) may use nested \`Option\` instances ` +
    `from which the user can select.`,
  props: {
    label: d(
      `This property defines the text to display for the option. If \`label\` is not defined, ` +
        `\`Option\` will use the \`value\` as the label.`,
    ),
    value: d(
      `This property defines the value of the option. If \`value\` is not defined, ` +
        `\`Option\` will use the \`label\` as the value.`,
    ),
    disabled: d(
      `If this property is set to \`true\`, the option is disabled and cannot be selected ` +
        `in its parent component.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-item-${COMP}`]: "$color-bg-dropdown-item",
    [`color-bg-item-${COMP}--hover`]: "$color-bg-dropdown-item--active",
    [`color-bg-item-${COMP}--active`]: "$color-bg-dropdown-item--active",
    [`min-height-Input`]: "39px",
    light: {
      [`color-text-item-${COMP}--disabled`]: "$color-surface-200",
    },
    dark: {
      [`color-text-item-${COMP}--disabled`]: "$color-surface-800",
    },
  },
});

export const multiSelectOptionComponentRenderer = createComponentRenderer(
  COMP,
  MultiSelectOptionMd,
  (rendererContext) => {
    const { node, renderChild, extractValue } = rendererContext;
    let label = extractValue(node.props.label);
    let value = extractValue(node.props.value);
    if (label == undefined && value == undefined) {
      return null;
    }
    if (label != undefined && value == undefined) {
      value = label;
    } else if (label == undefined && value != undefined) {
      label = value;
    }

    return (
      <MultiSelectOption
        value={value}
        label={label}
        disabled={extractValue.asOptionalBoolean(node.props.disabled)}
      />
    );
  },
);
