import { nodeToComponentDef } from "@parsers/xmlui-parser/transform";
import type {
  ComponentDef,
  CompoundComponentDef,
} from "@abstractions/ComponentDefs";
import { createXmlUiParser, ParseResult } from "@parsers/xmlui-parser/parser";
import type { GetText } from "@parsers/xmlui-parser/parser";
import { toDbgString } from "@parsers/xmlui-parser/utils";

export function transformSource(
  source: string,
  fileId?: number,
  printRes: boolean = false,
): ComponentDef | CompoundComponentDef | null {
  const { getText, parse } = createXmlUiParser(source);
  const { node, errors } = parse();
  if (printRes) {
    console.log(toDbgString(node, getText));
    console.log(
      "errors: \n[\n" +
        errors.map((e) => e.message + ` @${e.pos}`).join(";\n") +
        "\n]\n",
    );
  }
  if (errors.length > 0) {
    // return {errors}
    throw new Error(errors[0].message);
  }
  return nodeToComponentDef(node, getText, fileId ?? 0);
}

export function parseSource(
  source: string,
  printRes: boolean = false,
): ParseResult & { getText: GetText } {
  const parser = createXmlUiParser(source);
  const parseRes = parser.parse();

  if (printRes) {
    console.log(toDbgString(parseRes.node, parser.getText));
    console.log(
      "errors: \n[\n" +
        parseRes.errors.map((e) => e.message + ` @${e.pos}`).join(";\n") +
        "\n]\n",
    );
  }
  return { ...parseRes, getText: parser.getText };
}
