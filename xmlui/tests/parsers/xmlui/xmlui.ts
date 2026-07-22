import {
  nodeToComponentDef,
  nodeToXmluiAppParts,
} from "../../../src/parsers/xmlui-parser/transform";
import type { ComponentDef, CompoundComponentDef } from "../../../src/abstractions/ComponentDefs";
import { createXmlUiParser } from "../../../src/parsers/xmlui-parser/parser";
import type {
  GetText,
  ParseResult,
  XmluiParserOptions,
} from "../../../src/parsers/xmlui-parser/parser";
import { toDbgString } from "../../../src/parsers/xmlui-parser/utils";
import { DocumentCursor } from "../../../src/language-server/base/text-document";
import type { XmluiAppParts } from "../../../src/parsers/xmlui-parser/transform";

export function transformSource(
  source: string,
  fileId?: number,
  printRes: boolean = false,
  warnings?: string[],
  options: XmluiParserOptions = {},
): ComponentDef | CompoundComponentDef | undefined {
  const { getText, parse } = createXmlUiParser(source, options);
  const { node, errors } = parse();
  if (printRes) {
    console.log(toDbgString(node, getText));
    console.log(
      "errors: \n[\n" + errors.map((e) => e.message + ` @${e.pos}`).join(";\n") + "\n]\n",
    );
  }
  if (errors.length > 0) {
    // return {errors}
    throw new Error(`${errors[0].code}: ${errors[0].message}`);
  }
  const cursor = new DocumentCursor(source);
  return nodeToComponentDef(node, getText, fileId ?? 0, undefined, warnings, cursor, options);
}

export function transformEntryPointSource(
  source: string,
  fileId?: number,
  printRes: boolean = false,
  warnings?: string[],
): XmluiAppParts {
  const { getText, parse } = createXmlUiParser(source, { role: "entrypoint" });
  const { node, errors } = parse();
  if (printRes) {
    console.log(toDbgString(node, getText));
    console.log(
      "errors: \n[\n" + errors.map((e) => e.message + ` @${e.pos}`).join(";\n") + "\n]\n",
    );
  }
  if (errors.length > 0) {
    throw new Error(`${errors[0].code}: ${errors[0].message}`);
  }
  const cursor = new DocumentCursor(source);
  return nodeToXmluiAppParts(node, getText, fileId ?? 0, undefined, warnings, cursor);
}

export function parseSource(
  source: string,
  printRes: boolean = false,
  options: XmluiParserOptions = {},
): ParseResult & { getText: GetText } {
  const parser = createXmlUiParser(source, options);
  const parseRes = parser.parse();

  if (printRes) {
    console.log(toDbgString(parseRes.node, parser.getText));
    console.log(
      "errors: \n[\n" + parseRes.errors.map((e) => e.message + ` @${e.pos}`).join(";\n") + "\n]\n",
    );
  }
  return { ...parseRes, getText: parser.getText };
}
