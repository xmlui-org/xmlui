import styles from "./Text.module.scss";

import React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import {
  variantOptionsMd,
  type VariantProps,
  VariantPropsKeys,
  type OverflowMode,
  type BreakMode,
} from "../abstractions";
import { Text } from "./TextReact";
import { defaultProps } from "./Text.defaults";
import { createMetadata, dContextMenu } from "../metadata-helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const COMP = "Text";

export const TextMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component displays textual information in a number of optional ` +
    `styles and variants.`,
  props: {
    value: {
      description:
        `The text to be displayed. This value can also be set via nesting the text into ` +
        `the \`${COMP}\` component.`,
      valueType: "string",
    },
    variant: {
      description:
        "An optional string value that provides named presets for text variants with a " +
        "unique combination of font style, weight, size, color, and other parameters. " +
        "If not defined, the text uses the current style of its context.",
      availableValues: variantOptionsMd,
      isStrictEnum: true,
      valueType: "string",
    },
    maxLines: {
      description:
        "This property determines the maximum number of lines the component can wrap to. " +
        "If there is no space to display all the contents, the component displays up to as " +
        "many lines as specified in this property. When the value is not defined, there is " +
        "no limit on the displayed lines.",
      valueType: "number",
    },
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
    breakMode: {
      description:
        "This property controls how text breaks into multiple lines. " +
        "`normal` uses standard word boundaries, `word` breaks long words to prevent overflow, " +
        "`anywhere` breaks at any character, `keep` prevents word breaking, " +
        "and `hyphenate` uses automatic hyphenation. When not specified, uses the default browser behavior or theme variables.",
      valueType: "string",
      defaultValue: "normal",
      availableValues: [
        { value: "normal", description: "Uses standard word boundaries for breaking" },
        { value: "word", description: "Breaks long words when necessary to prevent overflow" },
        { value: "anywhere", description: "Breaks at any character if needed to fit content" },
        { value: "keep", description: "Prevents breaking within words entirely" },
        { value: "hyphenate", description: "Uses automatic hyphenation when breaking words" },
      ],
      isStrictEnum: true,
    },
    overflowMode: {
      description:
        "This property controls how text overflow is handled. " +
        "`none` prevents wrapping and shows no overflow indicator, " +
        "`ellipsis` shows ellipses when text is truncated, `scroll` forces single line with horizontal scrolling, " +
        "and `flow` allows multi-line wrapping with vertical scrolling when needed (ignores maxLines). " +
        "When not specified, uses the default text behavior.",
      valueType: "string",
      defaultValue: "not specified",
      availableValues: [
        {
          value: "none",
          description:
            "No wrapping, text stays on a single line with no overflow indicator (ignores maxLines)",
        },
        { value: "ellipsis", description: "Truncates with an ellipsis (default)" },
        {
          value: "scroll",
          description:
            "Forces single line with horizontal scrolling when content overflows (ignores maxLines)",
        },
        {
          value: "flow",
          description:
            "Allows text to wrap into multiple lines with vertical scrolling when container height is constrained (ignores maxLines)",
        },
      ],
      isStrictEnum: true,
    },
  },
  events: {
    contextMenu: dContextMenu(COMP),
  },
  apis: {
    hasOverflow: {
      description: "Returns true when the displayed text overflows its container boundaries.",
      signature: "hasOverflow(): boolean",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderStyle-${COMP}`]: "solid",
    [`borderWidth-${COMP}`]: "$space-0",
    [`textColor-${COMP}`]: "$textColor",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`fontSize-${COMP}`]: "$fontSize",
    [`fontWeight-${COMP}`]: "$fontWeight-normal",

    [`fontSize-${COMP}-secondary`]: "$fontSize-sm",
    [`textColor-${COMP}-secondary`]: "$textColor-secondary",

    [`fontWeight-${COMP}-abbr`]: "$fontWeight-bold",
    [`textTransform-${COMP}-abbr`]: "uppercase",
    [`fontStyle-${COMP}-cite`]: "italic",

    [`fontSize-${COMP}-codefence`]: "$fontSize-code",
    [`fontFamily-${COMP}-codefence`]: "$fontFamily-monospace",
    [`paddingHorizontal-${COMP}-codefence`]: "$space-4",
    [`paddingVertical-${COMP}-codefence`]: "$space-3",
    [`textColor-${COMP}-codefence`]: "$color-surface-900",
    [`lineHeight-${COMP}-codefence`]: "1.5",

    [`fontFamily-${COMP}-code`]: "$fontFamily-monospace",
    [`fontSize-${COMP}-code`]: "$fontSize-sm",
    [`borderWidth-${COMP}-code`]: "1px",
    [`borderStyle-${COMP}-code`]: "solid",
    [`borderRadius-${COMP}-code`]: "4px",
    [`paddingHorizontal-${COMP}-code`]: "$space-0_5",
    [`paddingBottom-${COMP}-code`]: "2px",
    [`backgroundColor-${COMP}-code`]: "rgb(from $color-surface-100 r g b / 0.4)",
    [`borderColor-${COMP}-code`]: "$color-surface-100",
    [`textColor-${COMP}-code--hover`]: "initial",

    [`textDecorationLine-${COMP}-deleted`]: "line-through",

    [`textDecorationLine-${COMP}-inserted`]: "underline",

    [`fontFamily-${COMP}-keyboard`]: "$fontFamily-monospace",
    [`fontSize-${COMP}-keyboard`]: "$fontSize-sm",
    [`fontWeight-${COMP}-keyboard`]: "$fontWeight-bold",
    [`borderWidth-${COMP}-keyboard`]: "1px",
    [`paddingHorizontal-${COMP}-keyboard`]: "$space-1",
    [`backgroundColor-${COMP}-keyboard`]: "rgb(from $color-surface-100 r g b / 0.4)",
    [`borderColor-${COMP}-keyboard`]: "$color-surface-300",

    [`fontFamily-${COMP}-sample`]: "$fontFamily-monospace",
    [`fontSize-${COMP}-sample`]: "$fontSize-sm",

    [`fontSize-${COMP}-sup`]: "$fontSize-xs",
    [`verticalAlignment-${COMP}-sup`]: "super",

    [`fontSize-${COMP}-sub`]: "$fontSize-xs",
    [`verticalAlignment-${COMP}-sub`]: "sub",

    [`fontStyle-${COMP}-var`]: "italic",

    [`fontStyle-${COMP}-em`]: "italic",

    [`fontFamily-${COMP}-mono`]: "$fontFamily-monospace",

    [`fontSize-${COMP}-title`]: "$fontSize-2xl",

    [`fontSize-${COMP}-subtitle`]: "$fontSize-xl",

    [`fontSize-${COMP}-small`]: "$fontSize-sm",

    [`letterSpacing-${COMP}-caption`]: "0.05rem",

    [`fontSize-${COMP}-placeholder`]: "$fontSize-xs",
    [`textColor-${COMP}-placeholder`]: "$color-surface-500",

    [`paddingVertical-${COMP}-paragraph`]: "$space-1",

    [`fontSize-${COMP}-subheading`]: "$fontSize-H6",
    [`fontWeight-${COMP}-subheading`]: "$fontWeight-bold",
    [`letterSpacing-${COMP}-subheading`]: "0.04em",
    [`textTransform-${COMP}-subheading`]: "uppercase",
    [`textColor-${COMP}-subheading`]: "$textColor-secondary",

    [`marginTop-${COMP}-tableheading`]: "$space-1",
    [`marginBottom-${COMP}-tableheading`]: "$space-4",
    [`paddingHorizontal-${COMP}-tableheading`]: "$space-1",
    [`fontSize-${COMP}-tableheading`]: "$fontSize-H6",
    [`fontWeight-${COMP}-tableheading`]: "$fontWeight-bold",

    [`fontWeight-${COMP}-strong`]: "$fontWeight-bold",

    [`textColor-${COMP}-marked`]: "$color-secondary-800",
    [`backgroundColor-${COMP}-marked`]: "rgb(from $color-primary-300 r g b / 0.4)",

    dark: {
      [`backgroundColor-${COMP}-marked`]: "rgb(from $color-primary-400 r g b / 0.4)",
    },
  },
});

type ThemedTextProps = React.ComponentProps<typeof Text> & { className?: string };
export const ThemedText = React.forwardRef<HTMLElement, ThemedTextProps>(function ThemedText(
  { className, ...props }: ThemedTextProps,
  ref,
) {
  const themeClass = useComponentThemeClass(TextMd);
  return (
    <Text {...props} className={`${themeClass}${className ? ` ${className}` : ""}`} ref={ref} />
  );
});

export const textComponentRenderer = wrapComponent(COMP, Text, TextMd, {
  exposeRegisterApi: true,
  exclude: [
    "variant",
    "maxLines",
    "preserveLinebreaks",
    "ellipses",
    "overflowMode",
    "breakMode",
    "value",
  ],
  events: [],
  customRender(
    _props,
    { node, extractValue, classes, renderChild, registerComponentApi, lookupEventHandler },
  ) {
    const {
      variant,
      maxLines,
      preserveLinebreaks,
      ellipses,
      overflowMode,
      breakMode,
      value,
      ...variantSpecific
    } = node.props;

    const variantSpecificProps: VariantProps = Object.fromEntries(
      Object.entries(variantSpecific)
        .filter(([key, _]) => VariantPropsKeys.includes(key as any))
        .map(([key, value]) => [key, extractValue(value)]),
    );

    return (
      <Text
        variant={extractValue(variant)}
        maxLines={extractValue.asOptionalNumber(maxLines)}
        classes={classes}
        preserveLinebreaks={extractValue.asOptionalBoolean(
          preserveLinebreaks,
          defaultProps.preserveLinebreaks,
        )}
        ellipses={extractValue.asOptionalBoolean(ellipses, defaultProps.ellipses)}
        overflowMode={extractValue(overflowMode) as OverflowMode | undefined}
        breakMode={extractValue(breakMode) as BreakMode | undefined}
        registerComponentApi={registerComponentApi}
        onContextMenu={lookupEventHandler("contextMenu")}
        {...variantSpecificProps}
      >
        {extractValue.asDisplayText(value) || renderChild(node.children)}
      </Text>
    );
  },
});

export const textRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: TextMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const {
      className,
      style,
      ...rootAttrs
    } = adapter.rootAttrs() as React.HTMLAttributes<HTMLElement>;
    const variantSpecificProps: VariantProps = Object.fromEntries(
      Object.entries(adapter.props)
        .filter(([key]) => VariantPropsKeys.includes(key as any)),
    );
    const value = adapter.prop("value");
    const valueText = normalizeMultilineValueText(displayText(value));
    const preserveLinebreaks = adapter.booleanProp(
      "preserveLinebreaks",
      defaultProps.preserveLinebreaks,
    );
    const overflowMode = adapter.stringProp("overflowMode") as OverflowMode | undefined;
    const textVariant = adapter.stringProp("variant") as any;
    const textStyle = { ...(style as React.CSSProperties | undefined) };
    if (textVariant === "strong" && textStyle.fontWeight === undefined) {
      textStyle.fontWeight = "var(--xmlui-fontWeight-Text-strong)";
    }

    return (
      <Text
        {...rootAttrs}
        variant={textVariant}
        maxLines={adapter.numberProp("maxLines", defaultProps.maxLines)}
        classes={className ? { [COMPONENT_PART_KEY]: className as string } : undefined}
        preserveLinebreaks={preserveLinebreaks}
        ellipses={adapter.booleanProp("ellipses", defaultProps.ellipses)}
        overflowMode={overflowMode}
        breakMode={adapter.stringProp("breakMode") as BreakMode | undefined}
        registerComponentApi={adapter.registerApi}
        onContextMenu={
          Object.prototype.hasOwnProperty.call(adapter.node.events, "contextMenu")
            ? adapter.event("contextMenu")
            : undefined
        }
        style={textStyle}
        {...variantSpecificProps}
      >
        {valueText || adapter.renderChildren()}
      </Text>
    );
  },
});

function displayText(value: unknown): string | undefined {
  return value === undefined || value === null ? undefined : String(value);
}

function normalizeMultilineValueText(value: string | undefined): string | undefined {
  if (!value?.includes("\n")) {
    return value;
  }
  return value.replace(/\n([ \t]+)/g, (_match, indentation: string) => {
    const normalized = indentation.replace(/\t/g, " ");
    return `\n ${"\u00a0".repeat(Math.max(0, normalized.length - 1))}`;
  });
}
