import React, { type CSSProperties } from "react";

import { htmlTagDefinitions, type HtmlTagDefinition } from "../../component-core/htmlTags";
import { wrapComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { ThemedHeading } from "../Heading/ThemedHeading";
import { ThemedLinkNative } from "../Link/ThemedLinkNative";
import { ThemedText } from "../Text/Text";
import { htmlTagMetadata } from "./HtmlTags.metadata";
import styles from "./HtmlTags.module.scss";

export { htmlTagMetadata } from "./HtmlTags.metadata";

const xmluiInternalProps = new Set([
  "testId",
  "when",
  "id",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "padding",
  "paddingHorizontal",
  "paddingVertical",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "margin",
  "marginHorizontal",
  "marginVertical",
  "marginLeft",
  "marginRight",
  "marginTop",
  "marginBottom",
  "backgroundColor",
  "border",
  "borderColor",
  "borderRadius",
  "display",
  "overflow",
  "style",
]);

const textVariants: Record<string, string> = {
  abbr: "abbr",
  cite: "cite",
  code: "code",
  del: "deleted",
  em: "em",
  ins: "inserted",
  kbd: "keyboard",
  mark: "marked",
  p: "paragraph",
  pre: "codefence",
  samp: "sample",
  small: "small",
  strong: "strong",
  sub: "sub",
  sup: "sup",
  var: "var",
};

const themedClassNames: Record<string, string | undefined> = {
  details: styles.htmlDetails,
  li: styles.htmlLi,
  ol: styles.htmlOl,
  table: styles.htmlTable,
  tbody: styles.htmlTbody,
  td: styles.htmlTd,
  tfoot: styles.htmlTfoot,
  th: styles.htmlTh,
  thead: styles.htmlThead,
  tr: styles.htmlTr,
  ul: styles.htmlUl,
  video: styles.htmlVideo,
};

const booleanPropsByTag: Record<string, readonly string[]> = {
  a: ["disabled"],
  area: ["noHref"],
  audio: ["autoPlay", "controls", "loop", "muted"],
  button: ["autoFocus", "disabled", "formNoValidate"],
  details: ["open"],
  dialog: ["open"],
  fieldset: ["disabled"],
  form: ["noValidate"],
  iframe: ["allowFullScreen"],
  img: ["isMap"],
  input: ["autoFocus", "checked", "disabled", "multiple", "readOnly", "required"],
  optgroup: ["disabled"],
  option: ["disabled", "selected"],
  select: ["autoFocus", "disabled", "multiple", "required"],
  textarea: ["autoFocus", "disabled", "readOnly", "required"],
  video: ["autoPlay", "controls", "loop", "muted"],
};

const resourceUrlPropsByTag: Record<string, readonly string[]> = {
  area: ["href"],
  audio: ["src"],
  embed: ["src"],
  iframe: ["src"],
  img: ["src"],
  input: ["src"],
  object: ["data"],
  source: ["src", "srcSet"],
  track: ["src"],
  video: ["poster", "src"],
};

export const htmlTagRenderers: Record<string, XmluiBuiltInRenderer> = Object.fromEntries(
  htmlTagDefinitions.map((definition) => [
    definition.name,
    createHtmlTagRenderer(definition),
  ]),
);

function createHtmlTagRenderer(definition: HtmlTagDefinition): XmluiBuiltInRenderer {
  return wrapComponent({
    name: definition.name,
    metadata: htmlTagMetadata[definition.name],
    renderer: ({ adapter }) => renderHtmlTag(definition, adapter),
  });
}

function renderHtmlTag(definition: HtmlTagDefinition, adapter: XmluiComponentAdapter) {
  const tagName = definition.tagName;
  const attrs = htmlAttributes(adapter, definition);
  const rootAttrs = htmlRootAttrs(adapter, attrs);
  const className = cx(
    themedClassNames[tagName],
    attrs.className as string | undefined,
    rootAttrs.className as string | undefined,
  );
  const style = mergeStyles(rootAttrs.style, inlineStyle(adapter.props.style));
  const children = definition.voidElement ? undefined : adapter.renderChildren();

  if (tagName === "a") {
    const { href, disabled, ...linkAttrs } = attrs;
    return (
      <ThemedLinkNative
        {...linkAttrs}
        {...rootAttrs}
        to={href}
        enabled={!asBoolean(disabled)}
        className={className}
        style={style}
      >
        {children}
      </ThemedLinkNative>
    );
  }

  const textVariant = textVariants[tagName];
  if (textVariant) {
    return (
      <ThemedText
        {...attrs}
        {...rootAttrs}
        variant={textVariant}
        className={className}
        style={style}
      >
        {children}
      </ThemedText>
    );
  }

  if (isHeadingTag(tagName)) {
    return (
      <ThemedHeading
        {...attrs}
        {...rootAttrs}
        level={tagName}
        className={cx(styles.htmlHeading, className)}
        style={style}
      >
        {children}
      </ThemedHeading>
    );
  }

  return React.createElement(definition.tagName, {
    ...attrs,
    ...rootAttrs,
    className,
    style,
  }, children);
}

function htmlAttributes(
  adapter: XmluiComponentAdapter,
  definition: HtmlTagDefinition,
): Record<string, unknown> {
  const booleanProps = new Set(booleanPropsByTag[definition.tagName] ?? []);
  const resourceUrlProps = new Set(resourceUrlPropsByTag[definition.tagName] ?? []);
  const attrs: Record<string, unknown> = {};
  for (const [rawName, value] of Object.entries(adapter.props)) {
    if (
      value === undefined ||
      value === null ||
      xmluiInternalProps.has(rawName) ||
      rawName.startsWith("on")
    ) {
      continue;
    }
    const name = htmlAttrName(rawName);
    if (booleanProps.has(rawName)) {
      attrs[name] = asBoolean(value);
    } else if (resourceUrlProps.has(rawName)) {
      attrs[name] = adapter.resourceUrl(value) ?? value;
    } else {
      attrs[name] = value;
    }
  }
  return attrs;
}

function htmlRootAttrs(
  adapter: XmluiComponentAdapter,
  htmlAttrs: Record<string, unknown>,
): Record<string, unknown> {
  const rootAttrs = { ...adapter.rootAttrs() };
  for (const name of Object.keys(htmlAttrs)) {
    if (name !== "className" && name !== "style") {
      delete rootAttrs[name];
    }
  }
  return rootAttrs;
}

function htmlAttrName(name: string): string {
  if (name === "class") {
    return "className";
  }
  if (name === "for") {
    return "htmlFor";
  }
  return name;
}

function isHeadingTag(tagName: string): tagName is "h1" | "h2" | "h3" | "h4" | "h5" | "h6" {
  return /^h[1-6]$/.test(tagName);
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value === "" || value === "true";
  }
  return Boolean(value);
}

function inlineStyle(value: unknown): CSSProperties | undefined {
  return typeof value === "object" && value !== null ? value as CSSProperties : undefined;
}

function mergeStyles(...styles: Array<unknown>): CSSProperties | undefined {
  const merged = Object.assign({}, ...styles.filter((style): style is CSSProperties =>
    typeof style === "object" && style !== null,
  ));
  return Object.keys(merged).length > 0 ? merged : undefined;
}

function cx(...classes: Array<string | undefined | false>): string | undefined {
  const className = classes.filter(Boolean).join(" ");
  return className || undefined;
}
