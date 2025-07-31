import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";
import { createXmlUiParser } from "../parsers/xmlui-parser/parser";
import { nodeToComponentDef } from "../parsers/xmlui-parser/transform";
import { DiagnosticCategory, ErrCodes } from "../parsers/xmlui-parser/diagnostics";
import type { GetText, Error as ParseError } from "../parsers/xmlui-parser/parser";
import type { ParserError } from "../parsers/xmlui-parser/ParserError";
import { SyntaxKind } from "../parsers/xmlui-parser/syntax-kind";
import type { Node } from "../parsers/xmlui-parser/syntax-node";
import type { ScriptParserErrorMessage } from "../abstractions/scripting/ScriptParserError";
import type { ModuleErrors } from "./script-runner/ScriptingSourceTree";

interface ErrorForDisplay extends ParseError {
  contextStartLine: number;
  contextSource: string;
  errPosLine: number;
  errPosCol: number;
}

export function xmlUiMarkupToComponent(
  source: string,
  fileId: string | number = 0,
): {
  component: null | ComponentDef | CompoundComponentDef;
  errors: ErrorForDisplay[];
  erroneousCompoundComponentName?: string;
} {
  const { parse, getText } = createXmlUiParser(source);
  const { node, errors } = parse();
  if (errors.length > 0) {
    const newlinePositions = [];
    for (let i = 0; i < source.length; ++i) {
      if (source[i] === "\n") {
        newlinePositions.push(i);
      }
    }
    const errorsForDisplay = addDisplayFieldsToErrors(errors, source, newlinePositions);
    const erroneousCompoundComponentName = getCompoundCompName(node, getText);
    return { component: null, errors: errorsForDisplay, erroneousCompoundComponentName };
  }
  try {
    const component = nodeToComponentDef(node, getText, fileId);
    const transformResult = { component, errors: [] };
    return transformResult;
  } catch (e) {
    const erroneousCompoundComponentName = getCompoundCompName(node, getText);
    const singleErr: ErrorForDisplay = {
      message: (e as ParserError).message,
      errPosCol: 0,
      errPosLine: 0,
      code: ErrCodes.expEq,
      category: DiagnosticCategory.Error,
      pos: 0,
      end: 0,
      contextPos: 0,
      contextEnd: 0,
      contextSource: "",
      contextStartLine: 0,
    };
    return {
      component: null,
      erroneousCompoundComponentName,
      errors: [singleErr],
    };
  }
}

/** returns a component definition containing the errors.
 * It is a component and a compound component definition at the same time,
 * so that it can be used to render the errors for a compound component as well*/
export function errReportMessage(message: string) {
  function makeComponent() {
    const comp: ComponentDef = {
      type: "VStack",
      props: { padding: "$padding-normal", gap: 0 },
      children: [
        {
          type: "H1",
          props: {
            value: message,
            padding: "$padding-normal",
            backgroundColor: "$color-error",
            color: "white",
          },
        },
      ],
    };
    return comp;
  }
  const comp = makeComponent() as any;
  comp.component = makeComponent();
  return comp;
}

/** returns a component definition containing the errors.
 * It is a component and a compound component definition at the same time,
 * so that it can be used to render the errors for a compound component as well*/
export function errReportComponent(
  errors: ErrorForDisplay[],
  fileName: number | string,
  compoundCompName: string | undefined,
) {
  function makeComponent() {
    const errList = errors
      .sort((a, b) => {
        if (a.pos === undefined && b.pos === undefined) {
          return 0;
        } else if (a.pos === undefined) {
          return 1;
        } else if (b.pos === undefined) {
          return -1;
        } else {
          return a.pos - b.pos;
        }
      })
      .map((e, idx) => {
        return {
          type: "VStack",
          props: { gap: "0px" },
          children: [
            {
              type: "HStack",
              props: { gap: "0" },
              children: [
                {
                  type: "Text",
                  props: {
                    value: `#${idx + 1}: ${fileName} (${e.errPosLine}:${e.errPosCol}):\xa0`,
                    color: "$color-info",
                  },
                },
                {
                  type: "Text",
                  props: { value: ` ${e.message}`, fontWeight: "bold" },
                },
              ],
            },
          ],
        };
      });
    const comp: ComponentDef = {
      type: "VStack",
      props: { padding: "$padding-normal", gap: 0 },
      children: [
        {
          type: "H1",
          props: {
            value: `${errList.length} ${errList.length > 1 ? "Errors" : "Error"} found while processing XMLUI markup`,
            padding: "$padding-normal",
            backgroundColor: "$color-error",
            color: "white",
          },
        },
        {
          type: "VStack",
          props: {
            gap: "$gap-tight",
            padding: "$padding-normal",
          },
          children: errList,
        },
      ],
    };
    return comp;
  }
  const comp = makeComponent() as any;
  comp.name = compoundCompName;
  comp.component = makeComponent();
  return comp;
}

/** returns a component definition containing the errors.
 * It is a component and a compound component definition at the same time,
 * so that it can be used to render the errors for a compound component as well*/
export function errReportScriptError(error: ScriptParserErrorMessage, fileName: number | string) {
  function makeComponent() {
    const comp: ComponentDef = {
      type: "VStack",
      props: { padding: "$padding-normal", gap: 0 },
      children: [
        {
          type: "H1",
          props: {
            value: `An error found while processing XMLUI code-behind script`,
            padding: "$padding-normal",
            backgroundColor: "$color-error",
            color: "white",
          },
        },
        {
          type: "VStack",
          props: {
            gap: "$gap-tight",
            padding: "$padding-normal",
          },
          children: [
            {
              type: "HStack",
              props: { gap: "0" },
              children: [
                {
                  type: "Text",
                  props: {
                    value: `${fileName} (${error.line}:${error.column}):\xa0`,
                    color: "$color-info",
                  },
                },
                {
                  type: "Text",
                  props: { value: ` ${error.text}`, fontWeight: "bold" },
                },
              ],
            },
          ],
        },
      ],
    };
    return comp;
  }
  const comp = makeComponent() as any;
  comp.component = makeComponent();
  return comp;
}

/** returns a component definition containing the errors.
 * It is a component and a compound component definition at the same time,
 * so that it can be used to render the errors for a compound component as well*/
export function errReportModuleErrors(errors: ModuleErrors, fileName: number | string) {
  function makeComponent() {
    const errList: ComponentDef[] = [];
    let idx = 1;
    Object.keys(errors).map((key) => {
      const e = errors[key];
      for (let err of e) {
        errList.push({
          type: "VStack",
          props: { gap: "0px" },
          children: [
            {
              type: "HStack",
              props: { gap: "0" },
              children: [
                {
                  type: "Text",
                  props: {
                    value: `#${idx++}: ${fileName} (${err.line}:${err.column}):\xa0`,
                    color: "$color-info",
                  },
                },
                {
                  type: "Text",
                  props: { value: ` ${err.text}`, fontWeight: "bold" },
                },
              ],
            },
          ],
        });
      }
    });
    const comp: ComponentDef = {
      type: "VStack",
      props: { padding: "$padding-normal", gap: 0 },
      children: [
        {
          type: "H1",
          props: {
            value: `${errList.length} ${errList.length > 1 ? "Errors" : "Error"} found while processing XMLUI code-behind script`,
            padding: "$padding-normal",
            backgroundColor: "$color-error",
            color: "white",
          },
        },
        {
          type: "VStack",
          props: {
            gap: "$gap-tight",
            padding: "$padding-normal",
          },
          children: errList,
        },
      ],
    };
    return comp;
  }
  const comp = makeComponent() as any;
  comp.component = makeComponent();
  return comp;
}

/**
 * Converts a position in a string to a line and column number.
 * @param offset the offset of the position in the string
 * @param newlinePositions the offsets of the newlines in the string in ascending order
 */
function offsetToPosition(
  offset: number,
  newlinePositions: number[],
): { line: number; col: number } {
  let left = 0;
  let right = newlinePositions.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (newlinePositions[mid] < offset) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  let line = left + 1;
  let col = left === 0 ? offset + 1 : offset - newlinePositions[left - 1];

  return { line, col };
}

function getCompoundCompName(node: Node, getText: GetText) {
  const rootTag = node?.children?.[0];
  const rootTagNameTokens = rootTag?.children?.find(
    (c) => c.kind === SyntaxKind.TagNameNode,
  )?.children;
  const rootTagName = rootTagNameTokens?.[rootTagNameTokens.length - 1];

  if (rootTagName === undefined || getText(rootTagName) !== "Component") {
    return undefined;
  }

  const attrs = rootTag.children?.find((c) => c.kind === SyntaxKind.AttributeListNode)?.children;
  const nameAttrTokens = attrs?.find(
    (c) => c.kind === SyntaxKind.AttributeNode && getText(c?.children[0]) === "name",
  )?.children;
  const nameValueToken = nameAttrTokens?.[nameAttrTokens.length - 1];
  if (nameValueToken !== undefined && nameValueToken.kind === SyntaxKind.StringLiteral) {
    const strLit = getText(nameValueToken);
    return strLit.substring(1, strLit.length - 1);
  }
  return undefined;
}
function addDisplayFieldsToErrors(
  errors: ParseError[],
  source: string,
  newlinePositions: number[],
): ErrorForDisplay[] {
  return errors.map((err) => {
    const { line: errPosLine, col: errPosCol } = offsetToPosition(err.pos, newlinePositions);
    const { line: contextStartLine } = offsetToPosition(err.contextPos, newlinePositions);

    return {
      ...err,
      errPosLine,
      errPosCol,
      contextStartLine,
      contextSource: source.substring(err.contextPos, err.contextEnd),
    };
  });
}
