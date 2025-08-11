import styles from "./Text.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { variantOptionsMd, type VariantProps, VariantPropsKeys } from "../abstractions";
import { Text, defaultProps } from "./TextNative";
import { createMetadata, d } from "../metadata-helpers";

const COMP = "Text";

export const TextMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component displays textual information in a number of optional ` +
    `styles and variants.`,
  props: {
    value: d(
      `The text to be displayed. This value can also be set via nesting the text into ` +
        `the \`${COMP}\` component.`,
    ),
    variant: {
      description:
        "An optional string value that provides named presets for text variants with a " +
        "unique combination of font style, weight, size, color, and other parameters. " +
        "If not defined, the text uses the current style of its context.",
      availableValues: variantOptionsMd,
    },
    maxLines: d(
      "This property determines the maximum number of lines the component can wrap to. " +
        "If there is no space to display all the contents, the component displays up to as " +
        "many lines as specified in this property. When the value is not defined, there is " +
        "no limit on the displayed lines.",
    ),
    preserveLinebreaks: {
      description: `This property indicates if linebreaks should be preserved when displaying text.`,
      valueType: "boolean",
      defaultValue: defaultProps.preserveLinebreaks,
    },
    ellipses: {
      description:
        "This property indicates whether ellipses should be displayed when the text is " +
        "cropped (\`true\`) or not (\`false\`).",
      valueType: "boolean",
      defaultValue: defaultProps.ellipses,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderStyle-${COMP}`]: "solid",
    [`fontSize-${COMP}`]: "$fontSize-small",
    [`borderWidth-${COMP}`]: "$space-0",

    [`lineHeight-${COMP}-codefence`]: "1.5",

    [`fontWeight-${COMP}-abbr`]: "$fontWeight-bold",
    [`textTransform-${COMP}-abbr`]: "uppercase",
    [`fontSize-${COMP}-secondary`]: "$fontSize-small",
    [`fontStyle-${COMP}-cite`]: "italic",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`fontWeight-${COMP}`]: "$fontWeight-normal",
    [`fontSize-${COMP}-codefence`]: "$fontSize-code",
    [`fontFamily-${COMP}-code`]: "$fontFamily-monospace",
    [`fontSize-${COMP}-code`]: "$fontSize-small",
    [`borderWidth-${COMP}-code`]: "1px",
    [`borderStyle-${COMP}-code`]: "solid",
    [`borderRadius-${COMP}-code`]: "4px",
    [`paddingHorizontal-${COMP}-code`]: "$space-0_5",
    [`paddingBottom-${COMP}-code`]: "2px",
    [`textDecorationLine-${COMP}-deleted`]: "line-through",
    [`textDecorationLine-${COMP}-inserted`]: "underline",
    [`fontFamily-${COMP}-keyboard`]: "$fontFamily-monospace",
    [`fontSize-${COMP}-keyboard`]: "$fontSize-small",
    [`fontWeight-${COMP}-keyboard`]: "$fontWeight-bold",
    [`borderWidth-${COMP}-keyboard`]: "1px",
    [`paddingHorizontal-${COMP}-keyboard`]: "$space-1",
    [`fontFamily-${COMP}-sample`]: "$fontFamily-monospace",
    [`fontSize-${COMP}-sample`]: "$fontSize-small",
    [`fontSize-${COMP}-sup`]: "$fontSize-smaller",
    [`verticalAlignment-${COMP}-sup`]: "super",
    [`fontSize-${COMP}-sub`]: "$fontSize-smaller",
    [`verticalAlignment-${COMP}-sub`]: "sub",
    [`fontStyle-${COMP}-var`]: "italic",
    [`fontStyle-${COMP}-em`]: "italic",
    [`fontFamily-${COMP}-mono`]: "$fontFamily-monospace",
    [`fontSize-${COMP}-title`]: "$fontSize-large",
    [`fontSize-${COMP}-subtitle`]: "$fontSize-medium",
    [`fontSize-${COMP}-small`]: "$fontSize-small",
    [`lineHeight-${COMP}-small`]: "$lineHeight-tight",
    [`letterSpacing-${COMP}-caption`]: "0.05rem",
    [`fontSize-${COMP}-placeholder`]: "$fontSize-smaller",
    [`fontFamily-${COMP}-codefence`]: "$fontFamily-monospace",
    [`paddingHorizontal-${COMP}-codefence`]: "$space-4",
    [`paddingVertical-${COMP}-codefence`]: "$space-3",
    [`paddingVertical-${COMP}-paragraph`]: "$space-1",
    [`fontSize-${COMP}-subheading`]: "$fontSize-H6",
    [`fontWeight-${COMP}-subheading`]: "$fontWeight-bold",
    [`letterSpacing-${COMP}-subheading`]: "0.04em",
    [`textTransform-${COMP}-subheading`]: "uppercase",
    [`marginTop-${COMP}-tableheading`]: "$space-1",
    [`marginBottom-${COMP}-tableheading`]: "$space-4",
    [`paddingHorizontal-${COMP}-tableheading`]: "$space-1",
    [`fontSize-${COMP}-tableheading`]: "$fontSize-H6",
    [`fontWeight-${COMP}-tableheading`]: "$fontWeight-bold",

    [`marginTop-${COMP}-markdown`]: "$space-3",
    [`marginBottom-${COMP}-markdown`]: "$space-6",
    [`fontSize-${COMP}-markdown`]: `fontSize-${COMP}`,
    [`fontWeight-${COMP}-markdown`]: `fontWeight-${COMP}`,

    [`backgroundColor-${COMP}-code`]: "rgb(from $color-surface-100 r g b / 0.4)",
    [`borderColor-${COMP}-code`]: "$color-surface-100",
    [`backgroundColor-${COMP}-keyboard`]: "rgb(from $color-surface-100 r g b / 0.4)",
    [`borderColor-${COMP}-keyboard`]: "$color-surface-300",
    [`backgroundColor-${COMP}-marked`]: "rgb(from $color-primary-200 r g b / 0.4)",
    [`color-${COMP}-placeholder`]: "$color-surface-500",
    [`color-${COMP}-codefence`]: "$color-surface-900",
    [`color-${COMP}-subheading`]: "$textColor-secondary",
    [`color-${COMP}-secondary`]: "$textColor-secondary",

    dark: {
      [`backgroundColor-${COMP}-marked`]: "rgb(from $color-primary-400 r g b / 0.4)",
    },
  },
});

export const textComponentRenderer = createComponentRenderer(
  COMP,
  TextMd,
  ({ node, extractValue, className, renderChild }) => {
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
        className={className}
        preserveLinebreaks={extractValue.asOptionalBoolean(
          preserveLinebreaks,
          defaultProps.preserveLinebreaks,
        )}
        ellipses={extractValue.asOptionalBoolean(ellipses, defaultProps.ellipses)}
        {...variantSpecificProps}
      >
        {extractValue.asDisplayText(value) || renderChild(node.children)}
      </Text>
    );
  },
);
