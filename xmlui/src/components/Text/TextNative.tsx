import type { CSSProperties } from "react";
import { forwardRef } from "react";
import type React from "react";
import { useMemo, useRef } from "react";
import styles from "./Text.module.scss";
import classnames from "@components-core/utils/classnames";
import { getMaxLinesStyle } from "@components-core/utils/css-utils";
import { composeRefs } from "@radix-ui/react-compose-refs";
import type { PropertyValueDescription } from "@abstractions/ComponentDefs";

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

type TextVariant = (typeof TextVariantKeys)[number];
type TextPropertyValueDescription = PropertyValueDescription & { value: TextVariant; description: string };

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

export const variantOptionsMd: TextPropertyValueDescription[] = [
  { value: "abbr", description: "Represents an abbreviation or acronym" },
  { value: "caption", description: "Represents the caption (or title) of a table" },
  { value: "cite", description: "Is used to mark up the title of a cited work" },
  { value: "code", description: "Represents a line of code" },
  { value: "codefence", description: "Handles the display of code blocks if combined with a `code` variant" },
  { value: "deleted", description: "Represents text that has been deleted" },
  { value: "em", description: "Marks text to stress emphasis" },
  { value: "inserted", description: "Represents a range of text that has been added to a document" },
  { value: "keyboard", description: "Represents a span of text denoting textual user input from a keyboard or voice input" },
  { value: "marked", description: "Represents text which is marked or highlighted for reference or notation" },
  { value: "mono", description: "Text using a mono style font family" },
  { value: "paragraph", description: "Represents a paragraph" },
  { value: "placeholder", description: "Text that is mostly used as the placeholder style in input controls" },
  { value: "sample", description: "Represents sample (or quoted) output from a computer program" },
  { value: "secondary", description: "Represents a bit dimmed secondary text" },
  { value: "small", description: "Represents side-comments and small print" },
  { value: "sub", description: "Specifies inline text as subscript" },
  { value: "strong", description: "Contents have strong importance" },
  { value: "subheading", description: "Indicates that the text is the subtitle in a heading" },
  { value: "subtitle", description: "Indicates that the text is the subtitle of some other content" },
  { value: "sup", description: "Specifies inline text as superscript" },
  { value: "tableheading", description: "Indicates that the text is a table heading" },
  { value: "title", description: "Indicates that the text is the title of some other content" },
  { value: "var", description: "Represents the name of a variable in a mathematical expression" },
] as const;

const AbbreviationKeys = ["title"] as const;
type Abbreviation = {
  title?: string;
};

const InsertedKeys = ["cite", "dateTime"] as const;
type Inserted = {
  cite?: string;
  dateTime?: string;
};

export const VariantPropsKeys = [...AbbreviationKeys, ...InsertedKeys] as const;
export type VariantProps = Abbreviation | Inserted;

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

export const Text = forwardRef(function Text(
  {
    uid,
    variant,
    maxLines = 0,
    layout,
    children,
    preserveLinebreaks,
    ellipses = true,
    ...variantSpecificProps
  }: TextProps,
  forwardedRef,
) {
  const innerRef = useRef<HTMLElement>(null);
  const ref = forwardedRef ? composeRefs(innerRef, forwardedRef) : innerRef;

  const Element = useMemo(() => {
    if (!variant || !TextVariantElement[variant]) return "div"; //todo illesg, could be a span?
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
            [styles.noEllipsis]: !ellipses,
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
