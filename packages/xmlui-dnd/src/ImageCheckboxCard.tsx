import { wrapComponent, createMetadata, d, parseScssVar } from "xmlui";
import { ImageCheckboxCardNative, defaultProps } from "./ImageCheckboxCardNative";
import styles from "./ImageCheckboxCard.module.scss";

const COMP = "ImageCheckboxCard";

export const ImageCheckboxCardMd = createMetadata({
  status: "experimental",
  description:
    "`ImageCheckboxCard` is a selectable card featuring an image at the top and a label " +
    "with an inline checkbox indicator at the bottom, built on Mantine's `Checkbox.Card` " +
    "+ `Checkbox.Indicator`. Supports full XMLUI theming.",
  props: {
    imageUrl: d("URL of the image displayed at the top of the card.", undefined, "string"),
    imageAlt: d("Alt text for the image.", undefined, "string"),
    label: d("Primary text displayed in the bottom row.", undefined, "string"),
    description: d("Secondary text displayed below the label.", undefined, "string"),
    initialValue: d("Initial checked state.", undefined, "boolean", false),
    size: d(
      "Size of the checkbox indicator. One of `xs`, `sm`, `md`, `lg`, `xl`.",
      undefined,
      "string",
      defaultProps.size,
    ),
    disabled: d("When `true`, the card is non-interactive.", undefined, "boolean", false),
    imageHeight: d(
      "Height of the image area (any CSS length). " + "Overrides `imageHeight-ImageCheckboxCard`.",
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
    [`imageHeight-${COMP}`]: "160px",
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

export const imageCheckboxCardComponentRenderer = wrapComponent(
  COMP,
  ImageCheckboxCardNative,
  ImageCheckboxCardMd,
  {
    booleans: ["disabled"],
    strings: ["imageUrl", "imageAlt", "label", "description", "size", "imageHeight"],
    events: { didChange: "onChange" },
  },
);
