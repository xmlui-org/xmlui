import React, { type CSSProperties } from "react";

import { htmlTagDefinitions, type HtmlTagDefinition } from "../../component-core/htmlTags";
import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";

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

export const htmlTagMetadata: Record<string, ComponentMetadata> = Object.fromEntries(
  htmlTagDefinitions.map((definition) => [
    definition.name,
    createMetadata({
      status: "deprecated",
      description: `This component renders an HTML \`${definition.tagName}\` tag.`,
      isHtmlTag: true,
      allowArbitraryProps: true,
      props: {
        testId: {
          description: "Adds a test identifier to the rendered HTML element.",
          valueType: "string",
        },
      },
      themeVars: {
        [`width-${definition.metadataName}`]: `Sets the rendered ${definition.tagName} width.`,
      },
    }),
  ]),
);

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
    renderer: ({ adapter }) => {
      const attrs = htmlAttributes(adapter);
      const rootAttrs = adapter.rootAttrs();
      const style = {
        ...(rootAttrs.style as CSSProperties | undefined),
        ...htmlTagCssVariables(definition),
        ...inlineStyle(adapter.props.style),
      };
      const children = definition.voidElement ? undefined : adapter.renderChildren();

      return React.createElement(definition.tagName, {
        ...attrs,
        ...rootAttrs,
        className: cx("htmlTag", adapter.className, attrs.className as string | undefined),
        style,
      }, children);
    },
  });
}

function htmlAttributes(adapter: XmluiComponentAdapter): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(adapter.props)
      .filter(([name, value]) =>
        value !== undefined &&
        value !== null &&
        !xmluiInternalProps.has(name) &&
        !name.startsWith("on"),
      )
      .map(([name, value]) => [name === "class" ? "className" : name, value]),
  );
}

function htmlTagCssVariables(definition: HtmlTagDefinition): CSSProperties {
  return {
    "--xmlui-current-width-HtmlTag": `var(--xmlui-width-${definition.metadataName})`,
  } as CSSProperties;
}

function inlineStyle(value: unknown): CSSProperties | undefined {
  return typeof value === "object" && value !== null ? value as CSSProperties : undefined;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
