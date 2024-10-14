import { ModuleResolver } from "@abstractions/scripting/modules";
import { createXmlUiParser } from "../parsers/xmlui-parser/parser";
import type { Error } from "../parsers/xmlui-parser/parser";
import { nodeToComponentDef } from "../parsers/xmlui-parser/transform";

interface ErrorWithLineColInfo extends Error {
  line: number;
  col: number;
}

export function parseXmlUiMarkup(
  source: string,
  fileId: string | number = 0,
  moduleResolver?: ModuleResolver,
) {
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
      .map(
        (e) => `Error at line: ${e.line}, column: ${e.col}:\n   ${e.message}\n`,
      )
      .join("\n");
    throw new Error(errorMessages);
  }
  return nodeToComponentDef(node, getText, fileId, moduleResolver);
}

function addPositions(
  errors: Error[],
  newlinePositions: number[],
): ErrorWithLineColInfo[] {
  if (newlinePositions.length === 0) {
    for (let err of errors) {
      (err as ErrorWithLineColInfo).line = 1;
      (err as ErrorWithLineColInfo).col = err.pos + 1;
    }
    return errors as ErrorWithLineColInfo[];
  }

  for (let err of errors) {
    let i = 0;
    for (; i < newlinePositions.length; ++i) {
      const newlinePos = newlinePositions[i];
      if (err.pos < newlinePos) {
        (err as ErrorWithLineColInfo).line = i + 1;
        (err as ErrorWithLineColInfo).col =
          err.pos - (newlinePositions[i - 1] ?? 0) + 1;
        break;
      }
    }
    const lastNewlinePos = newlinePositions[newlinePositions.length - 1];
    if (err.pos >= lastNewlinePos) {
      (err as ErrorWithLineColInfo).line = newlinePositions.length + 1;
      (err as ErrorWithLineColInfo).col = err.pos - lastNewlinePos + 0;
    }
  }
  return errors as ErrorWithLineColInfo[];
}
