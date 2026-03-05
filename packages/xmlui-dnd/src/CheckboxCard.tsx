import { wrapComponent, createMetadata, d, parseScssVar } from "xmlui";
import { CheckboxCardNative, defaultProps } from "./CheckboxCardNative";
import styles from "./CheckboxCard.module.scss";

const COMP = "CheckboxCard";

export const CheckboxCardMd = createMetadata({
  status: "experimental",
  description:
    "`CheckboxCard` is a clickable card that acts as a checkbox, built on Mantine's " +
    "`Checkbox.Card` + `Checkbox.Indicator`. Clicking anywhere on the card toggles the " +
    "checked state. Supports full XMLUI theming for colors, border, and radius.",
  props: {
    label: d("Primary text displayed inside the card.", undefined, "string"),
    description: d("Secondary text displayed below the label.", undefined, "string"),
    initialValue: d("Initial checked state.", undefined, "boolean", false),
    size: d(
      "Size of the checkbox indicator. One of `xs`, `sm`, `md`, `lg`, `xl`.",
      undefined,
      "string",
      defaultProps.size,
    ),
    disabled: d("When `true`, the card is non-interactive.", undefined, "boolean", false),
    checkboxColor: d(
      "Fill color of the checkbox indicator when checked. " +
        "Overrides `checkboxColor-CheckboxCard`.",
      undefined,
      "string",
    ),
    checkboxIconColor: d(
      "Color of the check icon inside the indicator. " +
        "Overrides `checkboxIconColor-CheckboxCard`.",
      undefined,
      "string",
    ),
    indicatorBackgroundColor: d(
      "Background of the checkbox indicator when unchecked. " +
        "Overrides `indicatorBackgroundColor-CheckboxCard`.",
      undefined,
      "string",
    ),
    indicatorBorderColor: d(
      "Border color of the checkbox indicator when unchecked. " +
        "Overrides `indicatorBorderColor-CheckboxCard`.",
      undefined,
      "string",
    ),
    backgroundColor: d(
      "Card background when unchecked. Overrides `backgroundColor-CheckboxCard`.",
      undefined,
      "string",
    ),
    backgroundColorChecked: d(
      "Card background when checked. Overrides `backgroundColor-checked-CheckboxCard`.",
      undefined,
      "string",
    ),
    borderColor: d(
      "Card border color when unchecked. Overrides `borderColor-CheckboxCard`.",
      undefined,
      "string",
    ),
    borderColorChecked: d(
      "Card border color when checked. Overrides `borderColor-checked-CheckboxCard`.",
      undefined,
      "string",
    ),
    borderRadius: d(
      "Card border radius. Overrides `borderRadius-CheckboxCard`.",
      undefined,
      "string",
    ),
    textColor: d("Label text color. Overrides `textColor-CheckboxCard`.", undefined, "string"),
    descriptionColor: d(
      "Description text color. Overrides `descriptionColor-CheckboxCard`.",
      undefined,
      "string",
    ),
  },
  events: {
    didChange: {
      description: "Fires when the checked state changes. Receives the new boolean value.",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`checkboxColor-${COMP}`]: "$color-primary",
    [`checkboxIconColor-${COMP}`]: "white",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`backgroundColor-${COMP}`]: "$color-surface-50",
    [`backgroundColor-checked-${COMP}`]: "$color-primary-50",
    [`borderColor-${COMP}`]: "$color-surface-300",
    [`borderColor-checked-${COMP}`]: "$color-primary",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`descriptionColor-${COMP}`]: "$textColor-secondary",
    [`indicatorBackgroundColor-${COMP}`]: "white",
    [`indicatorBorderColor-${COMP}`]: "$color-surface-400",
  },
});

export const checkboxCardComponentRenderer = wrapComponent(
  COMP,
  CheckboxCardNative,
  CheckboxCardMd,
  {
    booleans: ["disabled"],
    strings: [
      "label",
      "description",
      "size",
      "checkboxColor",
      "checkboxIconColor",
      "indicatorBackgroundColor",
      "indicatorBorderColor",
      "backgroundColor",
      "backgroundColorChecked",
      "borderColor",
      "borderColorChecked",
      "borderRadius",
      "textColor",
      "descriptionColor",
    ],
    events: { didChange: "onChange" },
  },
);
