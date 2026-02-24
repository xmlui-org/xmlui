import { createHighlighterCoreSync, type DecorationItem } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// @ts-ignore
import js from "@shikijs/langs/javascript";
// @ts-ignore
import scss from "@shikijs/langs/scss";
// @ts-ignore
import css from "@shikijs/langs/css";
// @ts-ignore
import json from "@shikijs/langs/json";
// @ts-ignore
import html from "@shikijs/langs/html";

import { xmluiGrammar, xmluiThemeLight, xmluiThemeDark } from "xmlui/syntax/textmate";

export const shikiHighlighter = createHighlighterCoreSync({
  // @ts-ignore
  langs: [js, json, html, xmluiGrammar, css, scss],
  // @ts-ignore
  themes: [xmluiThemeLight, xmluiThemeDark],
  engine: createJavaScriptRegexEngine(),
});

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

  const opts = {
    lang,
    theme: `xmlui-${themeTone}`,
    decorations: [...highlightedRows, ...highlightedSubstrings],
  };
  return shikiHighlighter.codeToHtml(code, opts);
}
