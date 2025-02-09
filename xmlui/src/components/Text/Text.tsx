import styles from "./Text.module.scss";
import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { variantOptionsMd, type VariantProps, VariantPropsKeys } from "../abstractions";
import { Text } from "./TextNative";

const COMP = "Text";

export const TextMd = createMetadata({
  description:
    `The \`${COMP}\` component displays textual information in a number of optional ` +
    `styles and variants.`,
  props: {
    value: d(
      `The text to be displayed. This value can also be set via nesting the text into ` +
        `the \`${COMP}\` component.`,
    ),
    variant: d(
      `Optional string value that provides named presets for text variants with a ` +
        `unique combination of font style, weight, size, color and other parameters.`,
      variantOptionsMd,
    ),
    maxLines: d(
      `This property determines the maximum number of lines the component can wrap to. ` +
        `If there is no space to display all the contents, the component displays up to ` +
        `as many lines as specified in this property.`,
    ),
    preserveLinebreaks: d(
      `This property indicates if linebreaks should be preserved when displaying text.`,
    ),
    ellipses: d(
      `This property indicates whether ellipses should be displayed when the text is ` +
        `cropped (\`true\`) or not (\`false\`).`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`border-radius-${COMP}`]: "$radius",
    [`style-border-${COMP}`]: "solid",
    [`font-size-${COMP}`]: "$font-size-small",
    [`thickness-border-${COMP}`]: "$space-0",
    [`font-weight-${COMP}-abbr`]: "$font-weight-bold",
    [`transform-${COMP}-abbr`]: "uppercase",
    [`font-size-${COMP}-secondary`]: "$font-size-small",
    [`font-style-${COMP}-cite`]: "italic",
    [`color-${COMP}`]: "$color-text-primary",
    [`font-family-${COMP}`]: "$font-family",
    [`font-weight-${COMP}`]: "$font-weight-normal",
    [`font-family-${COMP}-code`]: "$font-family-monospace",
    [`font-size-${COMP}-code`]: "$font-size-small",
    [`thickness-border-${COMP}-code`]: "1px",
    [`padding-horizontal-${COMP}-code`]: "$space-1",
    [`line-decoration-${COMP}-deleted`]: "line-through",
    [`line-decoration-${COMP}-inserted`]: "underline",
    [`font-family-${COMP}-keyboard`]: "$font-family-monospace",
    [`font-size-${COMP}-keyboard`]: "$font-size-small",
    [`font-weight-${COMP}-keyboard`]: "$font-weight-bold",
    [`thickness-border-${COMP}-keyboard`]: "1px",
    [`padding-horizontal-${COMP}-keyboard`]: "$space-1",
    [`font-family-${COMP}-sample`]: "$font-family-monospace",
    [`font-size-${COMP}-sample`]: "$font-size-small",
    [`font-size-${COMP}-sup`]: "$font-size-smaller",
    [`align-vertical-${COMP}-sup`]: "super",
    [`font-size-${COMP}-sub`]: "$font-size-smaller",
    [`align-vertical-${COMP}-sub`]: "sub",
    [`font-style-${COMP}-var`]: "italic",
    [`font-family-${COMP}-mono`]: "$font-family-monospace",
    [`font-size-${COMP}-title`]: "$font-size-large",
    [`font-size-${COMP}-subtitle`]: "$font-size-medium",
    [`font-size-${COMP}-small`]: "$font-size-small",
    [`line-height-${COMP}-small`]: "$line-height-tight",
    [`letter-spacing-${COMP}-caption`]: "0.05rem",
    [`font-size-${COMP}-placeholder`]: "$font-size-small",
    [`font-family-${COMP}-codefence`]: "$font-family-monospace",
    [`padding-horizontal-${COMP}-codefence`]: "$space-3",
    [`padding-vertical-${COMP}-codefence`]: "$space-2",
    [`padding-vertical-${COMP}-paragraph`]: "$space-1",
    [`font-size-${COMP}-subheading`]: "$font-size-H6",
    [`font-weight-${COMP}-subheading`]: "$font-weight-bold",
    [`letter-spacing-${COMP}-subheading`]: "0.04em",
    [`transform-${COMP}-subheading`]: "uppercase",
    [`margin-top-${COMP}-tableheading`]: "$space-1",
    [`margin-bottom-${COMP}-tableheading`]: "$space-4",
    [`padding-horizontal-${COMP}-tableheading`]: "$space-1",
    [`font-weight-${COMP}-tableheading`]: "$font-weight-bold",
    light: {
      [`color-bg-${COMP}-code`]: "$color-surface-100",
      [`color-border-${COMP}-code`]: "$color-surface-200",
      [`color-bg-${COMP}-keyboard`]: "$color-surface-200",
      [`color-border-${COMP}-keyboard`]: "$color-surface-300",
      [`color-bg-${COMP}-marked`]: "yellow",
      [`color-${COMP}-placeholder`]: "$color-surface-500",
      [`color-bg-${COMP}-codefence`]: "$color-primary-100",
      [`color-${COMP}-codefence`]: "$color-surface-900",
      [`color-${COMP}-subheading`]: "$color-text-secondary",
      [`color-${COMP}-secondary`]: "$color-text-secondary",
    },
    dark: {
      [`color-bg-${COMP}-code`]: "$color-surface-800",
      [`color-border-${COMP}-code`]: "$color-surface-700",
      [`color-bg-${COMP}-keyboard`]: "$color-surface-800",
      [`color-border-${COMP}-keyboard`]: "$color-surface-700",
      [`color-bg-${COMP}-marked`]: "orange",
      [`color-${COMP}-placeholder`]: "$color-surface-500",
      [`color-bg-${COMP}-codefence`]: "$color-primary-800",
      [`color-${COMP}-codefence`]: "$color-surface-200",
      [`color-${COMP}-subheading`]: "$color-text-secondary",
      [`color-${COMP}-secondary`]: "$color-text-secondary",
    },
  },
});

export const textComponentRenderer = createComponentRenderer(
  COMP,
  TextMd,
  ({ node, extractValue, layoutCss, renderChild }) => {
    const { variant, maxLines, preserveLinebreaks, ellipses, value, ...variantSpecific } =
      node.props;

    const variantSpecificProps: VariantProps = Object.fromEntries(
      Object.entries(variantSpecific)
        .filter(([key, _]) => VariantPropsKeys.includes(key as any))
        .map(([key, value]) => [key, extractValue(value)]),
    );

    return (
      <Text
        variant={extractValue(variant)}
        maxLines={extractValue.asOptionalNumber(maxLines)}
        style={layoutCss}
        preserveLinebreaks={extractValue.asOptionalBoolean(preserveLinebreaks, false)}
        ellipses={extractValue.asOptionalBoolean(ellipses, true)}
        {...variantSpecificProps}
      >
        {extractValue.asDisplayText(value) || renderChild(node.children)}
      </Text>
    );
  },
);
