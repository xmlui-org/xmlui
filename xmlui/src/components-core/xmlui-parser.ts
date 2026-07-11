import type { ComponentDef } from "../abstractions/ComponentDefs";
import { parseXmlui } from "../compiler/parseXmlui";

type ParserError = {
  message: string;
};

export function xmlUiMarkupToComponent(markup: string): {
  errors: ParserError[];
  component: ComponentDef | ComponentDef[] | null;
  erroneousCompoundComponentName?: string;
} {
  try {
    const trimmed = markup.trim();
    const document = trimmed.startsWith("<Component")
      ? parseXmlui(trimmed, { sourceId: "included.xmlui" })
      : parseXmlui(`<Component name="IncludedMarkup">${trimmed}</Component>`, {
          sourceId: "included.xmlui",
        });
    return {
      errors: [],
      component: document.root as unknown as ComponentDef,
    };
  } catch (error) {
    return {
      errors: [{ message: error instanceof Error ? error.message : String(error) }],
      component: null,
    };
  }
}

export function errReportComponent(
  errors: ParserError[],
  url?: string,
  erroneousCompoundComponentName?: string,
): ComponentDef {
  const message = [
    `Could not include markup${url ? ` from ${url}` : ""}.`,
    erroneousCompoundComponentName ? `Component: ${erroneousCompoundComponentName}.` : "",
    errors.map((error) => error.message).join("; "),
  ].filter(Boolean).join(" ");
  return {
    type: "Text",
    props: { value: message },
  };
}
