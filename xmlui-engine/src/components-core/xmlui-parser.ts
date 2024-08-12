import { ModuleResolver } from "./script-runner/BindingTreeEvaluationContext";
import { UemlParser } from "../parsers/ueml/UemlParser";
import { createXmlUiParser } from "../parsers/xmlui-parser/parser";
import type { Error } from "../parsers/xmlui-parser/parser";
import { nodeToComponentDef } from "../parsers/xmlui-parser/transform";

interface ErrorWithLineColInfo extends Error {
  line: number;
  col: number;
}

export function parseXmlUiMarkup(source: string, moduleResolver?: ModuleResolver, useOldParser = false) {
  if (useOldParser) {
    const parser = new UemlParser(source, moduleResolver);
    return parser.transformToComponentDef();
  } else {
    const { parse, getText } = createXmlUiParser(source);
    const { node, errors } = parse();
    if (errors.length > 0) {
      const newlinePositions = [];
      for (let i = 0; i < source.length; ++i) {
        if (source[i] === "\n") {
          newlinePositions.push(i);
        }
      }
      const errorWithLines = addPositions(errors, newlinePositions);
      const errorMessages = errorWithLines
        .map((e) => `Error at line ${e.line}, column:${e.col}:\n   ${e.message}\n`)
        .join("\n");
      throw new Error(errorMessages);
    }
    return nodeToComponentDef(node, getText, moduleResolver);
  }
}

function addPositions(errors: Error[], newlinePositions: number[]): ErrorWithLineColInfo[] {
  if (newlinePositions.length === 0) {
    for (let err of errors) {
      (err as ErrorWithLineColInfo).line = 1;
      (err as ErrorWithLineColInfo).col = err.pos + 1;
    }
    return errors as ErrorWithLineColInfo[];;
  }

  for (let err of errors) {
    for (let i = 0; i < newlinePositions.length; ++i) {
      const newlinePos = newlinePositions[i];
      if (err.pos < newlinePos) {
        (err as ErrorWithLineColInfo).line = i + 1;
        (err as ErrorWithLineColInfo).col = err.pos - (newlinePositions[i - 1] ?? 0) + 1;
        break;
      }
    }
  }
  return errors as ErrorWithLineColInfo[];
}
