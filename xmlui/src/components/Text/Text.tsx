import React from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { useComponentThemeClass } from "../../runtime/rendering/theme";
import { extractScssThemeVars } from "../../styling/theme";
import { useComponentStyle } from "../../components-core/theming/StyleContext";
import { toCssVar } from "../../components-core/theming/layout-resolver";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import {
  type BreakMode,
  type OverflowMode,
  type VariantProps,
  VariantPropsKeys,
  TextVariantElement,
  variantOptionsMd,
} from "../abstractions";
import {
  createMetadata,
  dContextMenu,
} from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { Text } from "./TextReact";
import { defaultProps } from "./Text.defaults";
import textStylesSource from "./Text.module.scss?xmlui-theme-vars";

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
      description: "This property indicates if linebreaks should be preserved when displaying text.",
      valueType: "boolean",
      defaultValue: defaultProps.preserveLinebreaks,
    },
    ellipses: {
      description:
        "This property indicates whether ellipses should be displayed when the text is " +
        "cropped (`true`) or not (`false`).",
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
  themeVars: extractScssThemeVars(textStylesSource),
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
    [`borderStyle-${COMP}-keyboard`]: "solid",
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
  },
});

type ThemedTextProps = React.ComponentProps<typeof Text> & { className?: string };
export const ThemedText = React.forwardRef<HTMLElement, ThemedTextProps>(function ThemedText(
  { className, classes, style, variant, ...props }: ThemedTextProps,
  ref,
) {
  const themeClass = useComponentThemeClass(COMP, TextMd as ComponentMetadata, [], variant);
  const variantClassName = useComponentStyle(createVariantStyle(variant));
  const mergedClasses = {
    ...classes,
    [COMPONENT_PART_KEY]: [
      themeClass.className,
      classes?.[COMPONENT_PART_KEY],
    ].filter(Boolean).join(" "),
  };
  return (
    <Text
      {...props}
      variant={variant}
      classes={mergedClasses}
      className={[variantClassName, className].filter(Boolean).join(" ")}
      style={{ ...themeClass.style, ...style }}
      ref={ref}
    />
  );
});

export const textRenderer = wrapComponent({
  name: COMP,
  metadata: TextMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const variant = adapter.stringProp("variant") as keyof typeof TextVariantElement | undefined;
    const variantClassName = useComponentStyle(createVariantStyle(variant));
    const variantSpecificProps: VariantProps = Object.fromEntries(
      Object.entries(adapter.props)
        .filter(([key]) => VariantPropsKeys.includes(key as any))
        .map(([key, value]) => [key, value]),
    );
    const hasValue = Object.prototype.hasOwnProperty.call(adapter.node.props, "value");
    const value = displayText(adapter.prop("value"));
    const children = hasValue && value ? value : adapter.renderChildren();

    return (
      <Text
        {...rootAttrs}
        variant={variant}
        maxLines={adapter.numberProp("maxLines", defaultProps.maxLines)}
        classes={{ [COMPONENT_PART_KEY]: adapter.className }}
        className={variantClassName}
        preserveLinebreaks={adapter.booleanProp("preserveLinebreaks", defaultProps.preserveLinebreaks)}
        ellipses={adapter.booleanProp("ellipses", defaultProps.ellipses)}
        overflowMode={adapter.stringProp("overflowMode") as OverflowMode | undefined}
        breakMode={adapter.stringProp("breakMode") as BreakMode | undefined}
        registerComponentApi={adapter.registerApi}
        onContextMenu={(event: React.MouseEvent<HTMLElement>) => {
          event.preventDefault();
          void adapter.event("contextMenu")(event);
        }}
        {...variantSpecificProps}
      >
        {children}
      </Text>
    );
  },
});

function displayText(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  let text = String(value);
  let replaced = "";
  let spaceFound = false;
  for (const char of text) {
    if (char === " " || char === "\t") {
      replaced += spaceFound ? "\xa0" : " ";
      spaceFound = true;
    } else {
      replaced += char;
      spaceFound = char === "\xa0";
    }
  }
  text = replaced;
  return text;
}

function createVariantStyle(variant: string | undefined) {
  if (!variant || !(variant in TextVariantElement)) {
    return undefined;
  }
  const subject = `-Text-${variant}`;
  return {
    color: toCssVar(`$textColor${subject}`),
    "font-family": toCssVar(`$fontFamily${subject}`),
    "font-size": toCssVar(`$fontSize${subject}`),
    "font-style": toCssVar(`$fontStyle${subject}`),
    "font-weight": toCssVar(`$fontWeight${subject}`),
    "font-stretch": toCssVar(`$fontStretch${subject}`),
    "text-decoration-line": toCssVar(`$textDecorationLine${subject}`),
    "text-decoration-color": toCssVar(`$textDecorationColor${subject}`),
    "text-decoration-style": toCssVar(`$textDecorationStyle${subject}`),
    "text-decoration-thickness": toCssVar(`$textDecorationThickness${subject}`),
    "text-underline-offset": toCssVar(`$textUnderlineOffset${subject}`),
    "line-height": toCssVar(`$lineHeight${subject}`),
    "background-color": toCssVar(`$backgroundColor${subject}`),
    "text-transform": toCssVar(`$textTransform${subject}`),
    "letter-spacing": toCssVar(`$letterSpacing${subject}`),
    "word-spacing": toCssVar(`$wordSpacing${subject}`),
    "text-shadow": toCssVar(`$textShadow${subject}`),
    "text-indent": toCssVar(`$textIndent${subject}`),
    "text-align": toCssVar(`$textAlign${subject}`),
    "text-align-last": toCssVar(`$textAlignLast${subject}`),
    "word-break": toCssVar(`$wordBreak${subject}`),
    "word-wrap": toCssVar(`$wordWrap${subject}`),
    direction: toCssVar(`$direction${subject}`),
    "writing-mode": toCssVar(`$writingMode${subject}`),
    "line-break": toCssVar(`$lineBreak${subject}`),
    "border-width": toCssVar(`$borderWidth${subject}`),
    "border-style": toCssVar(`$borderStyle${subject}`),
    "border-color": toCssVar(`$borderColor${subject}`),
    "border-radius": toCssVar(`$borderRadius${subject}`),
    "padding-inline-start": cssVarWithFallback(`paddingLeft${subject}`, `paddingHorizontal${subject}`),
    "padding-inline-end": cssVarWithFallback(`paddingRight${subject}`, `paddingHorizontal${subject}`),
    "padding-top": cssVarWithFallback(`paddingTop${subject}`, `paddingVertical${subject}`),
    "padding-bottom": cssVarWithFallback(`paddingBottom${subject}`, `paddingVertical${subject}`),
    "margin-top": toCssVar(`$marginTop${subject}`),
    "margin-bottom": toCssVar(`$marginBottom${subject}`),
    "margin-inline-start": toCssVar(`$marginLeft${subject}`),
    "margin-inline-end": toCssVar(`$marginRight${subject}`),
    "vertical-align": toCssVar(`$verticalAlignment${subject}`),
  };
}

function cssVarWithFallback(name: string, fallbackName: string) {
  return `var(--xmlui-${name}, var(--xmlui-${fallbackName}))`;
}
