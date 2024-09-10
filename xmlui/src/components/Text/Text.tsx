import type {CSSProperties} from "react";
import { forwardRef} from "react";
import type React from "react";
import { useMemo, useRef } from "react";
import styles from "./Text.module.scss";
import classnames from "@components-core/utils/classnames";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { desc } from "@components-core/descriptorHelper";
import { getMaxLinesStyle } from "@components-core/utils/css-utils";
import {composeRefs} from "@radix-ui/react-compose-refs";

// =====================================================================================================================
// React Text component definition

const TextVariantKeys = [
  "abbr", // use <abbr>
  "cite", // use <cite>
  "code", // use <code>
  "codefence", // use uniquely styled <![CDATA[
  "deleted", // use <del>
  "inserted", // use <ins>
  "keyboard", // use <kbd>,
  "marked", // use <mark>
  "sample", // use <samp>
  "sub", // use <sub>
  "sup", // use <sup>
  "var", // use <var>
  "strong", // use <strong> element for content that is of greater importance (used in Markdown)
  "em", // use <em> element changes the meaning of a sentence - as spoken emphasis does (used in Markdown)
  "mono", // use monospace font with <![CDATA[
  "title", // Title text in the particular context
  "subtitle", // Subtitle text in the particular context
  "small", // Small text in the particular context
  "caption", // Caption text in the particular context
  "placeholder", // Placeholder text in the particular context
  "paragraph", // use <p>
  "subheading", // use a H6 with some specific defaults
  "tableheading", // use a H3 with some specific defaults
  "secondary", // use a secondary text style
] as const;

type TextVariant = typeof TextVariantKeys[number];

const TextVariantElement: Record<TextVariant, TextVariantMapping> = {
  abbr: "abbr",
  cite: "cite",
  code: "code",
  codefence: "pre",
  deleted: "del",
  inserted: "ins",
  keyboard: "kbd",
  marked: "mark",
  sample: "samp",
  sub: "sub",
  sup: "sup",
  var: "var",
  mono: "pre",
  strong: "strong",
  em: "em",
  title: "span",
  subtitle: "span",
  small: "span",
  caption: "span",
  placeholder: "span",
  paragraph: "p",
  subheading: "h6",
  tableheading: "h6",
  secondary: "span",
};

type TextVariantMapping =
  | "abbr"
  | "cite"
  | "code"
  | "del"
  | "ins"
  | "kbd"
  | "mark"
  | "samp"
  | "sub"
  | "sup"
  | "var"
  | "pre"
  | "strong"
  | "em"
  | "span"
  | "p"
  | "h6";

const AbbreviationKeys = ["title"] as const;
type Abbreviation = {
  title?: string;
};

const InsertedKeys = ["cite", "dateTime"] as const;
type Inserted = {
  cite?: string;
  dateTime?: string;
};

const VariantPropsKeys = [...AbbreviationKeys, ...InsertedKeys] as const;
type VariantProps = Abbreviation | Inserted;

type TextProps = {
  uid?: string;
  children?: React.ReactNode;
  variant?: TextVariant;
  maxLines?: number;
  preserveLinebreaks?: boolean;
  ellipses?: boolean;
  layout?: CSSProperties;
  [variantSpecificProps: string]: any;
};

export const Text = forwardRef(function Text({
  uid,
  variant,
  maxLines = 0,
  layout,
  children,
  preserveLinebreaks,
  ellipses = true,
  ...variantSpecificProps
}: TextProps, forwardedRef) {
  const innerRef = useRef<HTMLElement>(null);
  const ref = forwardedRef ? composeRefs(innerRef, forwardedRef) : innerRef;

  const Element = useMemo(() => {
    if (!variant || !TextVariantElement[variant]) return "div";     //todo illesg, could be a span?
    return TextVariantElement[variant];
  }, [variant]);

  return (
    <>
      <Element
        {...variantSpecificProps}
        ref={ref as any}
        className={classnames([
          styles.text,
          styles[variant || "default"],
          {
            [styles.truncateOverflow]: maxLines > 0,
            [styles.preserveLinebreaks]: preserveLinebreaks,
            [styles.noEllipsis]: !ellipses
          },
        ])}
        style={{
          ...layout,
          ...getMaxLinesStyle(maxLines),
        }}
      >
        {children}
      </Element>
    </>
  );
});

// =====================================================================================================================
// XMLUI Text component definition

/**
 * The \`Text\` component displays textual information in a number of optional styles and variants.
 *
 * You can learn more about this component in the [Working with Text](/learning/using-components/text) article.
 */
export interface TextComponentDef extends ComponentDef<"Text"> {
  props: {
    /**
     * The text to be displayed. This value can also be set via nesting the text into the `Text` component.
     * @descriptionRef
     */
    value?: string;
    /**
     * Optional string value that provides named presets for text variants with a unique combination
     * of font style, weight, size, color and other parameters.
     * @descriptionRef
     */
    variant?: TextVariant;
    /**
     * This property determines the maximum number of lines the component can wrap to.
     * If there is no space to display all the contents,
     * the component displays up to as many lines as specified in this property.
     * @descriptionRef
     */
    maxLines?: number;
    /**
     * This property indicates if linebreaks should be preserved when displaying text.
     * By default, its value is set to \`false\`.
     * @descriptionRef
     */
    preserveLinebreaks?: boolean;
    /**
     * This property indicates whether ellipses should be displayed when the text is cropped (\`true\`) or not (\`false\`).
     * By default, its value is set to \`true\`.
     * @descriptionRef
     */
    ellipses?: boolean;
  };
}

export const TextMd: ComponentDescriptor<TextComponentDef> = {
  displayName: "Text",
  description: "Display a text with several variants (styles)",
  props: {
    value: desc("The text to display in the component - can be empty"),
    variant: desc("Indicates the styling of the Text component, see stylesheet for details"),
    maxLines: desc("Limits the number of lines the component can use"),
    preserveLinebreaks: desc("Allow preserving linebreak information?"),
    ellipses: desc("Indicates if ellipsis should be hidden from the end of the text"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "border-radius-Text": "$radius",
    "style-border-Text": "solid",
    "font-size-Text": "$font-size-small",
    "thickness-border-Text": "$space-0",
    "font-weight-Text-abbr": "$font-weight-bold",
    "transform-Text-abbr": "uppercase",
    "font-size-Text-secondary": "$font-size-small",
    "font-style-Text-cite": "italic",
    "color-Text": "$color-text-primary",
    "font-family-Text": "$font-family",
    "font-weight-Text": "$font-weight-normal",
    "font-family-Text-code": "$font-family-monospace",
    "font-size-Text-code": "$font-size-small",
    "thickness-border-Text-code": "1px",
    "padding-horizontal-Text-code": "$space-1",
    "line-decoration-Text-deleted": "line-through",
    "line-decoration-Text-inserted": "underline",
    "font-family-Text-keyboard": "$font-family-monospace",
    "font-size-Text-keyboard": "$font-size-small",
    "font-weight-Text-keyboard": "$font-weight-bold",
    "thickness-border-Text-keyboard": "1px",
    "padding-horizontal-Text-keyboard": "$space-1",
    "font-family-Text-sample": "$font-family-monospace",
    "font-size-Text-sample": "$font-size-small",
    "font-size-Text-sup": "$font-size-smaller",
    "align-vertical-Text-sup": "super",
    "font-size-Text-sub": "$font-size-smaller",
    "align-vertical-Text-sub": "sub",
    "font-style-Text-var": "italic",
    "font-family-Text-mono": "$font-family-monospace",
    "font-size-Text-title": "$font-size-large",
    "font-size-Text-subtitle": "$font-size-medium",
    "font-size-Text-small": "$font-size-small",
    "line-height-Text-small": "$line-height-tight",
    "letter-spacing-Text-caption": "0.05rem",
    "font-size-Text-placeholder": "$font-size-small",
    "font-family-Text-codefence": "$font-family-monospace",
    "padding-horizontal-Text-codefence": "$space-3",
    "padding-vertical-Text-codefence": "$space-2",
    "padding-vertical-Text-paragraph": "$space-1",
    "font-size-Text-subheading": "$font-size-H6",
    "font-weight-Text-subheading": "$font-weight-bold",
    "letter-spacing-Text-subheading": "0.04em",
    "transform-Text-subheading": "uppercase",
    "margin-top-Text-tableheading": "$space-1",
    "margin-bottom-Text-tableheading": "$space-4",
    "padding-horizontal-Text-tableheading": "$space-1",
    "font-weight-Text-tableheading": "$font-weight-bold",
    light: {
      "color-bg-Text-code": "$color-surface-100",
      "color-border-Text-code": "$color-surface-200",
      "color-bg-Text-keyboard": "$color-surface-200",
      "color-border-Text-keyboard": "$color-surface-300",
      "color-bg-Text-marked": "yellow",
      "color-Text-placeholder": "$color-surface-500",
      "color-bg-Text-codefence": "$color-primary-100",
      "color-Text-codefence": "$color-surface-900",
      "color-Text-subheading": "$color-text-secondary",
      "color-Text-secondary": "$color-text-secondary",
    },
    dark: {
      "color-bg-Text-code": "$color-surface-800",
      "color-border-Text-code": "$color-surface-700",
      "color-bg-Text-keyboard": "$color-surface-800",
      "color-border-Text-keyboard": "$color-surface-700",
      "color-bg-Text-marked": "orange",
      "color-Text-placeholder": "$color-surface-500",
      "color-bg-Text-codefence": "$color-primary-800",
      "color-Text-codefence": "$color-surface-200",
      "color-Text-subheading": "$color-text-secondary",
      "color-Text-secondary": "$color-text-secondary",
    },
  },
};

export const textComponentRenderer = createComponentRenderer<TextComponentDef>(
  "Text",
  ({ node, extractValue, layoutCss, renderChild }) => {
    const { variant, maxLines, preserveLinebreaks, ellipses, value, ...variantSpecific } = node.props;

    const variantSpecificProps: VariantProps = Object.fromEntries(
      Object.entries(variantSpecific)
        .filter(([key, _]) => VariantPropsKeys.includes(key as any))
        .map(([key, value]) => [key, extractValue(value)])
    );

    return (
      <Text
        variant={extractValue(variant)}
        maxLines={extractValue.asOptionalNumber(maxLines)}
        layout={layoutCss}
        preserveLinebreaks={extractValue.asOptionalBoolean(preserveLinebreaks, false)}
        ellipses={extractValue.asOptionalBoolean(ellipses, true)}
        {...variantSpecificProps}
      >
        {extractValue.asDisplayText(value) || renderChild(node.children)}
      </Text>
    );
  },
  TextMd
);
