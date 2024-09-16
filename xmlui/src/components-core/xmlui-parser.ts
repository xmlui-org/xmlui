import { ModuleResolver } from "@abstractions/scripting/modules";
import { createXmlUiParser } from "@parsers/xmlui-parser/parser";
import { nodeToComponentDef } from "@parsers/xmlui-parser/transform";
import { DiagnosticCategory, ErrCodes } from "@parsers/xmlui-parser/diagnostics";
import { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import type { Error as ParseError } from "@parsers/xmlui-parser/parser";
import { ParserError } from "@parsers/xmlui-parser/ParserError"

interface ErrorWithLineColInfo extends ParseError {
  line: number;
  col: number;
}

/** Finding any error while parsing / transforming will result
 * in a custom error reporting component being returned with the errors inside it.
 * If that process fails (which is a bug), it will throw.*/
export function componentFromXmlUiMarkup(
  source: string,
  fileId: string | number = 0,
  moduleResolver?: ModuleResolver,
) {
  const { errors, component } = parseXmlUiMarkup(source, fileId, moduleResolver);
  if (errors.length === 0) {
    return component;
  }
  const errReportComponentSource = errReportSourceFromErrors(errors);

  const { errors: errReportErrors, component: errReportComponent } = parseXmlUiMarkup(
    errReportComponentSource,
    fileId,
    moduleResolver,
  );
  if (errReportErrors.length === 0) {
    return errReportComponent;
  }
  throw new Error(
    "Error in the error reporting process. This is definitely a bug. Here are the raw errors encountered while processing the xmlui markup:\n\n" +
      errors.map(errToStr) +
      "\n\nAnd here are the errors that caused the reporting to broke:\n\n" +
      errReportErrors.map(errToStr),
  );
}

export function parseXmlUiMarkup(
  source: string,
  fileId: string | number = 0,
  moduleResolver?: ModuleResolver,
): { component: null | ComponentDef | CompoundComponentDef; errors: ErrorWithLineColInfo[] } {
  const { parse, getText } = createXmlUiParser(source);
  const { node, errors } = parse();

  if (errors.length > 0) {
    const newlinePositions = [];
    for (let i = 0; i < source.length; ++i) {
      if (source[i] === "\n") {
        newlinePositions.push(i);
      }
    }
    const errorsWithLines = addPositions(errors, newlinePositions);
    return { component: null, errors: errorsWithLines };
  }
  try {
    return { component: nodeToComponentDef(node, getText, fileId, moduleResolver), errors: [] };
  } catch (e) {
    const singleErr: ErrorWithLineColInfo = {
      message: (e as ParserError).message,
      col: 0,
      line: 0,
      code: ErrCodes.expEq,
      category: DiagnosticCategory.Error,
      pos: 0,
      end: 0,
    };
    return {
      component: null,
      errors: [singleErr],
    };
  }
}

function addPositions(errors: ParseError[], newlinePositions: number[]): ErrorWithLineColInfo[] {
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
        (err as ErrorWithLineColInfo).col = err.pos - (newlinePositions[i - 1] ?? 0) + 1;
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

function errToStr(e: ErrorWithLineColInfo) {
  return `Error at line ${e.line}, column ${e.col}:\n    ${e.message}`;
}

function errReportSourceFromErrors(errors: ErrorWithLineColInfo[]) {
  const errStrList = errors
    .map((e) => {
      `<Text value="${errToStr(e)}"/>`;
    })
    .join();
  const errReportComponentSource = `
  <VStack>
    <H1>Error while processing xmlui markup.</H1>
    <VStack>
      ${errStrList}
    </VStack>
  </VStack>`;
  return errReportComponentSource;
}
