import { createHighlighterCoreSync, type DecorationItem } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// @ts-ignore
import js from "@shikijs/langs/javascript";
// @ts-ignore
import ts from "@shikijs/langs/typescript";
// @ts-ignore
import scss from "@shikijs/langs/scss";
// @ts-ignore
import css from "@shikijs/langs/css";
// @ts-ignore
import json from "@shikijs/langs/json";
// @ts-ignore
import html from "@shikijs/langs/html";

import { xmluiGrammar, xmluiThemeLight, xmluiThemeDark } from "xmlui/syntax/textmate";
import { createCustomLanguageRegistry } from "./customHighlighter";
import type { CustomSyntaxDecoration } from "./customHighlighter";
import { z80AssemblyLanguage } from "./demo/z80Highlighter";

export const shikiHighlighter = createHighlighterCoreSync({
  // @ts-ignore
  langs: [js, ts, json, html, xmluiGrammar, css, scss],
  // @ts-ignore
  themes: [xmluiThemeLight, xmluiThemeDark],
  engine: createJavaScriptRegexEngine(),
});

export const customLanguageRegistry = createCustomLanguageRegistry([z80AssemblyLanguage]);

export const docsCodeHighlighter = {
  availableLangs: [
    ...shikiHighlighter.getLoadedLanguages(),
    ...customLanguageRegistry.availableLangs,
  ],
  highlight,
};

export function highlight(
  code: string,
  lang: string,
  meta?: Record<string, any>,
  themeTone: "dark" | "light" = "light",
): string {
  if (!code) return "";
  if (!themeTone) themeTone = "light";
  if (!["dark", "light"].includes(themeTone)) {
    themeTone = "light";
  }

  const highlightedRows: DecorationItem[] =
    meta?.highlightRows?.map((row: DecorationItem) => {
      return {
        start: row.start,
        end: row.end,
        properties: row.properties,
      };
    }) ?? [];

  const highlightedSubstrings: DecorationItem[] =
    [...(meta?.highlightSubstringsEmphasized ?? []), ...(meta?.highlightSubstrings ?? [])]?.map(
      (str: DecorationItem) => {
        return {
          start: str.start,
          end: str.end,
          properties: str.properties,
        };
      },
    ) ?? [];

  const decorations = [...highlightedRows, ...highlightedSubstrings];
  const customDecorations = decorations.flatMap(toCustomSyntaxDecoration);

  const opts = {
    lang,
    theme: `xmlui-${themeTone}`,
    decorations,
  };
  const customHighlightedCode = customLanguageRegistry.highlight(code, {
    lang,
    themeTone,
    decorations: customDecorations,
  });
  if (customHighlightedCode) {
    return customHighlightedCode;
  }

  return shikiHighlighter.codeToHtml(code, opts);
}

function toCustomSyntaxDecoration(decoration: DecorationItem): CustomSyntaxDecoration[] {
  if (typeof decoration.start !== "number" || typeof decoration.end !== "number") {
    return [];
  }

  return [
    {
      start: decoration.start,
      end: decoration.end,
      properties: {
        class: getStringProperty(decoration.properties, "class"),
        style: getStringProperty(decoration.properties, "style"),
      },
    },
  ];
}

function getStringProperty(properties: DecorationItem["properties"], key: string) {
  const value = properties?.[key];
  return typeof value === "string" ? value : undefined;
}
