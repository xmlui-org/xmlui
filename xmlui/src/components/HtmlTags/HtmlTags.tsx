import React, { type CSSProperties } from "react";

import { htmlTagDefinitions, type HtmlTagDefinition } from "../../component-core/htmlTags";
import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { componentMetadataToContract } from "../../component-core/metadata/contract";
import { wrapComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { resolveThemeReferences, resolveThemeVariable } from "../../styling/theme";
import type { XmluiComponentContract } from "../../compiler/contracts";
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

export const htmlTagContracts: XmluiComponentContract[] = htmlTagDefinitions.map((definition) =>
  componentMetadataToContract(htmlTagMetadata[definition.name], {
    name: definition.name,
    acceptsArbitraryProps: true,
    includeLayoutProps: true,
  }),
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
      const themeVariables = useThemeVariables();
      const attrs = htmlAttributes(adapter);
      const style = {
        ...adapter.style,
        ...htmlThemeStyle(definition, themeVariables),
        ...inlineStyle(adapter.props.style),
      };
      const children = definition.voidElement ? undefined : adapter.renderChildren();

      return React.createElement(definition.tagName, {
        ...attrs,
        ...adapter.rootAttrs(),
        className: adapter.className,
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

function htmlThemeStyle(
  definition: HtmlTagDefinition,
  themeVariables: Record<string, unknown>,
): CSSProperties {
  const width = themeValue(themeVariables, `width-${definition.metadataName}`);
  return width ? { width } : {};
}

function inlineStyle(value: unknown): CSSProperties | undefined {
  return typeof value === "object" && value !== null ? value as CSSProperties : undefined;
}

function themeValue(themeVariables: Record<string, unknown>, name: string): string | undefined {
  const value = resolveThemeVariable(name, [themeVariables]);
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(resolveThemeReferences(value));
}
